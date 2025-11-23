import 'server-only';

import type { QueryResultRow } from 'pg';

import { query, type SqlValue } from './db';
import type { AIAgentOutput, Direction, StepOutput } from './ai-agent-output-types';

export interface AgentActionWithStepOutput {
  id: string;
  timestamp: Date;
  runId: string;
  stepIndex: number;
  marketTicker?: string;
  stepKind: string;
  stepLoading?: boolean;
  headline?: string;
  summary?: string;
  direction?: Direction;
  stepOutput: StepOutput;
}

export interface AgentActionsFilters {
  readonly marketId?: string;
  readonly marketTicker?: string;
}

interface AiAgentOutputFullRow extends QueryResultRow, AIAgentOutput {}

function mapRowToAgentAction(row: AiAgentOutputFullRow): AgentActionWithStepOutput {
  return {
    id: String(row.id),
    timestamp: row.inserted_at ?? new Date(),
    runId: row.run_id,
    stepIndex: row.step_index,
    marketTicker: row.market_ticker,
    stepKind: row.step_kind,
    stepLoading: row.step_loading,
    headline: row.headline,
    summary: row.summary,
    direction: row.direction,
    stepOutput: row.step_output,
  };
}

export async function getRecentAgentActions(
  limit: number,
  filters?: AgentActionsFilters
): Promise<AgentActionWithStepOutput[]> {
  if (!Number.isFinite(limit) || limit <= 0) {
    throw new Error('limit must be a positive, finite number');
  }

  const whereParts: string[] = [];
  const parameters: SqlValue[] = [];

  if (filters?.marketId) {
    whereParts.push(`market_id = $${parameters.length + 1}`);
    parameters.push(filters.marketId);
  }

  if (filters?.marketTicker) {
    whereParts.push(`market_ticker = $${parameters.length + 1}`);
    parameters.push(filters.marketTicker);
  }

  const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

  const sql = `
    SELECT
      id,
      run_id,
      step_index,
      market_ticker,
      step_kind,
      step_loading,
      step_output,
      headline,
      summary,
      direction,
      agent_version,
      model_version,
      confidence,
      price_scale,
      inserted_at
    FROM ai_agent_output
    ${whereClause}
    ORDER BY inserted_at DESC
    LIMIT $${parameters.length + 1}
  `;

  parameters.push(limit);

  const { rows } = await query<AiAgentOutputFullRow>(sql, parameters);

  return rows.map(mapRowToAgentAction);
}
