// Frontend-compatible utility functions that match the web app's interface

import type { Market, MarketFilters, Platform, MarketStatus } from './types';

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format time ago from a date
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/**
 * Calculate mispricing between live price and fair price
 */
export function calculateMispricing(livePrice: number, aimmPrice: number): {
  absolute: number;
  relative: number
} {
  const absolute = aimmPrice - livePrice;
  const relative = (absolute / livePrice) * 100;
  return { absolute, relative };
}

/**
 * Format currency amounts
 */
export function formatCurrency(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format volume numbers with appropriate units
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: Platform): string {
  const platformNames: Record<Platform, string> = {
    limitless: 'Limitless',
    polymarket: 'Polymarket',
    kalshi: 'Kalshi',
    'trump.fun': 'Trump.fun'
  };
  return platformNames[platform] || platform;
}

/**
 * Get status badge color
 */
export function getStatusBadgeVariant(status: MarketStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'open':
      return 'default';
    case 'suspended':
      return 'secondary';
    case 'closed':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Filter markets based on criteria
 */
export function filterMarkets(markets: Market[], filters: MarketFilters): Market[] {
  return markets.filter(market => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        market.title.toLowerCase().includes(searchLower) ||
        market.symbol.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Platform filter
    if (filters.platforms.length > 0 && !filters.platforms.includes(market.platform)) {
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(market.status)) {
      return false;
    }

    return true;
  });
}

/**
 * Sort markets based on criteria
 */
export function sortMarkets(markets: Market[], sortBy: MarketFilters['sortBy']): Market[] {
  const sorted = [...markets];

  switch (sortBy) {
    case 'mispricing':
      return sorted.sort((a, b) => {
        const aMispricing = Math.abs(a.aimmFairPrice - a.livePrice);
        const bMispricing = Math.abs(b.aimmFairPrice - b.livePrice);
        return bMispricing - aMispricing;
      });

    case 'timeToClose':
      return sorted.sort((a, b) =>
        a.timeToClose.getTime() - b.timeToClose.getTime()
      );

    case 'volume':
      return sorted.sort((a, b) => b.volume24h - a.volume24h);

    default:
      return sorted;
  }
}

/**
 * Calculate time until market closes
 */
export function getTimeToClose(closeDate: Date): string {
  const now = new Date();
  const diff = closeDate.getTime() - now.getTime();

  if (diff <= 0) return 'Closed';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Check if a market has significant mispricing
 */
export function hasSignificantMispricing(market: Market, threshold: number = 0.05): boolean {
  const mispricing = Math.abs(market.aimmFairPrice - market.livePrice);
  return mispricing >= threshold;
}

/**
 * Get mispricing direction and magnitude
 */
export function getMispricingInfo(market: Market): {
  direction: 'underpriced' | 'overpriced' | 'fairly-priced';
  magnitude: number;
  percentage: number;
} {
  const diff = market.aimmFairPrice - market.livePrice;
  const magnitude = Math.abs(diff);
  const percentage = (magnitude / market.livePrice) * 100;

  let direction: 'underpriced' | 'overpriced' | 'fairly-priced';
  if (magnitude < 0.01) { // Less than 1 cent difference
    direction = 'fairly-priced';
  } else if (diff > 0) {
    direction = 'underpriced'; // Fair price higher than live price
  } else {
    direction = 'overpriced'; // Fair price lower than live price
  }

  return { direction, magnitude, percentage };
}

/**
 * Format position size for display
 */
export function formatPosition(position: string | null): {
  size: number;
  side: 'YES' | 'NO' | null;
  formatted: string;
} {
  if (!position) {
    return { size: 0, side: null, formatted: 'No position' };
  }

  const match = position.match(/([+-]?)(\d+)\s+(YES|NO)/);
  if (!match) {
    return { size: 0, side: null, formatted: position };
  }

  const [, sign, sizeStr, side] = match;
  const size = parseInt(sizeStr);
  const actualSide = side as 'YES' | 'NO';

  const prefix = sign === '-' ? '-' : '+';
  const formatted = `${prefix}${size} ${actualSide}`;

  return { size, side: actualSide, formatted };
}