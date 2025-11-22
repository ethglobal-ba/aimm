export type Platform = 'limitless' | 'polymarket' | 'kalshi' | 'trump.fun';

export type MarketStatus = 'open' | 'suspended' | 'closed';

export type AIRunStatus = 'success' | 'stale' | 'running';

/**
 * AIMM-specific activation status for a market.
 *
 * This is distinct from the underlying venue / exchange status (`MarketStatus`),
 * and represents whether the AIMM agent should actively manage the market.
 *
 * MOCK: For now this is driven entirely from frontend state (see
 * `MarketsStatusProvider`) and mock data. In production this will be sourced
 * from AIMM contracts / indexer.
 */
export type MarketAimmStatus = 'ACTIVE' | 'INACTIVE' | 'EXTERNALLY_CLOSED' | 'INTERNALLY_CLOSED';

export interface Market {
  id: string;
  /**
   * Canonical name for the market as provided by the indexer / venue.
   *
   * Prefer this for display when we want the full market question.
   */
  marketName: string;
  /**
   * Legacy title field used by older parts of the UI.
   *
   * In practice this mirrors `marketName` or may include a shorter subtitle.
   * Prefer `marketName` for new UI surfaces.
   */
  title: string;
  platform: Platform;
  symbol: string;
  livePrice: number | null;
  aimmFairPrice: number | null;
  status: MarketStatus;
  /**
   * MOCK: AIMM status is optional while we are still using mixed data sources.
   * When all market data flows through a single typed API this can become
   * required.
   */
  aimmStatus?: MarketAimmStatus;
  agentPosition: string | null;
  lastAction: string | null;
  lastActionTimestamp: Date | null;
  lastAIRun: Date | null;
  aiRunStatus: AIRunStatus | null;
  volume24h: number | null;
  timeToClose: Date | null;
}

export interface MarketFilters {
  search: string;
  platforms: Platform[];
  statuses: MarketStatus[];
  sortBy: 'mispricing' | 'timeToClose' | 'volume';
}
