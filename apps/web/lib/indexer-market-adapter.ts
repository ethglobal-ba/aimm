import type { market as IndexerMarket } from '@/lib/generated/graphql';
import type { Market, MarketStatus, Platform, AIRunStatus } from '@/types/market';

const SCALE_6DP = 1_000_000;

function fromFixed6(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // `BigInt` is represented as `any` in generated types, but at runtime this will
  // be either a bigint or a string/number containing the integer value.
  const numeric = typeof value === 'bigint' ? Number(value) : typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric / SCALE_6DP;
}

/**
 * Percent-style values from the indexer are stored with 6 decimals on a 0–100
 * scale (e.g. 60% → 60.000000 → 60000000). The UI expects probabilities on a
 * 0–1 scale for `formatPercentage`, so we convert 60000000 → 0.6.
 */
function fromPercentFixed6(value: unknown): number | null {
  const base = fromFixed6(value);
  if (base === null) {
    return null;
  }
  return base / 100;
}

function fromTimestampSeconds(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === 'bigint' ? Number(value) : typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return new Date(numeric * 1000);
}

function mapStatus(statusCode: number): MarketStatus {
  // On-chain enum (see ponder schema):
  // 0 = Inactive, 1 = Active, 2 = ClosedInternal, 3 = ClosedExternal
  switch (statusCode) {
    case 1:
      return 'open';
    case 0:
      return 'suspended';
    case 2:
    case 3:
    default:
      return 'closed';
  }
}

function deriveAIRunStatus(lastFairRun: Date | null): AIRunStatus | null {
  if (!lastFairRun) {
    return null;
  }

  const diffSeconds = (Date.now() - lastFairRun.getTime()) / 1000;

  if (diffSeconds < 5 * 60) {
    return 'running';
  }

  if (diffSeconds < 60 * 60) {
    return 'success';
  }

  return 'stale';
}

type IndexerMarketSource = Pick<
  IndexerMarket,
  | 'id'
  | 'externalId'
  | 'marketName'
  | 'subtitle'
  | 'platformName'
  | 'status'
  | 'optionACurrentExternalPrice'
  | 'optionACurrentFairPrice'
  | 'lastExternalPriceUpdate'
  | 'lastFairPriceUpdate'
  | 'volume'
>;

export function mapIndexerMarketToMarket(item: IndexerMarketSource): Market {
  const livePrice = fromPercentFixed6(item.optionACurrentExternalPrice);
  const fairPrice = fromPercentFixed6(item.optionACurrentFairPrice);
  const lastExternalUpdate = fromTimestampSeconds(item.lastExternalPriceUpdate);
  const lastFairUpdate = fromTimestampSeconds(item.lastFairPriceUpdate);
  const volume = fromFixed6(item.volume);

  const status = mapStatus(item.status);
  const aiRunStatus = deriveAIRunStatus(lastFairUpdate);

  // Platform is a string in GraphQL, but our UI expects a narrower union. The
  // indexer is configured to only emit the known platform identifiers, so this
  // cast is narrowing trusted backend data, not fabricating values.
  const platform = item.platformName as Platform;

  const marketName = item.marketName;
  const title = item.subtitle || marketName;

  return {
    id: item.id,
    marketName,
    title,
    platform,
    symbol: item.externalId,
    livePrice,
    aimmFairPrice: fairPrice,
    status,
    aimmStatus: undefined,
    agentPosition: null,
    lastAction: null,
    lastActionTimestamp: lastExternalUpdate,
    lastAIRun: lastFairUpdate,
    aiRunStatus,
    volume24h: volume,
    timeToClose: null,
  };
}
