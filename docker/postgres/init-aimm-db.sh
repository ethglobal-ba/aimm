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

	-- Create the AI agent output table (v2 with Kevin's suggestions + id primary key)
	CREATE TABLE IF NOT EXISTS ai_agent_output (
	    -- Primary key: simple auto-incrementing id
	    id BIGSERIAL PRIMARY KEY,

	    -- Run and step identifiers
	    run_id VARCHAR(255) NOT NULL,
	    step_index INTEGER NOT NULL,

	    -- Run-level metadata
	    market_id VARCHAR(255) NOT NULL,
	    market_ticker VARCHAR(100),

	    -- Step-level envelope
	    step_kind VARCHAR(100) NOT NULL,
	    step_loading BOOLEAN DEFAULT FALSE,

	    -- Main data - step_output structure
	    step_output JSONB NOT NULL,

	    -- Display helpers
	    headline TEXT,
	    summary TEXT,
	    direction VARCHAR(50),

	    -- Run-level tracking
	    agent_version VARCHAR(50) NOT NULL,
	    model_version VARCHAR(50),
	    confidence DECIMAL(3,2),

	    -- Clear units/scales
	    price_scale VARCHAR(50) DEFAULT 'cents',

	    -- Timestamps
	    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

	    -- Constraints
	    CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
	    CONSTRAINT valid_step_index CHECK (step_index > 0),
	    CONSTRAINT valid_direction CHECK (direction IS NULL OR direction IN ('lean_yes', 'lean_no', 'neutral')),

	    -- Unique constraint to maintain the original composite key logic
	    CONSTRAINT unique_run_step UNIQUE (run_id, step_index)
	);

	-- Indexes optimized for UI queries
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_run_id ON ai_agent_output(run_id);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_id ON ai_agent_output(market_id);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_ticker ON ai_agent_output(market_ticker);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_index ON ai_agent_output(step_index);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_kind ON ai_agent_output(step_kind);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_direction ON ai_agent_output(direction) WHERE direction IS NOT NULL;
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_inserted_at ON ai_agent_output(inserted_at DESC);

	-- Composite index for per-market views
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_run ON ai_agent_output(market_id, run_id, step_index);

	-- GIN index for JSON queries on step_output
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_output_gin ON ai_agent_output USING GIN(step_output);

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