export type Platform = 'limitless' | 'polymarket' | 'kalshi' | 'trump.fun';

export type MarketStatus = 'open' | 'suspended' | 'closed';

export type AIRunStatus = 'success' | 'stale' | 'running';

export interface Market {
  id: string;
  title: string;
  platform: Platform;
  symbol: string;
  livePrice: number;
  aimmFairPrice: number;
  status: MarketStatus;
  agentPosition: string | null;
  lastAction: string | null;
  lastActionTimestamp: Date;
  lastAIRun: Date;
  aiRunStatus: AIRunStatus;
  volume24h: number;
  timeToClose: Date;
}

export interface MarketFilters {
  search: string;
  platforms: Platform[];
  statuses: MarketStatus[];
  sortBy: 'mispricing' | 'timeToClose' | 'volume';
}

