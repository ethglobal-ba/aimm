'use client';

import { formatUSD, mockPortfolioBalance } from '@/lib/mock-balance';
import { cn } from '@workspace/ui/lib/utils';
import { TradeDownIcon, TradeUpIcon } from 'hugeicons-react';
import type { JSX } from 'react';

/**
 * MOCK: Portfolio Balance card component.
 *
 * This component displays the user's total portfolio balance and profit/loss indicator.
 * Currently uses mock data from `mock-balance.ts`. In production, this will be replaced
 * by real-time data from the AIMM vault and wallet balance.
 */
interface PortfolioBalanceProps {
  compact?: boolean;
}

export function PortfolioBalance({ compact }: PortfolioBalanceProps): JSX.Element {
  // MOCK: Using static mock data. In production, this would come from a live data source.
  const balance = mockPortfolioBalance;

  if (compact) {
    return (
      <div className='flex h-full min-h-[84px] items-center justify-between gap-4 px-5 py-3'>
        <div className='flex flex-col justify-center gap-1'>
          <div className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            Portfolio Balance
          </div>
          <div className='text-foreground text-2xl font-bold tracking-tight'>{formatUSD(balance.totalBalance)}</div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            balance.isProfitable ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}
        >
          {balance.isProfitable ? <TradeUpIcon className='h-3.5 w-3.5' /> : <TradeDownIcon className='h-3.5 w-3.5' />}
          <span className='font-mono font-semibold'>
            {balance.isProfitable ? '+' : ''}
            {formatUSD(balance.profitLoss)}
          </span>
          <span className='font-mono opacity-80'>
            ({balance.isProfitable ? '+' : ''}
            {balance.profitLossPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 p-4'>
      {/* Label */}
      <div className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>Portfolio Balance</div>

      {/* Total Balance */}
      <div className='flex items-baseline gap-2'>
        <span className='text-foreground text-2xl font-bold tracking-tight'>{formatUSD(balance.totalBalance)}</span>
      </div>

      {/* Profit/Loss Indicator */}
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            balance.isProfitable ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          )}
        >
          {balance.isProfitable ? <TradeUpIcon className='h-3 w-3' /> : <TradeDownIcon className='h-3 w-3' />}
          <span className='font-mono'>
            {balance.isProfitable ? '+' : ''}
            {formatUSD(balance.profitLoss)}
          </span>
          <span className='font-mono'>
            ({balance.isProfitable ? '+' : ''}
            {balance.profitLossPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
