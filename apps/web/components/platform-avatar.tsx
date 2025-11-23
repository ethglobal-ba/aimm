import Image from 'next/image';

import type { Platform } from '@/types/market';

interface PlatformAvatarProps {
  platform: Platform;
  size?: number;
  className?: string;
}

const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  limitless: 'Limitless',
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
  'trump.fun': 'Trump.fun',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  limitless: 'bg-blue-500/15 text-blue-300',
  polymarket: 'bg-purple-500/15 text-purple-300',
  kalshi: 'bg-emerald-500/15 text-emerald-300',
  'trump.fun': 'bg-pink-500/15 text-pink-300',
};

const PLATFORM_LOGOS: Partial<Record<Platform, string>> = {
  kalshi: '/platforms/kalshi.svg',
  limitless: '/platforms/limitless.svg',
  'trump.fun': '/platforms/trumpfun.svg',
};

/**
 * Small avatar for a market's platform.
 *
 * Uses a dedicated logo asset when available (e.g. `/platforms/kalshi.svg`),
 * falling back to a colored circle with the platform initial otherwise.
 */
export function PlatformAvatar({ platform, size = 24, className }: PlatformAvatarProps) {
  const displayName = PLATFORM_DISPLAY_NAMES[platform];
  const fallbackInitial = displayName.charAt(0).toUpperCase();
  const colorClass = PLATFORM_COLORS[platform];

  const logoSrc = PLATFORM_LOGOS[platform];
  const hasLogo = typeof logoSrc === 'string';
  const dimension = size;

  if (hasLogo) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md bg-background/40 ${className ?? ''}`}
        style={{ width: dimension, height: dimension }}
        aria-label={displayName}
      >
        <Image
          src={logoSrc}
          alt={displayName}
          width={dimension}
          height={dimension}
          className='h-[80%] w-[80%] object-contain'
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-[11px] font-semibold ${colorClass} ${className ?? ''}`}
      style={{ width: dimension, height: dimension }}
      aria-label={displayName}
    >
      {fallbackInitial}
    </span>
  );
}


