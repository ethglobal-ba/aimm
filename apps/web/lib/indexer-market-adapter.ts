import type { market as IndexerMarket } from '@/lib/generated/graphql';
import type { Market, MarketStatus, Platform, AIRunStatus, MarketAimmStatus } from '@/types/market';

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

function mapAimmStatus(statusCode: number): MarketAimmStatus {
  // AIMM on-chain enum (see contract + ponder schema):
  // 0 = Inactive, 1 = Active, 2 = ClosedInternal, 3 = ClosedExternal
  switch (statusCode) {
  case 1:
    return 'ACTIVE';
  case 0:
    return 'INACTIVE';
  case 2:
    return 'INTERNALLY_CLOSED';
  case 3:
  default:
    return 'EXTERNALLY_CLOSED';
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
  | 'platform'
  | 'platformName'
  | 'status'
  | 'optionACurrentExternalPrice'
  | 'optionACurrentFairPrice'
  | 'lastExternalPriceUpdate'
  | 'lastFairPriceUpdate'
  | 'volume'
>;

function mapPlatform(platformCode: number, platformName: string): Platform {
  switch (platformCode) {
    // See `apps/indexer/ponder.schema.ts` for the enum mapping:
    // 0 = KALSHI, 1 = LIMITLESS, 2 = TRUMPFUN
    case 0:
      return 'kalshi';
    case 1:
      return 'limitless';
    case 2:
      return 'trump.fun';
    default: {
      const normalized = platformName.trim().toLowerCase();

      if (normalized.includes('poly')) {
        return 'polymarket';
      }
      if (normalized.includes('kalshi')) {
        return 'kalshi';
      }
      if (normalized.includes('trump')) {
        return 'trump.fun';
      }
      if (normalized.includes('limitless')) {
        return 'limitless';
      }

      // Fallback to a reasonable default while keeping the value within the
      // `Platform` union.
      return 'kalshi';
    }
  }
}

export function mapIndexerPlatformToPlatform(platformCode: number, platformName: string): Platform {
  return mapPlatform(platformCode, platformName);
}

export function mapIndexerMarketToMarket(item: IndexerMarketSource): Market {
  const livePrice = fromPercentFixed6(item.optionACurrentExternalPrice);
  const fairPrice = fromPercentFixed6(item.optionACurrentFairPrice);
  const lastExternalUpdate = fromTimestampSeconds(item.lastExternalPriceUpdate);
  const lastFairUpdate = fromTimestampSeconds(item.lastFairPriceUpdate);
  const volume = fromFixed6(item.volume);

  const statusCode = typeof item.status === 'number' ? item.status : Number(item.status);

  const status = mapStatus(statusCode);
  const aiRunStatus = deriveAIRunStatus(lastFairUpdate);

  const platform = mapPlatform(item.platform, item.platformName);

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
    aimmStatus: mapAimmStatus(statusCode),
    agentPosition: null,
    lastAction: null,
    lastActionTimestamp: lastExternalUpdate,
    lastAIRun: lastFairUpdate,
    aiRunStatus,
    volume24h: volume,
    timeToClose: null,
  };
}
