'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import Link from 'next/link';
import {
  Activity02Icon,
  ArrowLeft01Icon,
  ArrowLeftRightIcon,
  BrainIcon,
  FlashIcon,
  LinkSquare01Icon,
  ListViewIcon,
  PlayCircleIcon,
  RefreshIcon,
} from 'hugeicons-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@workspace/ui/components/input-group';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import type { Market, MarketAimmStatus } from '@/types/market';
// MOCK: MarketDetailData and related types currently come from seeded mock data in `@/lib/mock-market-detail`.
// When wiring real data, swap this to use the AIMM indexer / backend API response types instead.
import type { AgentRun, MarketDetailData, OrderBookLevel, TradeEvent } from '@/lib/mock-market-detail';
import {
  calculateMispricing,
  formatCompactUsd,
  formatPercentage,
  formatRelativeTime,
  formatSize,
  formatTimeRemaining,
  formatTimestamp,
  formatUsd,
  getAimmStatusLabel,
  getPositionBadgeClass,
  getSignalClass,
  getStatusBadgeClass,
  getStatusDotClass,
} from '@/lib/market-utils';
import { useUpdateMarketAutomationConfig } from '@workspace/aimm-sdk';
import { useMarketsStatus } from '@/components/markets-status-context';

const platformLabels: Record<Market['platform'], string> = {
  limitless: 'Limitless',
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
  'trump.fun': 'Trump.fun',
};

const platformLinks: Record<Market['platform'], string> = {
  limitless: 'https://limitlesslabs.ai',
  polymarket: 'https://polymarket.com',
  kalshi: 'https://kalshi.com',
  'trump.fun': 'https://trump.fun',
};

const priceChartConfig = {
  livePrice: {
    label: 'Live market',
    color: 'hsl(215 82% 72%)',
  },
  fairPrice: {
    label: 'AIMM fair',
    color: 'hsl(281 82% 75%)',
  },
};

const automationPresets = {
  conservative: {
    label: 'Conservative',
    driftThresholdPts: 8,
    maxSpendUsd: 10000,
    slippagePts: 0.5,
  },
  balanced: {
    label: 'Balanced',
    driftThresholdPts: 5,
    maxSpendUsd: 25000,
    slippagePts: 1,
  },
  aggressive: {
    label: 'Aggressive',
    driftThresholdPts: 3,
    maxSpendUsd: 50000,
    slippagePts: 1.5,
  },
} as const;

type AutomationPresetKey = keyof typeof automationPresets;

type RebalanceMode = 'auto' | 'simulate';

interface MarketDetailViewProps {
  market: Market;
  detail: MarketDetailData;
}

