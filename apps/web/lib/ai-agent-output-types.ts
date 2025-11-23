/**
 * AI Agent Output Table Types
 *
 * TypeScript definitions for the `ai_agent_output` PostgreSQL table.
 * This table stores the output and metadata from AI agent runs for market analysis.
 */

/**
 * Valid direction values for AI agent predictions.
 */
export type Direction = 'lean_yes' | 'lean_no' | 'neutral';

/**
 * Valid price scale options.
 * Default is 'cents'.
 */
export type PriceScale = 'cents' | string;

/**
 * Generic type for step_output JSONB field.
 * This can contain various structured data depending on the step_kind.
 */
export type StepOutput = Record<string, unknown>;

/**
 * Complete AI Agent Output record as stored in the database.
 *
 * Note: We model the logical schema here; runtime representations may vary
 * (for example, BIGSERIAL values may be returned as strings by the driver).
 */
export interface AIAgentOutput {
  /** Primary key, auto-incrementing */
  id: bigint;

  /** Identifier for the agent run session (max 255 chars) */
  run_id: string;

  /** Sequential step number within the run (must be > 0) */
  step_index: number;

  /** Market ticker symbol being analyzed (max 100 chars, optional) */
  market_ticker?: string;

  /** Type/category of the processing step (max 100 chars) */
  step_kind: string;

  /** Indicates if this step is currently being processed */
  step_loading?: boolean;

  /** Structured JSON data containing step results and metadata */
  step_output: StepOutput;

  /** Human-readable headline summarizing the step result */
  headline?: string;

  /** Detailed summary of the step outcome */
  summary?: string;

  /** AI agent's directional prediction */
  direction?: Direction;

  /** Version of the AI agent that generated this output */
  agent_version: string;

  /** Version of the underlying model used */
  model_version?: string;

  /** Confidence score between 0.00 and 1.00 */
  confidence?: number;

  /** Scale used for price calculations */
  price_scale?: PriceScale;

  /** Timestamp when record was inserted (defaults to CURRENT_TIMESTAMP) */
  inserted_at?: Date;

  /** Timestamp when the step processing began */
  step_started_at?: Date;

  /** Timestamp when the step processing completed */
  step_finished_at?: Date;
}

/**
 * Input type for creating new AI agent output records.
 * Omits auto-generated and optional timestamp fields.
 */
export interface CreateAIAgentOutput {
  run_id: string;
  step_index: number;
  market_ticker?: string;
  step_kind: string;
  step_loading?: boolean;
  step_output: StepOutput;
  headline?: string;
  summary?: string;
  direction?: Direction;
  agent_version: string;
  model_version?: string;
  confidence?: number;
  price_scale?: PriceScale;
  step_started_at?: Date;
  step_finished_at?: Date;
}

/**
 * Update type for modifying existing AI agent output records.
 * All fields are optional except those that shouldn't be changed.
 */
export interface UpdateAIAgentOutput {
  step_loading?: boolean;
  step_output?: StepOutput;
  headline?: string;
  summary?: string;
  direction?: Direction;
  model_version?: string;
  confidence?: number;
  price_scale?: PriceScale;
  step_finished_at?: Date;
}

/**
 * Query filters for searching AI agent output records.
 */
export interface AIAgentOutputFilters {
  run_id?: string;
  step_index?: number;
  market_ticker?: string;
  step_kind?: string;
  direction?: Direction;
  agent_version?: string;
  model_version?: string;
  confidence_min?: number;
  confidence_max?: number;
  inserted_after?: Date;
  inserted_before?: Date;
  step_started_after?: Date;
  step_started_before?: Date;
  step_finished_after?: Date;
  step_finished_before?: Date;
}

/**
 * Aggregated statistics for AI agent output analysis.
 */
export interface AIAgentOutputStats {
  total_records: number;
  unique_runs: number;
  unique_tickers: number;
  avg_confidence: number;
  direction_distribution: {
    lean_yes: number;
    lean_no: number;
    neutral: number;
  };
  step_kinds: Record<string, number>;
  agent_versions: Record<string, number>;
}

/**
 * Database constraints and validation rules.
 */
export const CONSTRAINTS = {
  /** Maximum length for run_id field */
  MAX_RUN_ID_LENGTH: 255,

  /** Maximum length for market_ticker field */
  MAX_MARKET_TICKER_LENGTH: 100,

  /** Maximum length for step_kind field */
  MAX_STEP_KIND_LENGTH: 100,

  /** Maximum length for direction field */
  MAX_DIRECTION_LENGTH: 50,

  /** Maximum length for agent_version field */
  MAX_AGENT_VERSION_LENGTH: 50,

  /** Maximum length for model_version field */
  MAX_MODEL_VERSION_LENGTH: 50,

  /** Maximum length for price_scale field */
  MAX_PRICE_SCALE_LENGTH: 50,

  /** Valid direction values */
  VALID_DIRECTIONS: ['lean_yes', 'lean_no', 'neutral'] as const,

  /** Confidence must be between 0 and 1 */
  CONFIDENCE_MIN: 0,
  CONFIDENCE_MAX: 1,

  /** Step index must be positive */
  STEP_INDEX_MIN: 1,
} as const;

/**
 * Database indexes for query optimization.
 */
export const INDEXES = {
  /** Primary key */
  PRIMARY_KEY: 'ai_agent_output_pkey',

  /** Composite index for market-specific run queries */
  MARKET_RUN: 'idx_ai_agent_output_market_run',

  /** Market ticker lookups */
  MARKET_TICKER: 'idx_ai_agent_output_market_ticker',

  /** Recent records by insertion time */
  RUN_CREATED: 'idx_ai_agent_output_run_created',

  /** Run-specific queries */
  RUN_ID: 'idx_ai_agent_output_run_id',

  /** Step completion time queries */
  STEP_FINISHED: 'idx_ai_agent_output_step_finished',

  /** Step sequence queries */
  STEP_INDEX: 'idx_ai_agent_output_step_index',

  /** Step type filtering */
  STEP_KIND: 'idx_ai_agent_output_step_kind',

  /** JSONB content searches */
  STEP_OUTPUT_GIN: 'idx_ai_agent_output_step_output_gin',

  /** Step start time queries */
  STEP_STARTED: 'idx_ai_agent_output_step_started',

  /** Direction-based filtering */
  DIRECTION: 'idx_ai_agent_output_direction',

  /** Unique constraint for run/step combinations */
  UNIQUE_RUN_STEP: 'unique_run_step',
} as const;

/**
 * Common query patterns and example usage.
 *
 * These are intended as examples and helpers; they should be used with
 * parameterized values to avoid SQL injection.
 */
export const QUERY_EXAMPLES = {
  /** Get all steps for a specific run */
  getRunSteps: (runId: string) => `
    SELECT * FROM ai_agent_output
    WHERE run_id = '${runId}'
    ORDER BY step_index ASC
  `,

  /** Get latest outputs for a market ticker */
  getLatestForTicker: (ticker: string, limit = 10) => `
    SELECT * FROM ai_agent_output
    WHERE market_ticker = '${ticker}'
    ORDER BY inserted_at DESC
    LIMIT ${limit}
  `,

  /** Get completed steps with confidence scores */
  getCompletedWithConfidence: () => `
    SELECT * FROM ai_agent_output
    WHERE step_finished_at IS NOT NULL
      AND confidence IS NOT NULL
    ORDER BY step_finished_at DESC
  `,

  /** Search within step_output JSONB */
  searchStepOutput: (jsonPath: string) => `
    SELECT * FROM ai_agent_output
    WHERE step_output @> '${jsonPath}'::jsonb
  `,
} as const;
