-- AI Agent Output Schema
-- This table stores AI agent workflow output data in a flexible JSON format
-- to accommodate various analysis structures and future schema changes

CREATE TABLE IF NOT EXISTS ai_agent_output (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id VARCHAR(255) NOT NULL,
    analysis_type VARCHAR(100) NOT NULL, -- e.g., 'market_analysis', 'price_prediction', 'risk_assessment'
    agent_version VARCHAR(50) NOT NULL,  -- To track different versions of AI agent output
    workflow_id VARCHAR(255),             -- To group related analysis steps
    step_number INTEGER,                  -- Order of steps in a multi-step analysis

    -- Main JSON data structure - flexible to accommodate various analysis formats
    output_data JSONB NOT NULL,

    -- Step completion indicator
    is_last_step BOOLEAN DEFAULT FALSE,  -- Indicates if this is the final step in a workflow

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    block_number BIGINT,                  -- Related blockchain block if applicable
    transaction_hash VARCHAR(66),        -- Related transaction if applicable

    -- No additional constraints needed
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
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ai_agent_output_updated_at
    BEFORE UPDATE ON ai_agent_output
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_agent_output_updated_at();

-- Example queries for common use cases:
--
-- 1. Get latest analysis for a specific market:
-- SELECT * FROM ai_agent_output
-- WHERE market_id = 'SOME_MARKET_ID'
-- ORDER BY created_at DESC
-- LIMIT 1;
--
-- 2. Get final steps in workflows:
-- SELECT * FROM ai_agent_output
-- WHERE is_last_step = TRUE
-- ORDER BY created_at DESC;
--
-- 3. Query step_output data for bid/ask information:
-- SELECT market_id, output_data->'step_output' as step_output
-- FROM ai_agent_output
-- WHERE output_data ? 'step_output'
-- ORDER BY created_at DESC;
--
-- 4. Query JSON data for specific fields:
-- SELECT market_id, output_data->'rationale' as rationale
-- FROM ai_agent_output
-- WHERE output_data->>'topic' = 'economic_indicators';
--
-- 5. Get workflow steps in order:
-- SELECT * FROM ai_agent_output
-- WHERE workflow_id = 'workflow_123'
-- ORDER BY step_number ASC;

-- Example data structures that this schema can accommodate:
--
-- 1. Analysis step with reasoning:
-- {
--   "topic": "market_analysis",
--   "rationale": "Analysis of latest market conditions...",
--   "factors": [
--     {
--       "factor": "market_sentiment",
--       "impact": "positive",
--       "weight": 0.4
--     }
--   ]
-- }
--
-- 2. Final step with bid/ask output:
-- {
--   "step_output": {
--     "yes_bid": 17.5,
--     "yes_bid_size": 10,
--     "yes_ask": 22.5,
--     "yes_ask_size": 10,
--     "no_bid": 77.5,
--     "no_bid_size": 40,
--     "no_ask": 82.5,
--     "no_ask_size": 40,
--     "reasoning": "Given the fair price of 20.00¢ and recommended spread of 5.00¢, the YES bid is calculated as 20 - (5/2) = 17.5 and the YES ask as 20 + (5/2) = 22.5. For NO, the bid is 100 - 22.5 = 77.5 and the ask is 100 - 17.5 = 82.5."
--   },
--   "metadata": {
--     "analysis_date": "2025-11-22",
--     "model_version": "v2.1"
--   }
-- }