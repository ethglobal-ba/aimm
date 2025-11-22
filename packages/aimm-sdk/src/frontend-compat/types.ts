// Frontend-compatible types that match the web app's interface

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

// Market detail types
export type SignalStrength = 'high' | 'medium' | 'low';

export interface PricePoint {
  timestamp: string;
  livePrice: number;
  fairPrice: number;
}

export interface AgentSignal {
  id: string;
  label: string;
  detail: string;
  source: string;
  strength: SignalStrength;
}

export interface AgentRun {
  id: string;
  timestamp: Date;
  fairPrice: number;
  livePriceAtRun: number;
  delta: number;
  durationSeconds: number;
  confidence: number;
  modelVersion: string;
  status: AIRunStatus;
  summary: string;
  signals: AgentSignal[];
}

export interface OrderBookLevel {
  price: number;
  size: number;
  depth: number;
}

export interface TradeEvent {
  id: string;
  timestamp: Date;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  venue: string;
  status: 'filled' | 'partial';
}

export interface MarketDetailData {
  priceHistory: PricePoint[];
  runs: AgentRun[];
  orderBook: {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  };
  trades: TradeEvent[];
}

// Additional types for SDK functionality
export interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume24h: number;
  totalTrades: number;
  avgMispricingBps: number;
}

export interface PlatformStats {
  platform: Platform;
  marketCount: number;
  volume24h: number;
  avgMispricing: number;
}

export interface AIPerformanceMetrics {
  totalRuns: number;
  successRate: number;
  avgConfidence: number;
  avgExecutionTime: number;
  profitabilityScore: number;
}