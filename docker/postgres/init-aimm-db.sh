#!/usr/bin/env bash
set -e

# PostgreSQL Docker initialization script for AIMM project
# This script runs automatically when the container starts with an empty data directory
# It creates the necessary database and applies the AI agent output schema

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	-- Create the AIMM database if it doesn't exist
	SELECT 'CREATE DATABASE "aimm-fullstack"'
	WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'aimm-fullstack')\gexec
EOSQL

# Switch to the aimm-fullstack database and apply schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "aimm-fullstack" <<-EOSQL
	-- Enable necessary extensions
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

	-- AI Agent Output Schema v2
	-- Updated based on Kevin's feedback for better UI/streaming support
	-- This table stores AI agent workflow steps with stable envelope structure
	CREATE TABLE IF NOT EXISTS ai_agent_output (
	    -- Primary key: simple auto-incrementing id
	    id BIGSERIAL PRIMARY KEY,

	    -- Run and step identifiers
	    run_id VARCHAR(255) NOT NULL,            -- Stable identifier for the entire run
	    step_index INTEGER NOT NULL,             -- 1, 2, 3... (order within run)

	    -- Run-level metadata (Kevin's suggestion)
	    market_ticker VARCHAR(100),              -- Human-readable market ticker

	    -- Step-level envelope (minimal, Kevin's suggestion)
	    step_kind VARCHAR(100) NOT NULL,         -- "ANALYZE_RULES", "GATHER_NEWS", "COMPARE", etc.
	    step_loading BOOLEAN DEFAULT FALSE,      -- Whether this step is currently loading/processing

	    -- Main data - the existing step_output structure
	    step_output JSONB NOT NULL,              -- All the detailed step data (bid/ask, reasoning, etc.)

	    -- Optional display helpers (Kevin's suggestion)
	    headline TEXT,                           -- One short sentence for UI ("Research fair 40¢ from news")
	    summary TEXT,                            -- 1-2 sentence explanation for tooltips
	    direction VARCHAR(50),                   -- "lean_yes" | "lean_no" | "neutral" (for compare/final steps)

	    -- Run-level tracking
	    agent_version VARCHAR(50) NOT NULL,      -- AI agent version
	    model_version VARCHAR(50),               -- Model version used
	    confidence DECIMAL(3,2),                 -- 0.00 to 1.00 confidence level

	    -- Clear units/scales (Kevin's suggestion)
	    price_scale VARCHAR(50) DEFAULT 'cents', -- "cents", "probability_0_1", etc.

	    -- Timestamps (Kevin's suggestion for per-run)
	    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	    step_started_at TIMESTAMP WITH TIME ZONE,    -- When the step started processing
	    step_finished_at TIMESTAMP WITH TIME ZONE,   -- When the step finished processing

	    -- Constraints
	    CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
	    CONSTRAINT valid_step_index CHECK (step_index > 0),
	    CONSTRAINT valid_direction CHECK (direction IS NULL OR direction IN ('lean_yes', 'lean_no', 'neutral')),

	    -- Unique constraint to maintain the original composite key logic
	    CONSTRAINT unique_run_step UNIQUE (run_id, step_index)
	);

	-- Indexes optimized for UI queries (Kevin's use cases)
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_run_id ON ai_agent_output(run_id);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_ticker ON ai_agent_output(market_ticker);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_index ON ai_agent_output(step_index);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_kind ON ai_agent_output(step_kind);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_direction ON ai_agent_output(direction) WHERE direction IS NOT NULL;
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_run_created ON ai_agent_output(inserted_at DESC);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_started ON ai_agent_output(step_started_at DESC) WHERE step_started_at IS NOT NULL;
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_finished ON ai_agent_output(step_finished_at DESC) WHERE step_finished_at IS NOT NULL;

	-- Composite index for per-market views
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_run ON ai_agent_output(market_ticker, run_id, step_index);

	-- GIN index for JSON queries on step_output
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_output_gin ON ai_agent_output USING GIN(step_output);

	-- Function to notify on AI agent output changes (enhanced for streaming)
	CREATE OR REPLACE FUNCTION notify_ai_agent_output_change()
	RETURNS TRIGGER AS \$func\$
	DECLARE
	    notification JSON;
	BEGIN
	    -- Create notification payload optimized for UI streaming
	    notification = json_build_object(
	        'table', 'ai_agent_output',
	        'action', TG_OP,
	        'id', COALESCE(NEW.id, OLD.id),
	        'run_id', COALESCE(NEW.run_id, OLD.run_id),
	        'step_index', COALESCE(NEW.step_index, OLD.step_index),
	        'market_ticker', COALESCE(NEW.market_ticker, OLD.market_ticker),
	        'step_kind', COALESCE(NEW.step_kind, OLD.step_kind),
	        'step_loading', COALESCE(NEW.step_loading, OLD.step_loading),
	        'headline', COALESCE(NEW.headline, OLD.headline),
	        'direction', COALESCE(NEW.direction, OLD.direction),
	        'timestamp', EXTRACT(epoch FROM COALESCE(NEW.inserted_at, OLD.inserted_at)),
	        'step_started_at', EXTRACT(epoch FROM COALESCE(NEW.step_started_at, OLD.step_started_at)),
	        'step_finished_at', EXTRACT(epoch FROM COALESCE(NEW.step_finished_at, OLD.step_finished_at))
	    );

	    -- Send notification on the ai_agent_output channel
	    PERFORM pg_notify('ai_agent_output_changes', notification::text);

	    RETURN COALESCE(NEW, OLD);
	END;
	\$func\$ language 'plpgsql';

	-- Trigger to send notifications on ai_agent_output changes
	CREATE TRIGGER ai_agent_output_notify
	    AFTER INSERT OR UPDATE OR DELETE ON ai_agent_output
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ai_agent_output_change();

	-- Create a publication for logical replication (for external subscribers)
	CREATE PUBLICATION ai_agent_output_pub FOR TABLE ai_agent_output;

	-- Grant necessary permissions for replication
	ALTER USER postgres REPLICATION;

	-- Log completion
	DO \$\$
	BEGIN
	    RAISE NOTICE 'AIMM AI agent output schema initialized successfully';
	    RAISE NOTICE 'Table: ai_agent_output created with pub/sub triggers';
	    RAISE NOTICE 'Publication: ai_agent_output_pub created for logical replication';
	    RAISE NOTICE 'Notification channel: ai_agent_output_changes is active';
	END \$\$;
EOSQL

echo "AIMM database initialization completed successfully!"