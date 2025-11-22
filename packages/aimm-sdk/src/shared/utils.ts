import { MarketStatus, type MarketWithStatus, type PriceData, type ActivityItem } from './types';

/**
 * Convert a market status number to the enum
 */
export function parseMarketStatus(status: number): MarketStatus {
  return status as MarketStatus;
}

/**
 * Get the human-readable status name
 */
export function getStatusName(status: MarketStatus): string {
  switch (status) {
    case MarketStatus.Active:
      return 'Active';
    case MarketStatus.ClosedInternal:
      return 'Closed (Internal)';
    case MarketStatus.ClosedExternal:
      return 'Closed (External)';
    default:
      return 'Unknown';
  }
}

/**
 * Format bigint prices to display values
 */
export function formatPrice(price: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = price / divisor;
  const fraction = price % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fractionStr}`;
}

/**
 * Format timestamp to human readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(timestamp: bigint): string {
  const now = Date.now();
  const time = Number(timestamp) * 1000;
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

/**
 * Calculate price change percentage between two prices
 */
export function calculatePriceChange(oldPrice: bigint, newPrice: bigint): number {
  if (oldPrice === 0n) return 0;

  const change = newPrice - oldPrice;
  const percentage = Number((change * 10000n) / oldPrice) / 100;
  return percentage;
}

/**
 * Check if a market is active
 */
export function isMarketActive(status: MarketStatus): boolean {
  return status === MarketStatus.Active;
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'kalshi':
      return 'Kalshi';
    case 'polymarket':
      return 'Polymarket';
    case 'external':
      return 'External';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
}

/**
 * Sort activity items by timestamp (newest first)
 */
export function sortActivityByTimestamp(activities: ActivityItem[]): ActivityItem[] {
  return activities.sort((a, b) => Number(b.timestamp - a.timestamp));
}

/**
 * Filter markets by various criteria
 */
export function filterMarkets(
  markets: any[],
  filters: {
    platform?: string;
    status?: MarketStatus;
    searchTerm?: string;
  }
): any[] {
  return markets.filter((market) => {
    if (filters.platform && market.platform !== filters.platform) {
      return false;
    }

    if (filters.status !== undefined && market.status !== filters.status) {
      return false;
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const searchableText = `${market.marketName} ${market.optionAText} ${market.optionBText}`.toLowerCase();
      if (!searchableText.includes(term)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Group price updates by type
 */
export function groupPricesByType(prices: PriceData[]): {
  external: PriceData[];
  fair: PriceData[];
} {
  const external: PriceData[] = [];
  const fair: PriceData[] = [];

  prices.forEach((price) => {
    if (price.type === 'external') {
      external.push(price);
    } else if (price.type === 'fair') {
      fair.push(price);
    }
  });

  return { external, fair };
}

/**
 * Get the latest price for each type
 */
export function getLatestPrices(prices: PriceData[]): {
  external?: PriceData;
  fair?: PriceData;
} {
  const grouped = groupPricesByType(prices);

  const external = grouped.external.sort((a, b) => Number(b.timestamp - a.timestamp))[0];
  const fair = grouped.fair.sort((a, b) => Number(b.timestamp - a.timestamp))[0];

  return { external, fair };
}

/**
 * Calculate price spread between options
 */
export function calculateSpread(optionAPrice: bigint, optionBPrice: bigint): bigint {
  return optionAPrice > optionBPrice
    ? optionAPrice - optionBPrice
    : optionBPrice - optionAPrice;
}

/**
 * Calculate implied probability from price (assuming prices are in basis points or similar)
 */
export function calculateImpliedProbability(price: bigint, total: bigint = 10000n): number {
  if (total === 0n) return 0;
  return Number((price * 10000n) / total) / 100;
}

/**
 * Validate and sanitize market search term
 */
export function sanitizeSearchTerm(term: string): string {
  return term.trim().toLowerCase().replace(/[^\w\s]/g, '');
}

/**
 * Check if a timestamp is within a given time range
 */
export function isWithinTimeRange(
  timestamp: bigint,
  start?: bigint,
  end?: bigint
): boolean {
  if (start && timestamp < start) return false;
  if (end && timestamp > end) return false;
  return true;
}

/**
 * Convert hex string to shortened address format
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= 2 + chars * 2) return address;
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}