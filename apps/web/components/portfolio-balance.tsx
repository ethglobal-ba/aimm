'use client';

import { TradeUpIcon, TradeDownIcon } from 'hugeicons-react';
import { cn } from '@workspace/ui/lib/utils';
import { mockPortfolioBalance, formatUSD } from '@/lib/mock-balance';

/**
 * MOCK: Portfolio Balance card component.
 *
 * This component displays the user's total portfolio balance and profit/loss indicator.
 * Currently uses mock data from `mock-balance.ts`. In production, this will be replaced
 * by real-time data from the AIMM vault and wallet balance.
 */
export function PortfolioBalance() {
  // MOCK: Using static mock data. In production, this would come from a live data source.
  const balance = mockPortfolioBalance;

  return (
    <div className='flex flex-col gap-3 p-4'>
      {/* Label */}
      <div className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>Portfolio Balance</div>

      {/* Total Balance */}
      <div className='flex items-baseline gap-2'>
        <span className='text-foreground text-2xl font-bold tracking-tight'>{formatUSD(balance.totalBalance)}</span>
      </div>

      {/* Profit/Loss Indicator */}
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
            balance.isProfitable
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}
        >
          {balance.isProfitable ? (
            <TradeUpIcon className='h-3 w-3' />
          ) : (
            <TradeDownIcon className='h-3 w-3' />
          )}
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

