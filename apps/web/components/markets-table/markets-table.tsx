'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@workspace/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import {
  calculateMispricing,
  formatIdentifierWithEllipsis,
  formatPercentage,
  formatTimeAgo,
  getAimmStatusLabel,
  getStatusDotClass,
} from '@/lib/market-utils';
import type { Market, MarketAimmStatus } from '@/types/market';
import { useMarketsStatus } from '@/components/markets-status-context';
import Link from 'next/link';

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
          const aHasPrices = a.market.livePrice != null && a.market.aimmFairPrice != null;
          const bHasPrices = b.market.livePrice != null && b.market.aimmFairPrice != null;

          if (!aHasPrices && !bHasPrices) {
            return 0;
          }
          if (!aHasPrices) {
            return 1;
          }
          if (!bHasPrices) {
            return -1;
          }

          const aMispricing = Math.abs(
            calculateMispricing(a.market.livePrice as number, a.market.aimmFairPrice as number).relative
          );
          const bMispricing = Math.abs(
            calculateMispricing(b.market.livePrice as number, b.market.aimmFairPrice as number).relative
          );
          return bMispricing - aMispricing;
        }
        case 'timeToClose': {
          const aTime = a.market.timeToClose?.getTime() ?? Number.POSITIVE_INFINITY;
          const bTime = b.market.timeToClose?.getTime() ?? Number.POSITIVE_INFINITY;
          return aTime - bTime;
        }
        case 'volume': {
          const aVolume = a.market.volume24h ?? 0;
          const bVolume = b.market.volume24h ?? 0;
          return bVolume - aVolume;
        }
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
            <TableHead className='w-full'>Market</TableHead>
            <TableHead className='w-px text-right'>Live Price</TableHead>
            <TableHead className='w-px text-right'>AIMM Fair</TableHead>
            <TableHead className='w-px text-right'>Mispricing (Δ)</TableHead>
            <TableHead className='w-px'>Position</TableHead>
            <TableHead className='w-px'>Last Run</TableHead>
            <TableHead className='w-px'>AIMM Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedMarkets.map(entry => {
            const { market, aimmStatus } = entry;
            const hasPrices = market.livePrice != null && market.aimmFairPrice != null;
            const mispricing = hasPrices
              ? calculateMispricing(market.livePrice as number, market.aimmFairPrice as number)
              : null;

            return (
              <Link href={`/markets/${market.id}`} key={market.id}>
                <TableRow className='group border-border hover:bg-muted/50 cursor-pointer'>
                  <TableCell className='w-full font-medium whitespace-normal'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-foreground group-hover:text-primary line-clamp-2 text-sm leading-snug transition-colors'>
                        {market.marketName}
                      </span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='text-muted-foreground border-border h-auto rounded-sm px-1.5 py-0 text-[10px] font-semibold tracking-wider uppercase'
                        >
                          {formatIdentifierWithEllipsis(market.platform)}
                        </Badge>
                        <span className='text-muted-foreground font-mono text-xs'>
                          {formatIdentifierWithEllipsis(market.symbol)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className='text-muted-foreground w-px text-right font-mono' suppressHydrationWarning>
                    {market.livePrice != null ? formatPercentage(market.livePrice) : 'N/A'}
                  </TableCell>

                  <TableCell className='w-px text-right font-mono font-medium text-blue-400' suppressHydrationWarning>
                    {market.aimmFairPrice != null ? formatPercentage(market.aimmFairPrice) : 'N/A'}
                  </TableCell>

                  <TableCell className='w-px text-right'>
                    {mispricing ? (
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
                    ) : (
                      <span className='text-muted-foreground text-xs'>N/A</span>
                    )}
                  </TableCell>

                  <TableCell className='w-px'>
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
                          <span className='text-[10px]'>{market.lastAction ?? 'No recent trades'}</span>
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className='w-px'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          market.aiRunStatus ? getStatusDotClass(market.aiRunStatus) : 'bg-muted-foreground/40'
                        )}
                      />
                      <span className='text-muted-foreground text-xs' suppressHydrationWarning>
                        {market.lastAIRun ? formatTimeAgo(market.lastAIRun) : 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className='w-px'>
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
              </Link>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
