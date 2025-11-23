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
	    step_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

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
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_run_created ON ai_agent_output(run_started_at DESC);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_created ON ai_agent_output(step_created_at DESC);

	-- Composite index for per-market views
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_run ON ai_agent_output(market_id, run_id, step_index);

	-- GIN index for JSON queries on step_output
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_step_output_gin ON ai_agent_output USING GIN(step_output);

	-- Function to notify on AI agent output changes (enhanced for streaming)
	CREATE OR REPLACE FUNCTION notify_ai_agent_output_change()
	RETURNS TRIGGER AS \$\$
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
	        'market_id', COALESCE(NEW.market_id, OLD.market_id),
	        'market_ticker', COALESCE(NEW.market_ticker, OLD.market_ticker),
	        'step_kind', COALESCE(NEW.step_kind, OLD.step_kind),
	        'headline', COALESCE(NEW.headline, OLD.headline),
	        'direction', COALESCE(NEW.direction, OLD.direction),
	        'timestamp', EXTRACT(epoch FROM COALESCE(NEW.step_created_at, OLD.step_created_at))
	    );

	    -- Send notification on the ai_agent_output channel
	    PERFORM pg_notify('ai_agent_output_changes', notification::text);

	    RETURN COALESCE(NEW, OLD);
	END;
	\$\$ language 'plpgsql';

	-- Trigger to send notifications on ai_agent_output changes
	CREATE TRIGGER ai_agent_output_notify
	    AFTER INSERT OR UPDATE OR DELETE ON ai_agent_output
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ai_agent_output_change();

	-- Generic notification function for all Ponder tables
	CREATE OR REPLACE FUNCTION notify_ponder_table_change()
	RETURNS TRIGGER AS \$\$
	DECLARE
	    notification JSON;
	    channel_name TEXT;
	BEGIN
	    -- Determine channel name from trigger table name
	    channel_name = TG_TABLE_NAME;

	    -- Create notification payload with operation and all row fields
	    IF TG_OP = 'DELETE' THEN
	        notification = json_build_object('operation', 'delete') || row_to_json(OLD);
	        PERFORM pg_notify(channel_name, notification::text);
	        RETURN OLD;
	    ELSIF TG_OP = 'INSERT' THEN
	        notification = json_build_object('operation', 'insert') || row_to_json(NEW);
	        PERFORM pg_notify(channel_name, notification::text);
	        RETURN NEW;
	    ELSIF TG_OP = 'UPDATE' THEN
	        notification = json_build_object('operation', 'update') || row_to_json(NEW);
	        PERFORM pg_notify(channel_name, notification::text);
	        RETURN NEW;
	    END IF;

	    RETURN NULL;
	END;
	\$\$ language 'plpgsql';

	-- Create triggers for all Ponder tables
	-- Market table
	CREATE TRIGGER market_notify
	    AFTER INSERT OR UPDATE OR DELETE ON market
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Market config table
	CREATE TRIGGER market_config_notify
	    AFTER INSERT OR UPDATE OR DELETE ON market_config
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Current price update table (renamed from price_update)
	CREATE TRIGGER current_price_update_notify
	    AFTER INSERT OR UPDATE OR DELETE ON current_price_update
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Fair market price update table (new)
	CREATE TRIGGER fair_market_price_update_notify
	    AFTER INSERT OR UPDATE OR DELETE ON fair_market_price_update
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Market status change table
	CREATE TRIGGER market_status_change_notify
	    AFTER INSERT OR UPDATE OR DELETE ON market_status_change
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Default config update table
	CREATE TRIGGER default_config_update_notify
	    AFTER INSERT OR UPDATE OR DELETE ON default_config_update
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Workflow result table
	CREATE TRIGGER workflow_result_notify
	    AFTER INSERT OR UPDATE OR DELETE ON workflow_result
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

	-- Ownership transfer table
	CREATE TRIGGER ownership_transfer_notify
	    AFTER INSERT OR UPDATE OR DELETE ON ownership_transfer
	    FOR EACH ROW
	    EXECUTE FUNCTION notify_ponder_table_change();

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