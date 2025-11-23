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

	-- Create the AI agent output table
	CREATE TABLE IF NOT EXISTS ai_agent_output (
	    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	    market_id VARCHAR(255) NOT NULL,
	    analysis_type VARCHAR(100) NOT NULL,
	    agent_version VARCHAR(50) NOT NULL,
	    workflow_id VARCHAR(255),
	    step_number INTEGER,

	    -- Main JSON data structure - flexible to accommodate various analysis formats
	    output_data JSONB NOT NULL,

	    -- Step completion indicator
	    is_last_step BOOLEAN DEFAULT FALSE,

	    -- Metadata
	    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	    block_number BIGINT,
	    transaction_hash VARCHAR(66)
	);

	-- Indexes for performance
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_id ON ai_agent_output(market_id);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_analysis_type ON ai_agent_output(analysis_type);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_workflow_id ON ai_agent_output(workflow_id);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_created_at ON ai_agent_output(created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_is_last_step ON ai_agent_output(is_last_step) WHERE is_last_step = TRUE;

	-- GIN index for JSON queries
	CREATE INDEX IF NOT EXISTS idx_ai_agent_output_data_gin ON ai_agent_output USING GIN(output_data);

	-- Function to update the updated_at timestamp
	CREATE OR REPLACE FUNCTION update_ai_agent_output_updated_at()
	RETURNS TRIGGER AS \$\$
	BEGIN
	    NEW.updated_at = CURRENT_TIMESTAMP;
	    RETURN NEW;
	END;
	\$\$ language 'plpgsql';

	-- Trigger to automatically update updated_at
	CREATE TRIGGER update_ai_agent_output_updated_at
	    BEFORE UPDATE ON ai_agent_output
	    FOR EACH ROW
	    EXECUTE FUNCTION update_ai_agent_output_updated_at();

	-- Function to notify on AI agent output changes
	CREATE OR REPLACE FUNCTION notify_ai_agent_output_change()
	RETURNS TRIGGER AS \$\$
	DECLARE
	    notification JSON;
	BEGIN
	    -- Create notification payload with relevant data
	    notification = json_build_object(
	        'table', 'ai_agent_output',
	        'action', TG_OP,
	        'id', COALESCE(NEW.id, OLD.id),
	        'market_id', COALESCE(NEW.market_id, OLD.market_id),
	        'analysis_type', COALESCE(NEW.analysis_type, OLD.analysis_type),
	        'workflow_id', COALESCE(NEW.workflow_id, OLD.workflow_id),
	        'timestamp', EXTRACT(epoch FROM COALESCE(NEW.created_at, OLD.created_at))
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