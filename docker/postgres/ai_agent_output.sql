-- AI Agent Output Schema v2
-- Updated based on Kevin's feedback for better UI/streaming support
-- This table stores AI agent workflow steps with stable envelope structure

CREATE TABLE IF NOT EXISTS ai_agent_output (
    -- Composite primary key: run_id + step_index
    run_id VARCHAR(255) NOT NULL,            -- Stable identifier for the entire run
    step_index INTEGER NOT NULL,             -- 1, 2, 3... (order within run)

    -- Run-level metadata (Kevin's suggestion)
    market_id VARCHAR(255) NOT NULL,         -- Market identifier
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
    run_started_at TIMESTAMP WITH TIME ZONE,  -- When the entire run started
    run_finished_at TIMESTAMP WITH TIME ZONE, -- When the entire run finished
    step_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Composite primary key
    PRIMARY KEY (run_id, step_index),

    -- Constraints
    CONSTRAINT valid_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    CONSTRAINT valid_step_index CHECK (step_index > 0),
    CONSTRAINT valid_direction CHECK (direction IS NULL OR direction IN ('lean_yes', 'lean_no', 'neutral'))
);

-- Indexes optimized for UI queries (Kevin's use cases)
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
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    -- Create notification payload optimized for UI streaming
    notification = json_build_object(
        'table', 'ai_agent_output',
        'action', TG_OP,
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
$$ language 'plpgsql';

-- Trigger to send notifications on ai_agent_output changes
CREATE TRIGGER ai_agent_output_notify
    AFTER INSERT OR UPDATE OR DELETE ON ai_agent_output
    FOR EACH ROW
    EXECUTE FUNCTION notify_ai_agent_output_change();

-- Create a publication for logical replication (for external subscribers)
CREATE PUBLICATION ai_agent_output_pub FOR TABLE ai_agent_output;

-- Grant necessary permissions for replication
ALTER USER postgres REPLICATION;

-- Example queries for Kevin's UI requirements:
--
-- 1. Get latest run for a specific market:
-- SELECT * FROM ai_agent_output
-- WHERE market_id = 'SOME_MARKET_ID'
-- ORDER BY run_started_at DESC, step_index ASC
-- LIMIT 10;
--
-- 2. Get live agent actions across all markets (global stream):
-- SELECT run_id, market_ticker, step_kind, headline, direction, step_created_at
-- FROM ai_agent_output
-- WHERE step_created_at > NOW() - INTERVAL '1 hour'
-- ORDER BY step_created_at DESC;
--
-- 3. Get final step results for direction analysis:
-- SELECT run_id, market_ticker, direction, step_output->'yes_bid' as yes_bid,
--        step_output->'reasoning' as reasoning
-- FROM ai_agent_output
-- WHERE step_kind = 'COMPARE' OR step_kind = 'FINAL_ORDERS'
-- AND direction IS NOT NULL
-- ORDER BY step_created_at DESC;
--
-- 4. Get complete workflow for a specific run:
-- SELECT step_index, step_kind, headline, summary, step_output
-- FROM ai_agent_output
-- WHERE run_id = 'specific_run_id'
-- ORDER BY step_index ASC;
--
-- 5. Query precomputed deltas in step_output:
-- SELECT market_ticker, step_output->'research_vs_yes_mid_delta_cents' as edge
-- FROM ai_agent_output
-- WHERE step_kind = 'COMPARE'
-- AND step_output ? 'research_vs_yes_mid_delta_cents'
-- ORDER BY step_created_at DESC;

-- Example data structures for step_output JSONB field:
--
-- 1. Analysis step:
-- {
--   "topic": "market_analysis",
--   "rationale": "Analysis based on recent news...",
--   "factors": [...]
-- }
--
-- 2. Final step with bid/ask (Kevin's original requirement):
-- {
--   "yes_bid": 17.5,
--   "yes_bid_size": 10,
--   "yes_ask": 22.5,
--   "yes_ask_size": 10,
--   "no_bid": 77.5,
--   "no_bid_size": 40,
--   "no_ask": 82.5,
--   "no_ask_size": 40,
--   "reasoning": "Given the fair price of 20.00¢...",
--   "research_vs_yes_mid_delta_cents": 37.5,
--   "research_vs_no_mid_delta_cents": -15.2
-- }
--
-- 3. Compare step with precomputed deltas:
-- {
--   "research_fair": 45.0,
--   "working_fair": 42.5,
--   "yes_mid": 40.0,
--   "no_mid": 60.0,
--   "research_vs_yes_mid_delta_cents": 5.0,
--   "research_vs_no_mid_delta_cents": -15.0,
--   "edge_analysis": "Positive edge on YES side"
-- }