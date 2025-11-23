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

    -- Extracted fields for easier querying (can be populated via triggers or application logic)
    topics TEXT[],                        -- Array of extracted topic keywords
    stance VARCHAR(50),                   -- e.g., 'bullish', 'bearish', 'neutral'
    confidence_score DECIMAL(3,2),       -- 0.00 to 1.00 confidence level

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    block_number BIGINT,                  -- Related blockchain block if applicable
    transaction_hash VARCHAR(66),        -- Related transaction if applicable

    -- Indexes for common queries
    CONSTRAINT valid_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_market_id ON ai_agent_output(market_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_analysis_type ON ai_agent_output(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_workflow_id ON ai_agent_output(workflow_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_created_at ON ai_agent_output(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_stance ON ai_agent_output(stance) WHERE stance IS NOT NULL;

-- GIN index for JSON queries
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_data_gin ON ai_agent_output USING GIN(output_data);

-- Index for topics array
CREATE INDEX IF NOT EXISTS idx_ai_agent_output_topics ON ai_agent_output USING GIN(topics) WHERE topics IS NOT NULL;

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
-- 2. Get all analyses with specific topics:
-- SELECT * FROM ai_agent_output
-- WHERE topics && ARRAY['inflation', 'employment']
-- ORDER BY created_at DESC;
--
-- 3. Get analyses with high confidence bullish stance:
-- SELECT * FROM ai_agent_output
-- WHERE stance = 'bullish'
-- AND confidence_score > 0.8
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

-- Example data structure that this schema can accommodate:
-- {
--   "topic": "economic_indicators",
--   "rationale": "Analysis of latest employment and inflation data...",
--   "stance": "bearish",
--   "confidence": 0.85,
--   "factors": [
--     {
--       "factor": "unemployment_rate",
--       "impact": "negative",
--       "weight": 0.3
--     },
--     {
--       "factor": "inflation_trends",
--       "impact": "positive",
--       "weight": 0.7
--     }
--   ],
--   "predictions": {
--     "short_term": "downward_pressure",
--     "long_term": "stabilization"
--   },
--   "metadata": {
--     "data_sources": ["bls.gov", "fed.gov"],
--     "analysis_date": "2025-11-22",
--     "model_version": "v2.1"
--   }
-- }