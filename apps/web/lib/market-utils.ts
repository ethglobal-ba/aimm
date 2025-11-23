import type { Market, MarketAimmStatus, Platform } from '@/types/market';
import type { AgentRun } from '@/lib/mock-market-detail';

export function formatPercentage(value: number): string {
  // Values are probabilities on a 0–1 scale; display as whole-number cents (0–100¢).
  const cents = Math.round(value * 100);
  return `${cents}¢`;
}

export function calculateMispricing(livePrice: number, fairPrice: number): { absolute: number; relative: number } {
  const absolute = fairPrice - livePrice;
  const relative = (absolute / livePrice) * 100;
  return { absolute, relative };
}

export function formatCompactUsd(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatUsd(value: number): string {
  const compact = formatCompactUsd(value);
  return `$${compact}`;
}

export function formatSize(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return value.toString();
}

export function formatTimeRemaining(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 30) {
    const months = days / 30;
    return `${months.toFixed(1)} mo`;
  }
  if (days >= 1) {
    return `${days}d`;
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `${hours}h`;
  const minutes = Math.floor(diffMs / (1000 * 60));
  return `${minutes}m`;
}

export function formatRelativeTime(date: Date): string {
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return `${seconds} secs ago`;
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export type AgentSignalStrength = AgentRun['signals'][number]['strength'];

export function getSignalClass(strength: AgentSignalStrength): string {
  switch (strength) {
    case 'high':
      return 'bg-green-500/10 text-green-200';
    case 'medium':
      return 'bg-blue-500/10 text-blue-200';
    default:
      return 'bg-amber-500/10 text-amber-200';
  }
}

export function getStatusBadgeClass(status: Market['status']): string {
  switch (status) {
    case 'open':
      return 'border-green-500/30 bg-green-500/10 text-green-300';
    case 'suspended':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    default:
      return 'border-muted bg-muted/30 text-muted-foreground';
  }
}

export function getAimmStatusBadgeClass(status: MarketAimmStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    case 'INACTIVE':
      return 'border-muted bg-muted/40 text-muted-foreground';
    case 'EXTERNALLY_CLOSED':
      return 'border-sky-500/40 bg-sky-500/10 text-sky-200';
    case 'INTERNALLY_CLOSED':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-200';
  }
}

export function getAimmStatusLabel(status: MarketAimmStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'EXTERNALLY_CLOSED':
      return 'Externally closed';
    case 'INTERNALLY_CLOSED':
      return 'Internally closed';
  }
}

export function getStatusDotClass(status: Market['aiRunStatus'] | AgentRun['status']): string {
  switch (status) {
    case 'success':
      return 'bg-green-500';
    case 'running':
      return 'bg-blue-500';
    default:
      return 'bg-amber-500';
  }
}

export function getPositionBadgeClass(position: Market['agentPosition']): string {
  if (!position) {
    return 'border-border bg-muted text-muted-foreground';
  }
  if (position.startsWith('+')) {
    return 'border-green-500/30 bg-green-500/10 text-green-300';
  }
  if (position.startsWith('-')) {
    return 'border-red-500/30 bg-red-500/10 text-red-300';
  }
  return 'border-border bg-muted text-muted-foreground';
}

export function formatPlatformLabel(platform: Platform): string {
  switch (platform) {
    case 'kalshi':
      return 'Kalshi';
    case 'limitless':
      return 'Limitless';
    case 'polymarket':
      return 'Polymarket';
    case 'trump.fun':
      return 'Trump.fun';
  }
}

/**
 * Format a long identifier (such as a market ID or hash) with a middle ellipsis.
 *
 * Examples:
 * - "0x24BC6D39EF2533890009118B2348E53AECF73E9949FB9719D44F3FECD33B0B54"
 *   → "0x24BC6…3B0B54"
 *
 * Short values are returned unchanged.
 */
export function formatIdentifierWithEllipsis(
  value: string,
  visibleStart: number = 6,
  visibleEnd: number = 6
): string {
  const minimumLengthForTruncation = visibleStart + visibleEnd + 3; // 3 for the ellipsis

  if (value.length <= minimumLengthForTruncation) {
    return value;
  }

  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);

  return `${start}…${end}`;
}

