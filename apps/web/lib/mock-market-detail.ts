import type { AIRunStatus } from '@/types/market';

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

const baseHistory: PricePoint[] = [
  { timestamp: '09:30', livePrice: 0.52, fairPrice: 0.56 },
  { timestamp: '10:00', livePrice: 0.5, fairPrice: 0.55 },
  { timestamp: '10:30', livePrice: 0.49, fairPrice: 0.54 },
  { timestamp: '11:00', livePrice: 0.51, fairPrice: 0.57 },
  { timestamp: '11:30', livePrice: 0.54, fairPrice: 0.6 },
  { timestamp: '12:00', livePrice: 0.58, fairPrice: 0.62 },
  { timestamp: '12:30', livePrice: 0.6, fairPrice: 0.64 },
  { timestamp: '13:00', livePrice: 0.59, fairPrice: 0.63 },
  { timestamp: '13:30', livePrice: 0.57, fairPrice: 0.62 },
  { timestamp: '14:00', livePrice: 0.55, fairPrice: 0.61 },
  { timestamp: '14:30', livePrice: 0.56, fairPrice: 0.62 },
  { timestamp: '15:00', livePrice: 0.58, fairPrice: 0.65 },
];

const baseRuns: AgentRun[] = [
  {
    id: 'run-03',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    fairPrice: 0.71,
    livePriceAtRun: 0.63,
    delta: 0.08,
    durationSeconds: 44,
    confidence: 91,
    modelVersion: 'v0.4.3',
    status: 'success',
    summary: 'Detected strong on-chain inflow plus positive social sentiment, nudging fair odds higher.',
    signals: [
      {
        id: 'sig-onchain',
        label: 'CDP Flow',
        detail: 'Large deposits into Limitless vaults during last 10 minutes.',
        source: 'cdp-sql',
        strength: 'high',
      },
      {
        id: 'sig-pyth',
        label: 'Pyth Oracle',
        detail: 'BTC basis tightened by 45 bps, supporting upside odds.',
        source: 'pyth',
        strength: 'medium',
      },
    ],
  },
  {
    id: 'run-02',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    fairPrice: 0.67,
    livePriceAtRun: 0.6,
    delta: 0.07,
    durationSeconds: 52,
    confidence: 88,
    modelVersion: 'v0.4.2',
    status: 'success',
    summary: 'Cross-market arb showing Polymarket still lagging; recommended keeping YES exposure.',
    signals: [
      {
        id: 'sig-cross',
        label: 'Cross-market',
        detail: 'Polymarket contract trades 6% cheaper than Limitless.',
        source: 'polymarket',
        strength: 'medium',
      },
      {
        id: 'sig-sentiment',
        label: 'Social sentiment',
        detail: 'X.com mentions jumped 32% with bullish tone.',
        source: 'x-com',
        strength: 'low',
      },
    ],
  },
  {
    id: 'run-01',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    fairPrice: 0.62,
    livePriceAtRun: 0.59,
    delta: 0.03,
    durationSeconds: 61,
    confidence: 81,
    modelVersion: 'v0.4.1',
    status: 'stale',
    summary: 'Baseline refresh using overnight data; highlighted limited liquidity depth.',
    signals: [
      {
        id: 'sig-liquidity',
        label: 'Depth monitor',
        detail: 'Order book imbalance of 12% to the bid side.',
        source: 'limitless',
        strength: 'medium',
      },
    ],
  },
];

const baseOrderBook = {
  bids: [
    { price: 0.63, size: 4100, depth: 0 },
    { price: 0.62, size: 5200, depth: 4100 },
    { price: 0.61, size: 6800, depth: 9300 },
    { price: 0.6, size: 7200, depth: 16100 },
    { price: 0.59, size: 8200, depth: 23300 },
  ],
  asks: [
    { price: 0.65, size: 3700, depth: 0 },
    { price: 0.66, size: 4300, depth: 3700 },
    { price: 0.67, size: 5100, depth: 8000 },
    { price: 0.68, size: 6200, depth: 13100 },
    { price: 0.69, size: 7100, depth: 19300 },
  ],
};

const baseTrades: TradeEvent[] = [
  {
    id: 'fill-04',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    side: 'buy',
    size: 350,
    price: 0.645,
    venue: 'Limitless',
    status: 'filled',
  },
  {
    id: 'fill-03',
    timestamp: new Date(Date.now() - 7 * 60 * 1000),
    side: 'sell',
    size: 250,
    price: 0.652,
    venue: 'Limitless',
    status: 'filled',
  },
  {
    id: 'fill-02',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    side: 'buy',
    size: 500,
    price: 0.639,
    venue: 'Polymarket',
    status: 'filled',
  },
  {
    id: 'fill-01',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    side: 'buy',
    size: 800,
    price: 0.631,
    venue: 'Limitless',
    status: 'partial',
  },
];

export function getMarketDetailData(marketId: string): MarketDetailData {
  const seed = getSeed(marketId);
  const priceHistory = applySeedToHistory(baseHistory, seed);
  const runs = baseRuns.map(run => ({
    ...run,
    timestamp: new Date(run.timestamp),
    fairPrice: clamp(run.fairPrice + drift(seed, 0.012)),
    livePriceAtRun: clamp(run.livePriceAtRun + drift(seed, 0.01)),
    delta: Number(
      (clamp(run.fairPrice + drift(seed, 0.012)) - clamp(run.livePriceAtRun + drift(seed, 0.01))).toFixed(3)
    ),
  }));

  return {
    priceHistory,
    runs,
    orderBook: {
      bids: baseOrderBook.bids.map(level => ({ ...level })),
      asks: baseOrderBook.asks.map(level => ({ ...level })),
    },
    trades: baseTrades.map(trade => ({
      ...trade,
      timestamp: new Date(trade.timestamp),
    })),
  };
}

function applySeedToHistory(history: PricePoint[], seed: number): PricePoint[] {
  return history.map((point, index) => {
    const modulation = Math.sin(seed * 0.1 + index * 0.35) * 0.01;
    return {
      timestamp: point.timestamp,
      livePrice: clamp(point.livePrice + modulation),
      fairPrice: clamp(point.fairPrice + modulation * 1.1),
    };
  });
}

function getSeed(value: string): number {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function drift(seed: number, amplitude: number): number {
  return (Math.cos(seed * 0.15) * amplitude) / 2;
}

function clamp(value: number): number {
  if (value < 0.05) return 0.05;
  if (value > 0.95) return 0.95;
  return Number(value.toFixed(3));
}
