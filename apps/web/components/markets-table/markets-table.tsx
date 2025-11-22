'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@workspace/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import {
  calculateMispricing,
  formatPercentage,
  formatTimeAgo,
  getAimmStatusLabel,
  getStatusDotClass,
} from '@/lib/market-utils';
import type { Market, MarketAimmStatus } from '@/types/market';
import { useMarketsStatus } from '@/components/markets-status-context';

interface MarketsTableProps {
  markets: Market[];
  platformFilter?: string;
  /**
   * AIMM status filter coming from the overview page.
   * - 'all' → include all AIMM statuses
   * - otherwise → match a specific MarketAimmStatus
   */
  statusFilter?: 'all' | MarketAimmStatus;
  sortBy?: 'mispricing' | 'timeToClose' | 'volume';
}

export function MarketsTable({
  markets,
  platformFilter = 'all',
  statusFilter = 'all',
  sortBy = 'mispricing',
}: MarketsTableProps) {
  const router = useRouter();
  const { getStatus: getAimmStatusOverride, setStatus: setAimmStatus } = useMarketsStatus();

  const filteredAndSortedMarkets = useMemo(() => {
    const withResolvedAimmStatus = markets.map(market => {
      const override = getAimmStatusOverride(market.id);
      const resolved: MarketAimmStatus = override ?? market.aimmStatus ?? 'ACTIVE';
      return {
        market,
        aimmStatus: resolved,
      };
    });

    let filtered = withResolvedAimmStatus;

    if (platformFilter !== 'all') {
      filtered = filtered.filter(entry => entry.market.platform === platformFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.aimmStatus === statusFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'mispricing': {
          const aMispricing = Math.abs(calculateMispricing(a.market.livePrice, a.market.aimmFairPrice).relative);
          const bMispricing = Math.abs(calculateMispricing(b.market.livePrice, b.market.aimmFairPrice).relative);
          return bMispricing - aMispricing;
        }
        case 'timeToClose':
          return a.market.timeToClose.getTime() - b.market.timeToClose.getTime();
        case 'volume':
          return b.market.volume24h - a.market.volume24h;
        default:
          return 0;
      }
    });

    return sorted;
  }, [getAimmStatusOverride, markets, platformFilter, sortBy, statusFilter]);

  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[300px]'>Market</TableHead>
            <TableHead className='text-right'>Live Price</TableHead>
            <TableHead className='text-right'>AIMM Fair</TableHead>
            <TableHead className='text-right'>Mispricing (Δ)</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>AIMM Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedMarkets.map(entry => {
            const { market, aimmStatus } = entry;
            const mispricing = calculateMispricing(market.livePrice, market.aimmFairPrice);

            return (
              <TableRow
                key={market.id}
                className='group border-border hover:bg-muted/50 cursor-pointer'
                onClick={() => router.push(`/markets/${market.id}`)}
              >
                <TableCell className='font-medium'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-foreground group-hover:text-primary transition-colors'>{market.title}</span>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='text-muted-foreground border-border h-auto rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wider uppercase'
                      >
                        {market.platform}
                      </Badge>
                      <span className='text-muted-foreground font-mono text-xs'>{market.symbol}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className='text-muted-foreground text-right font-mono' suppressHydrationWarning>
                  {formatPercentage(market.livePrice)}
                </TableCell>

                <TableCell className='text-right font-mono font-medium text-blue-400' suppressHydrationWarning>
                  {formatPercentage(market.aimmFairPrice)}
                </TableCell>

                <TableCell className='text-right'>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'rounded-full px-2 py-0.5 font-mono text-xs',
                      Math.abs(mispricing.relative) > 10
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-muted'
                    )}
                    suppressHydrationWarning
                  >
                    {mispricing.relative > 0 ? '+' : ''}
                    {mispricing.relative.toFixed(1)}%
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className='flex flex-col items-start'>
                    {market.agentPosition ? (
                      <>
                        <span
                          className={cn(
                            'font-mono text-xs',
                            market.agentPosition.includes('+')
                              ? 'text-green-400'
                              : market.agentPosition.includes('-')
                                ? 'text-red-400'
                                : 'text-muted-foreground'
                          )}
                        >
                          {market.agentPosition}
                        </span>
                        <span className='text-muted-foreground text-[10px]'>{market.lastAction}</span>
                      </>
                    ) : (
                      <span className='text-muted-foreground font-mono text-xs'>
                        {market.agentPosition || '—'}
                        <br />
                        <span className='text-[10px]'>{market.lastAction}</span>
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div className={cn('h-1.5 w-1.5 rounded-full', getStatusDotClass(market.aiRunStatus))} />
                    <span className='text-muted-foreground text-xs' suppressHydrationWarning>
                      {formatTimeAgo(market.lastAIRun)}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Select
                    value={aimmStatus}
                    onValueChange={value => {
                      const nextStatus = value as MarketAimmStatus;
                      setAimmStatus(market.id, nextStatus);
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 w-[140px] border px-2.5 text-xs font-medium transition-colors',
                        aimmStatus === 'ACTIVE'
                          ? 'border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/15'
                          : aimmStatus === 'INACTIVE'
                            ? 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/40'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
                      )}
                      onClick={event => event.stopPropagation()}
                    >
                      <SelectValue>
                        <span className='flex items-center gap-1.5'>
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              aimmStatus === 'ACTIVE'
                                ? 'bg-green-400'
                                : aimmStatus === 'INACTIVE'
                                  ? 'bg-muted-foreground'
                                  : 'bg-amber-400'
                            )}
                          />
                          {getAimmStatusLabel(aimmStatus)}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ACTIVE' className='text-xs'>
                        <span className='flex items-center gap-2'>
                          <span className='h-1.5 w-1.5 rounded-full bg-green-400' />
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value='INACTIVE' className='text-xs'>
                        <span className='flex items-center gap-2'>
                          <span className='bg-muted-foreground h-1.5 w-1.5 rounded-full' />
                          Inactive
                        </span>
                      </SelectItem>
                      <SelectItem value='EXTERNALLY_CLOSED' className='text-xs'>
                        <span className='flex items-center gap-2'>
                          <span className='h-1.5 w-1.5 rounded-full bg-amber-400' />
                          Externally closed
                        </span>
                      </SelectItem>
                      <SelectItem value='INTERNALLY_CLOSED' className='text-xs'>
                        <span className='flex items-center gap-2'>
                          <span className='h-1.5 w-1.5 rounded-full bg-amber-400' />
                          Internally closed
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
