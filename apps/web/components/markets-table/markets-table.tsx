'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshIcon } from 'hugeicons-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@workspace/ui/components/input-group';
import { Label } from '@workspace/ui/components/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { mockMarkets } from '@/lib/mock-data';
import type { Market } from '@/types/market';

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return `${seconds} secs ago`;
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function calculateMispricing(livePrice: number, aimmPrice: number): { absolute: number; relative: number } {
  const absolute = aimmPrice - livePrice;
  const relative = (absolute / livePrice) * 100;
  return { absolute, relative };
}

interface MarketsTableProps {
  platformFilter?: string;
  statusFilter?: string;
  sortBy?: 'mispricing' | 'timeToClose' | 'volume';
}

export function MarketsTable({
  platformFilter = 'all',
  statusFilter = 'all',
  sortBy = 'mispricing',
}: MarketsTableProps) {
  const router = useRouter();
  const [recomputingIds, setRecomputingIds] = useState<Set<string>>(new Set());

  const filteredAndSortedMarkets = useMemo(() => {
    let filtered = mockMarkets;

    if (platformFilter !== 'all') {
      filtered = filtered.filter(market => market.platform === platformFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(market => market.status === statusFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'mispricing': {
          const aMispricing = Math.abs(calculateMispricing(a.livePrice, a.aimmFairPrice).relative);
          const bMispricing = Math.abs(calculateMispricing(b.livePrice, b.aimmFairPrice).relative);
          return bMispricing - aMispricing;
        }
        case 'timeToClose':
          return a.timeToClose.getTime() - b.timeToClose.getTime();
        case 'volume':
          return b.volume24h - a.volume24h;
        default:
          return 0;
      }
    });

    return sorted;
  }, [platformFilter, statusFilter, sortBy]);

  const handleRecompute = (marketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecomputingIds(prev => new Set(prev).add(marketId));

    setTimeout(() => {
      setRecomputingIds(prev => {
        const next = new Set(prev);
        next.delete(marketId);
        return next;
      });
    }, 2000);
  };

  return (
    <div className='w-full overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow className='border-border hover:bg-transparent'>
            <TableHead className='w-[300px]'>Market</TableHead>
            <TableHead className='text-right'>Live Price</TableHead>
            <TableHead className='text-right'>AIMM Fair</TableHead>
            <TableHead className='text-center'>Confidence</TableHead>
            <TableHead className='text-right'>Mispricing (Δ)</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedMarkets.map(market => {
            const mispricing = calculateMispricing(market.livePrice, market.aimmFairPrice);
            const isRecomputing = recomputingIds.has(market.id);
            const confidence = 85; // Mock confidence

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

                <TableCell className='text-center'>
                  <div className='flex flex-col items-center gap-1'>
                    <span className='text-muted-foreground font-mono text-[10px]' suppressHydrationWarning>
                      {confidence}%
                    </span>
                    <div className='bg-muted h-1 w-16 overflow-hidden rounded-full'>
                      <div className='h-full bg-blue-500' style={{ width: `${confidence}%` }} />
                    </div>
                  </div>
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
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        market.aiRunStatus === 'success'
                          ? 'bg-green-500'
                          : market.aiRunStatus === 'stale'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      )}
                    />
                    <span className='text-muted-foreground text-xs' suppressHydrationWarning>
                      {formatTimeAgo(market.lastAIRun)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className='text-right'>
                  <div className='flex items-center justify-end gap-2' onClick={e => e.stopPropagation()}>
                    <AutomationConfigDialog market={market} />
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-muted-foreground hover:text-foreground h-7 px-2 text-xs font-medium'
                      onClick={e => handleRecompute(market.id, e)}
                      disabled={isRecomputing || market.aiRunStatus === 'running'}
                    >
                      <RefreshIcon className={cn('mr-1.5 h-3 w-3', isRecomputing && 'animate-spin')} />
                      Run
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-border text-muted-foreground hover:text-foreground hover:bg-muted h-7 bg-transparent px-3 text-xs font-medium'
                      asChild
                    >
                      <Link href={`/markets/${market.id}`}>Trade</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface AutomationConfigDialogProps {
  market: Market;
}

function AutomationConfigDialog({ market }: AutomationConfigDialogProps) {
  const [driftThresholdPts, setDriftThresholdPts] = useState<number>(5);
  const [maxSpendUsd, setMaxSpendUsd] = useState<number>(25000);
  const [slippagePts, setSlippagePts] = useState<number>(1);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground h-7 px-2 text-xs font-medium'
        >
          Config
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-sm font-medium'>Automation – {market.symbol}</DialogTitle>
          <DialogDescription className='text-xs'>
            Tune when the agent is allowed to place orders on this market. These values are demo-only for now.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4 space-y-4'>
          <div className='grid grid-cols-1 gap-4 text-sm'>
            <div className='space-y-1'>
              <Label htmlFor={`drift-${market.id}`} className='text-xs'>
                Drift threshold
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText className='text-[11px]'>Trigger when</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={`drift-${market.id}`}
                  type='number'
                  min={0}
                  step={0.1}
                  value={driftThresholdPts.toString()}
                  onChange={event => {
                    const value = Number(event.target.value);
                    setDriftThresholdPts(Number.isNaN(value) ? 0 : value);
                  }}
                  className='text-right text-sm'
                />
                <InputGroupAddon align='inline-end'>
                  <InputGroupText className='text-[11px]'>pts mispricing</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className='space-y-1'>
              <Label htmlFor={`max-spend-${market.id}`} className='text-xs'>
                Max spend per rebalance
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText className='text-[11px]'>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={`max-spend-${market.id}`}
                  type='number'
                  min={0}
                  step={100}
                  value={maxSpendUsd.toString()}
                  onChange={event => {
                    const value = Number(event.target.value);
                    setMaxSpendUsd(Number.isNaN(value) ? 0 : value);
                  }}
                  className='text-right text-sm'
                />
                <InputGroupAddon align='inline-end'>
                  <InputGroupText className='text-[11px]'>per rebalance</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className='space-y-1'>
              <Label htmlFor={`slippage-${market.id}`} className='text-xs'>
                Slippage tolerance
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText className='text-[11px]'>Allow up to</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={`slippage-${market.id}`}
                  type='number'
                  min={0}
                  step={0.05}
                  value={slippagePts.toString()}
                  onChange={event => {
                    const value = Number(event.target.value);
                    setSlippagePts(Number.isNaN(value) ? 0 : value);
                  }}
                  className='text-right text-sm'
                />
                <InputGroupAddon align='inline-end'>
                  <InputGroupText className='text-[11px]'>pts</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-4'>
          <Button type='button' variant='outline' size='sm'>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
