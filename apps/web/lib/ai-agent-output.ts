import 'server-only';

import type { QueryResultRow } from 'pg';

import { query } from './db';

import type { AIAgentOutput, Direction } from './ai-agent-output-types';

interface AiAgentOutputDbRow
  extends QueryResultRow,
    Pick<
      AIAgentOutput,
      'run_id' | 'market_ticker' | 'step_index' | 'step_kind' | 'headline' | 'direction' | 'inserted_at'
    > {}

export interface AiAgentOutputStep {
  runId: string;
  marketTicker: string | undefined;
  stepIndex: number;
  stepKind: string;
  headline: string | null | undefined;
  direction: Direction | null | undefined;
  insertedAt: Date | undefined;
}

/**
 * Fetches up to `limitPerMarket` steps for the latest run (by inserted_at) for each market_ticker.
 * Results are ordered by marketTicker then stepIndex.
 */
export async function getLatestRunsByMarketTicker(
  limitPerMarket: number,
): Promise<AiAgentOutputStep[]> {
  if (!Number.isFinite(limitPerMarket) || limitPerMarket <= 0) {
    throw new Error('limitPerMarket must be a positive, finite number');
  }

  const sql = `
    WITH latest_run AS (
      SELECT DISTINCT ON (market_ticker)
        market_ticker,
        run_id,
        inserted_at
      FROM ai_agent_output
      WHERE market_ticker IS NOT NULL
      ORDER BY market_ticker, inserted_at DESC
    ),
    ranked_steps AS (
      SELECT
        o.run_id,
        o.market_ticker,
        o.step_index,
        o.step_kind,
        o.headline,
        o.direction,
        o.inserted_at,
        ROW_NUMBER() OVER (
          PARTITION BY o.market_ticker
          ORDER BY o.step_index
        ) AS step_rank
      FROM ai_agent_output o
      JOIN latest_run lr
        ON o.market_ticker = lr.market_ticker
       AND o.run_id = lr.run_id
    )
    SELECT
      run_id,
      market_ticker,
      step_index,
      step_kind,
      headline,
      direction,
      inserted_at
    FROM ranked_steps
    WHERE step_rank <= $1
    ORDER BY market_ticker, step_index;
  `;

  const { rows } = await query<AiAgentOutputDbRow>(sql, [limitPerMarket]);

  return rows.map((row) => ({
    runId: row.run_id,
    marketTicker: row.market_ticker,
    stepIndex: row.step_index,
    stepKind: row.step_kind,
    headline: row.headline,
    direction: row.direction,
    insertedAt: row.inserted_at,
  }));
}

/**
 * Example usage (server-only):
 *
 * import { getLatestRunsByMarketTicker } from '@/lib/ai-agent-output';
 *
 * export default async function SomeServerComponent() {
 *   const steps = await getLatestRunsByMarketTicker(10);
 *   // render using steps...
 * }
 */