export function MarketDetailView({ market, detail }: MarketDetailViewProps) {
  const [recomputeState, setRecomputeState] = useState<'idle' | 'running' | 'success'>('idle');
  const [rebalanceState, setRebalanceState] = useState<'idle' | 'executing' | 'success'>('idle');
  const [rebalanceMode, setRebalanceMode] = useState<RebalanceMode>('auto');
  const [driftThresholdPts, setDriftThresholdPts] = useState<number>(automationPresets.balanced.driftThresholdPts);
  const [maxSpendUsd, setMaxSpendUsd] = useState<number>(automationPresets.balanced.maxSpendUsd);
  const [slippagePts, setSlippagePts] = useState<number>(automationPresets.balanced.slippagePts);
  const recomputeTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const rebalanceTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const {
    updateConfig: updateAutomationConfig,
    isPending: isSavingAutomation,
    isConfirming: isConfirmingAutomation,
    isConfirmed: isAutomationSaved,
    error: automationError,
  } = useUpdateMarketAutomationConfig(market.id);

  useEffect(() => {
    return () => {
      clearTimerGroup(recomputeTimers);
      clearTimerGroup(rebalanceTimers);
    };
  }, []);

  const { getStatus: getAimmStatusOverride, setStatus: setAimmStatus } = useMarketsStatus();

  const mispricing = useMemo(
    () => calculateMispricing(market.livePrice, market.aimmFairPrice),
    [market.livePrice, market.aimmFairPrice]
  );

  const latestRun = detail.runs[0];
  const aimmStatus: MarketAimmStatus = useMemo(() => {
    const override = getAimmStatusOverride(market.id);
    return override ?? market.aimmStatus ?? 'ACTIVE';
  }, [getAimmStatusOverride, market.aimmStatus, market.id]);
  const statusBadgeClass = getStatusBadgeClass(market.status);
  const platformLabel = platformLabels[market.platform];
  const externalUrl = `${platformLinks[market.platform]}/markets/${market.symbol.toLowerCase()}`;
  const bestBid = detail.orderBook.bids[0];
  const bestAsk = detail.orderBook.asks[0];
  const spreadBps = bestBid && bestAsk ? ((bestAsk.price - bestBid.price) * 100).toFixed(1) : null;

  const automationSummary = useMemo(() => {
    return `${driftThresholdPts.toFixed(1)} pts drift • $${formatCompactUsd(maxSpendUsd)} max • ${slippagePts.toFixed(2)} pts slip`;
  }, [driftThresholdPts, maxSpendUsd, slippagePts]);

  const handleRecompute = () => {
    if (recomputeState === 'running') return;
    setRecomputeState('running');
    clearTimerGroup(recomputeTimers);

    const finishId = setTimeout(() => {
      setRecomputeState('success');
      const resetId = setTimeout(() => setRecomputeState('idle'), 2400);
      recomputeTimers.current.push(resetId);
    }, 1800);

    recomputeTimers.current.push(finishId);
  };

  const handleRebalance = (mode: RebalanceMode) => {
    if (rebalanceState === 'executing') return;
    setRebalanceMode(mode);
    setRebalanceState('executing');
    clearTimerGroup(rebalanceTimers);

    const finishId = setTimeout(
      () => {
        setRebalanceState('success');
        const resetId = setTimeout(() => setRebalanceState('idle'), 3200);
        rebalanceTimers.current.push(resetId);
      },
      mode === 'auto' ? 2400 : 1600
    );

    rebalanceTimers.current.push(finishId);
  };

  const recomputeLabel =
    recomputeState === 'running' ? 'Recomputing…' : recomputeState === 'success' ? 'Updated' : 'Recompute fair price';
  const rebalanceLabel =
    rebalanceState === 'executing'
      ? rebalanceMode === 'auto'
        ? 'Auto-rebalancing…'
        : 'Simulating…'
      : rebalanceState === 'success'
        ? rebalanceMode === 'auto'
          ? 'Auto-rebalanced'
          : 'Simulation ready'
        : 'Auto-rebalance';

  const actionStatusCopy =
    rebalanceState === 'executing'
      ? `${rebalanceMode === 'auto' ? 'Auto' : 'Simulated'} rebalance in-flight`
      : rebalanceState === 'success'
        ? `${rebalanceMode === 'auto' ? 'Orders synced to Base' : 'Suggested orders ready'}`
        : market.agentPosition
          ? 'Position within risk band'
          : 'Flat — ready to enter inventory';

  return (
    <div className='bg-background flex-1'>
      <div className='mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 pt-6 pb-10'>
        <div className='flex flex-col gap-4'>
          <Button
            variant='link'
            className='text-muted-foreground hover:text-foreground h-auto w-fit gap-2 px-0 text-xs'
            asChild
          >
            <Link href='/' className='flex items-center gap-1.5'>
              <ArrowLeft01Icon className='size-3.5' />
              Back to markets
            </Link>
          </Button>

          <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
            <div className='space-y-2'>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-foreground text-2xl font-semibold tracking-tight'>{market.title}</h1>
                <Badge variant='outline' className={statusBadgeClass}>
                  {market.status === 'open' ? 'Open' : market.status === 'suspended' ? 'Suspended' : 'Closed'}
                </Badge>
                {latestRun ? (
                  <Badge variant='outline' className='border-border/50 font-mono text-[11px] tracking-tight uppercase'>
                    {latestRun.modelVersion}
                  </Badge>
                ) : null}
              </div>

              <div className='text-muted-foreground flex flex-wrap items-center gap-3 text-xs'>
                <span className='flex items-center gap-1.5'>
                  <span className='bg-muted-foreground h-1.5 w-1.5 rounded-full' />
                  {platformLabel}
                </span>
                <span className='text-muted-foreground/50'>•</span>
                <span className='font-mono text-[11px]'>{market.symbol}</span>
                <span className='text-muted-foreground/50'>•</span>
                <span>Closes {formatTimeRemaining(market.timeToClose)}</span>
                <span className='text-muted-foreground/50'>•</span>
                <Link
                  href={externalUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-foreground flex items-center gap-1 underline-offset-4 hover:underline'
                >
                  View on {platformLabel}
                  <LinkSquare01Icon className='size-3' />
                </Link>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              <Select
                value={aimmStatus}
                onValueChange={value => {
                  const nextStatus = value as MarketAimmStatus;
                  setAimmStatus(market.id, nextStatus);
                }}
              >
                <SelectTrigger
                  className={cn(
                    'h-9 w-[150px] border px-3 text-xs font-medium transition-colors',
                    aimmStatus === 'ACTIVE'
                      ? 'border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/15'
                      : aimmStatus === 'INACTIVE'
                        ? 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/40'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
                  )}
                >
                  <SelectValue>
                    <span className='flex items-center gap-2'>
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
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
                      <span className='h-2 w-2 rounded-full bg-green-400' />
                      Active
                    </span>
                  </SelectItem>
                  <SelectItem value='INACTIVE' className='text-xs'>
                    <span className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-muted-foreground' />
                      Inactive
                    </span>
                  </SelectItem>
                  <SelectItem value='EXTERNALLY_CLOSED' className='text-xs'>
                    <span className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-amber-400' />
                      Externally closed
                    </span>
                  </SelectItem>
                  <SelectItem value='INTERNALLY_CLOSED' className='text-xs'>
                    <span className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-amber-400' />
                      Internally closed
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                onClick={handleRecompute}
                disabled={recomputeState === 'running'}
                className='border-border bg-background gap-2 text-xs'
              >
                <RefreshIcon className={`size-4 ${recomputeState === 'running' ? 'animate-spin' : ''}`} />
                {recomputeLabel}
              </Button>
              <Button
                onClick={() => handleRebalance('auto')}
                disabled={rebalanceState === 'executing'}
                className='bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90 gap-2 px-4 text-xs shadow-lg'
              >
                <FlashIcon className='size-4' />
                {rebalanceLabel}
              </Button>
              <Button variant='ghost' className='text-muted-foreground hover:text-foreground gap-2 text-xs' asChild>
                <Link href={externalUrl} target='_blank' rel='noreferrer' className='flex items-center gap-1'>
                  <Activity02Icon className='size-4' />
                  Open market
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Live price</p>
              <p className='text-foreground font-mono text-2xl font-semibold'>{formatPercentage(market.livePrice)}</p>
            </CardContent>
          </Card>

          <Card className='bg-card/40 relative overflow-hidden border-blue-500/30'>
            <CardContent className='p-4'>
              <div className='absolute top-0 right-0 opacity-10'>
                <BrainIcon className='size-16 text-blue-500' />
              </div>
              <p className='text-[11px] tracking-wide text-blue-300 uppercase'>AIMM fair price</p>
              <p className='font-mono text-2xl font-semibold text-blue-300'>{formatPercentage(market.aimmFairPrice)}</p>
            </CardContent>
          </Card>

          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Mispricing (Δ)</p>
              <p
                className={`font-mono text-2xl font-semibold ${
                  mispricing.relative >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {mispricing.relative >= 0 ? '+' : ''}
                {mispricing.relative.toFixed(1)}%
              </p>
              <p className='text-muted-foreground text-[11px]'>
                {mispricing.absolute >= 0 ? '+' : ''}
                {(mispricing.absolute * 100).toFixed(1)} pts
              </p>
            </CardContent>
          </Card>

          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>24h volume</p>
              <p className='text-foreground text-2xl font-semibold'>{formatUsd(market.volume24h)}</p>
              <p className='text-muted-foreground text-[11px]'>Across Limitless & partners</p>
            </CardContent>
          </Card>

          <Card className='bg-card/40'>
            <CardContent className='space-y-3 p-4'>
              <div>
                <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Time to close</p>
                <p className='text-foreground text-2xl font-semibold'>{formatTimeRemaining(market.timeToClose)}</p>
              </div>
              <div className='space-y-1'>
                <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                  <span>Confidence</span>
                  <span className='text-foreground font-mono text-xs'>{latestRun?.confidence ?? 0}%</span>
                </div>
                <div className='bg-muted h-1.5 w-full rounded-full'>
                  <div
                    className='h-full rounded-full bg-blue-500 transition-all'
                    style={{ width: `${latestRun?.confidence ?? 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <Card className='bg-card/40 h-full'>
              <CardHeader className='border-border/60 flex flex-row items-center justify-between gap-4 border-b pb-3'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Activity02Icon className='text-muted-foreground size-4' />
                  Price history
                </div>
                <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-(--color-livePrice)' />
                    Live
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-(--color-fairPrice)' />
                    AIMM
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <ChartContainer config={priceChartConfig} className='h-[320px] w-full'>
                  <LineChart data={detail.priceHistory} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='4 4' stroke='hsl(var(--border))' />
                    <XAxis
                      dataKey='timestamp'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      stroke='hsl(var(--muted-foreground))'
                    />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={value => `${Math.round((value as number) * 100)}%`}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      fontSize={11}
                      stroke='hsl(var(--muted-foreground))'
                    />
                    <ChartTooltip
                      cursor={{ strokeDasharray: '4 4' }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className='flex w-full items-center justify-between gap-4'>
                              <span className='text-muted-foreground text-xs'>
                                {priceChartConfig[name as keyof typeof priceChartConfig]?.label ?? name}
                              </span>
                              <span className='text-foreground font-mono text-sm font-semibold'>
                                {formatPercentage(value as number)}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type='monotone'
                      dataKey='livePrice'
                      stroke='var(--color-livePrice)'
                      strokeWidth={2.5}
                      dot={false}
                      strokeLinecap='round'
                      isAnimationActive={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='fairPrice'
                      stroke='var(--color-fairPrice)'
                      strokeWidth={2.5}
                      dot={false}
                      strokeLinecap='round'
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              <Card className='bg-card/40'>
                <CardHeader className='border-border/60 flex flex-row items-center justify-between gap-2 border-b pb-3'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <ListViewIcon className='text-muted-foreground size-4' />
                    Order book depth
                  </div>
                  <div className='text-muted-foreground text-xs'>Spread {spreadBps ?? '—'} bps</div>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='text-muted-foreground grid grid-cols-2 gap-4 text-[11px] uppercase'>
                    <span>Bids</span>
                    <span>Asks</span>
                  </div>
                  <div className='mt-3 grid grid-cols-2 gap-4 text-xs font-medium'>
                    <div className='space-y-2'>
                      {detail.orderBook.bids.map(level => (
                        <OrderBookRow key={`bid-${level.price}`} level={level} side='bid' />
                      ))}
                    </div>
                    <div className='space-y-2'>
                      {detail.orderBook.asks.map(level => (
                        <OrderBookRow key={`ask-${level.price}`} level={level} side='ask' />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-card/40'>
                <CardHeader className='border-border/60 flex flex-row items-center justify-between gap-2 border-b pb-3'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <ArrowLeftRightIcon className='text-muted-foreground size-4' />
                    Recent fills
                  </div>
                  <div className='text-muted-foreground text-xs'>Agent executions (last hour)</div>
                </CardHeader>
                <CardContent className='pt-4'>
                  <ScrollArea className='h-[220px] pr-4'>
                    <div className='space-y-3'>
                      {detail.trades.map(trade => (
                        <TradeRow key={trade.id} trade={trade} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='flex flex-col gap-6 lg:col-span-4'>
            <Card className='bg-card/40'>
              <CardHeader className='border-border/60 border-b pb-3'>
                <div className='flex flex-col gap-1.5'>
                  <CardTitle className='text-sm font-medium'>Automation settings</CardTitle>
                  <p className='text-muted-foreground text-xs'>
                    When should the agent auto-rebalance this market? UI-only in this build.
                  </p>
                  <div className='bg-muted/60 text-muted-foreground mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-400/80' />
                    <span className='font-mono'>{automationSummary}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4 pt-4'>
                <div className='flex flex-wrap items-center gap-2 text-[11px]'>
                  <span className='text-muted-foreground'>Quick presets:</span>
                  {(['conservative', 'balanced', 'aggressive'] as AutomationPresetKey[]).map(key => {
                    const preset = automationPresets[key];
                    return (
                      <Button
                        key={key}
                        type='button'
                        variant='outline'
                        size='sm'
                        className='border-border/60 bg-transparent px-2.5 py-0 text-[11px] font-medium'
                        onClick={() => {
                          setDriftThresholdPts(preset.driftThresholdPts);
                          setMaxSpendUsd(preset.maxSpendUsd);
                          setSlippagePts(preset.slippagePts);
                        }}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </div>

                <div className='grid grid-cols-1 gap-4 text-sm sm:grid-cols-2'>
                  <div className='space-y-1'>
                    <Label htmlFor='drift-threshold' className='text-xs'>
                      Drift threshold
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText className='text-[11px]'>Trigger when</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id='drift-threshold'
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
                    <p className='text-muted-foreground text-[11px]'>
                      Minimum gap between live and AIMM fair price before the agent is allowed to act.
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <Label htmlFor='max-spend' className='text-xs'>
                      Max spend per rebalance
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText className='text-[11px]'>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id='max-spend'
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
                    <p className='text-muted-foreground text-[11px]'>
                      Hard cap on notional inventory the agent can deploy in a single run.
                    </p>
                  </div>

                  <div className='space-y-1 sm:col-span-2'>
                    <Label htmlFor='slippage-tolerance' className='text-xs'>
                      Slippage tolerance
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText className='text-[11px]'>Allow up to</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id='slippage-tolerance'
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
                        <InputGroupText className='text-[11px]'>pts of price move</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <p className='text-muted-foreground text-[11px]'>
                      How far execution can drift from target fair price while orders are filled.
                    </p>
                  </div>
                </div>
                <div className='flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between'>
                  <Button
                    type='button'
                    className='bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90 min-w-[160px] gap-2 px-4 text-xs shadow-lg'
                    disabled={isSavingAutomation || isConfirmingAutomation}
                    onClick={() =>
                      updateAutomationConfig({
                        driftThresholdPts,
                        maxSpendUsd,
                        slippagePts,
                      })
                    }
                  >
                    {isSavingAutomation || isConfirmingAutomation
                      ? 'Saving to contract…'
                      : isAutomationSaved
                        ? 'Saved to contract'
                        : 'Save automation to contract'}
                  </Button>
                  {automationError ? (
                    <p className='text-destructive text-[11px] sm:text-right'>{automationError.message}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card/40'>
              <CardHeader className='border-border/60 border-b pb-3'>
                <div className='flex items-center justify-between gap-2'>
                  <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                    <BrainIcon className='text-muted-foreground size-4' />
                    Agent reasoning
                  </CardTitle>
                  <div className='text-muted-foreground flex items-center gap-2 text-[11px]'>
                    <span className={`h-2 w-2 rounded-full ${getStatusDotClass(market.aiRunStatus)}`} />
                    Last run {formatRelativeTime(market.lastAIRun)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                <ScrollArea className='h-[360px] pr-4'>
                  <div className='space-y-4'>
                    {detail.runs.map(run => (
                      <RunAccordion key={run.id} run={run} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className='border-border/60 bg-muted/10 flex flex-col gap-3 border-t pt-4'>
                <div className='text-muted-foreground flex w-full items-center justify-between text-xs'>
                  <span>Current position</span>
                  <Badge variant='outline' className={getPositionBadgeClass(market.agentPosition)}>
                    {market.agentPosition ?? 'Flat'}
                  </Badge>
                </div>
                <div className='text-muted-foreground flex w-full items-center justify-between text-xs'>
                  <span>Last action</span>
                  <span className='text-foreground font-medium'>{market.lastAction ?? 'No recent trades'}</span>
                </div>
                <div className='border-border/70 rounded-md border border-dashed px-3 py-2 text-xs'>
                  <span className='text-muted-foreground'>Execution status:</span>{' '}
                  <span className='text-foreground font-medium'>{actionStatusCopy}</span>
                </div>
                <div className='flex w-full gap-2'>
                  <Button
                    variant='secondary'
                    className='border-border bg-muted flex-1 gap-2 border text-xs'
                    disabled={rebalanceState === 'executing'}
                    onClick={() => handleRebalance('simulate')}
                  >
                    <PlayCircleIcon className='size-4' />
                    Simulate rebalance
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderBookRow({ level, side }: { level: OrderBookLevel; side: 'bid' | 'ask' }) {
  const color = side === 'bid' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200';
  return (
    <div className='border-border/60 flex items-center justify-between rounded-md border px-2 py-1.5 text-[13px]'>
      <div className={`rounded-sm px-1.5 py-0.5 font-mono text-xs ${color}`}>{level.price.toFixed(3)}</div>
      <div className='text-muted-foreground'>{formatSize(level.size)}</div>
    </div>
  );
}

function TradeRow({ trade }: { trade: TradeEvent }) {
  const sideColor = trade.side === 'buy' ? 'text-green-400' : 'text-red-400';
  return (
    <div className='border-border/60 rounded-md border p-3 text-sm'>
      <div className='text-muted-foreground flex items-center justify-between text-xs'>
        <span>{formatTimestamp(trade.timestamp)}</span>
        <span className={sideColor}>{trade.side.toUpperCase()}</span>
      </div>
      <div className='mt-1 flex items-center justify-between font-mono text-[13px]'>
        <span>{formatPercentage(trade.price)}</span>
        <span>{formatSize(trade.size)} contracts</span>
      </div>
      <p className='text-muted-foreground mt-1 text-xs'>Venue: {trade.venue}</p>
      <p className='text-muted-foreground/80 text-xs'>Status: {trade.status}</p>
    </div>
  );
}

function RunAccordion({ run }: { run: AgentRun }) {
  return (
    <div className='border-border/60 rounded-lg border p-3'>
      <div className='text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs'>
        <div className='flex items-center gap-2'>
          <span className={`h-2 w-2 rounded-full ${getStatusDotClass(run.status)}`} />
          {formatRelativeTime(run.timestamp)}
        </div>
        <div className='text-foreground flex items-center gap-3 font-mono text-[11px]'>
          <span>{formatPercentage(run.fairPrice)}</span>
          <Separator orientation='vertical' className='bg-border h-4' />
          <span>{run.durationSeconds}s</span>
        </div>
      </div>
      <p className='text-foreground mt-2 text-sm'>{run.summary}</p>
      <div className='mt-3 flex flex-wrap gap-2'>
        {run.signals.map(signal => (
          <Badge
            key={signal.id}
            variant='outline'
            className={`border-border/60 text-[11px] ${getSignalClass(signal.strength)}`}
          >
            {signal.label}
          </Badge>
        ))}
      </div>
      <div className='text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-[11px]'>
        <div>
          Live at run
          <p className='text-foreground font-mono text-sm'>{formatPercentage(run.livePriceAtRun)}</p>
        </div>
        <div>
          Δ vs live
          <p className='text-foreground font-mono text-sm'>
            {run.delta >= 0 ? '+' : ''}
            {(run.delta * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function clearTimerGroup(store: MutableRefObject<Array<ReturnType<typeof setTimeout>>>) {
  for (const timerId of store.current) {
    clearTimeout(timerId);
  }
  store.current = [];
}
