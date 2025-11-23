'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/chart';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@workspace/ui/components/input-group';
import { Label } from '@workspace/ui/components/label';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import {
  Activity02Icon,
  ArrowLeft01Icon,
  ArrowLeftRightIcon,
  BrainIcon,
  FlashIcon,
  LinkSquare01Icon,
  RefreshIcon,
} from 'hugeicons-react';
import Link from 'next/link';
import { JSX, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useX402 } from '@coinbase/cdp-hooks';
import { decodeXPaymentResponse } from 'x402-fetch';

import type { Market, MarketAimmStatus } from '@/types/market';
// MOCK: MarketDetailData and related types currently come from seeded mock data in `@/lib/mock-market-detail`.
// When wiring real data, swap this to use the AIMM indexer / backend API response types instead.
import { useMarketsStatus } from '@/components/markets-status-context';
import {
  calculateMispricing,
  formatCompactUsd,
  formatIdentifierWithEllipsis,
  formatPercentage,
  formatSize,
  formatTimestamp,
  formatUsd,
  getAimmStatusLabel,
  getStatusBadgeClass,
} from '@/lib/market-utils';
import { useUpdateMarketStatus } from '@/hooks/use-update-market-status';
import { useUpdateMarketAutomationConfig } from '@/hooks/use-update-market-automation-config';
import type { MarketDetailData, TradeEvent } from '@/lib/mock-market-detail';
import { LiveAgentActions } from '@/components/live-agent-actions';
import { PlatformAvatar } from '@/components/platform-avatar';

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

interface PriceUpdateSuccessResponse {
  message: string;
  timestamp: string;
  paid: boolean;
  payment_verified: boolean;
  market_ticker: string;
  /**
   * `price_update` is produced by the external AIMM agent backend, so we treat it as opaque here.
   */
  price_update: unknown;
}

interface PriceUpdateErrorResponse {
  error: string;
  details?: string;
}

type PriceUpdateResult =
  | { ok: true; data: PriceUpdateSuccessResponse }
  | { ok: false; error: PriceUpdateErrorResponse };

interface MarketDetailViewProps {
  market: Market;
  detail: MarketDetailData;
}

export function MarketDetailView({ market, detail }: MarketDetailViewProps): JSX.Element {
  const [recomputeState, setRecomputeState] = useState<'idle' | 'running' | 'success'>('idle');
  const [rebalanceState, setRebalanceState] = useState<'idle' | 'executing' | 'success'>('idle');
  const [rebalanceMode, setRebalanceMode] = useState<RebalanceMode>('auto');
  const [driftThresholdPts, setDriftThresholdPts] = useState<number>(automationPresets.balanced.driftThresholdPts);
  const [maxSpendUsd, setMaxSpendUsd] = useState<number>(automationPresets.balanced.maxSpendUsd);
  const [slippagePts, setSlippagePts] = useState<number>(automationPresets.balanced.slippagePts);
  const recomputeTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const rebalanceTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const [recomputeError, setRecomputeError] = useState<string | null>(null);
  const {
    updateConfig: updateAutomationConfig,
    isPending: isSavingAutomation,
    isConfirming: isConfirmingAutomation,
    isConfirmed: isAutomationSaved,
    error: automationError,
  } = useUpdateMarketAutomationConfig(market.id);
  const {
    updateStatus: updateMarketStatus,
    isPending: isUpdatingStatus,
    isConfirming: isConfirmingStatus,
  } = useUpdateMarketStatus();
  const { fetchWithPayment } = useX402();

  useEffect(() => {
    return () => {
      clearTimerGroup(recomputeTimers);
      clearTimerGroup(rebalanceTimers);
    };
  }, []);

  const { getStatus: getAimmStatusOverride, setStatus: setAimmStatus } = useMarketsStatus();

  const mispricing = useMemo(() => {
    if (market.livePrice == null || market.aimmFairPrice == null) {
      return null;
    }

    return calculateMispricing(market.livePrice, market.aimmFairPrice);
  }, [market.livePrice, market.aimmFairPrice]);

  const latestRun = detail.runs[0];
  const aimmStatus: MarketAimmStatus = useMemo(() => {
    const override = getAimmStatusOverride(market.id);
    return override ?? market.aimmStatus ?? 'ACTIVE';
  }, [getAimmStatusOverride, market.aimmStatus, market.id]);
  const trimmedTitle = market.title.trim();
  const trimmedName = market.marketName.trim();
  const hasSubtitle = trimmedTitle.length > 0 && trimmedTitle !== trimmedName;
  const isClosedStatus = aimmStatus === 'EXTERNALLY_CLOSED' || aimmStatus === 'INTERNALLY_CLOSED';
  const isStatusSelectDisabled = isClosedStatus || isUpdatingStatus || isConfirmingStatus;
  const statusBadgeClass = getStatusBadgeClass(market.status);
  const platformLabel = platformLabels[market.platform];
  const externalUrl = `${platformLinks[market.platform]}/markets/${market.symbol.toLowerCase()}`;

  const automationSummary = useMemo(() => {
    return `${driftThresholdPts.toFixed(1)} pts drift • $${formatCompactUsd(maxSpendUsd)} max • ${slippagePts.toFixed(2)} pts slip`;
  }, [driftThresholdPts, maxSpendUsd, slippagePts]);

  const callX402Recompute = async (): Promise<PriceUpdateResult> => {
    const url = `/api/402?market_ticker=${encodeURIComponent(market.symbol)}`;

    try {
      const response = await fetchWithPayment(url, {
        method: 'GET',
      });

      // Log the response body and x402 payment response header for debugging
      const body = await response.json();
      console.log('x402 response body', body);

      const xPaymentResponseHeader = response.headers.get('x-payment-response');
      if (xPaymentResponseHeader) {
        try {
          const paymentResponse = decodeXPaymentResponse(xPaymentResponseHeader);
          console.log('x402 payment response', paymentResponse);
        } catch (decodeError) {
          console.error('Failed to decode x-payment-response header', decodeError);
        }
      } else {
        console.log('No x-payment-response header found');
      }

      if (!response.ok) {
        console.error('x402 recompute response not ok', response);

        // Body is already parsed above
        const errorBody = body as PriceUpdateErrorResponse;

        if (errorBody && typeof errorBody.error === 'string') {
          return { ok: false, error: errorBody };
        }

        return {
          ok: false,
          error: {
            error: `Request failed with status ${response.status}`,
          },
        };
      }

      // Body is already parsed above
      const data = body as PriceUpdateSuccessResponse;
      return { ok: true, data };
    } catch (error: unknown) {
      console.error('x402 recompute fetchWithPayment threw', error);
      throw error;
    }
  };

  const handleRecompute = async () => {
    if (recomputeState === 'running') return;
    setRecomputeError(null);
    setRecomputeState('running');
    clearTimerGroup(recomputeTimers);

    try {
      const result = await callX402Recompute();

      if (!result.ok) {
        const { error } = result;
        const messageParts: string[] = [];

        if (error.error.length > 0) {
          messageParts.push(error.error);
        }

        if (error.details && error.details.length > 0) {
          messageParts.push(error.details);
        }

        const message =
          messageParts.length > 0 ? messageParts.join(' — ') : 'Failed to recompute fair price. Please try again.';

        setRecomputeError(message);
        setRecomputeState('idle');
        return;
      }

      setRecomputeState('success');
      const resetId = setTimeout(() => setRecomputeState('idle'), 2400);
      recomputeTimers.current.push(resetId);
    } catch (error: unknown) {
      console.error('handleRecompute failed', error);

      const message =
        error instanceof Error && error.message.length > 0
          ? `Unexpected error: ${error.message}`
          : 'Unexpected error while recomputing fair price. Please try again.';

      setRecomputeError(message);
      setRecomputeState('idle');
    }
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
                <h1 className='text-foreground text-2xl font-semibold tracking-tight'>{market.marketName}</h1>
                <Badge variant='outline' className={statusBadgeClass}>
                  {market.status === 'open' ? 'Open' : market.status === 'suspended' ? 'Suspended' : 'Closed'}
                </Badge>
                {latestRun ? (
                  <Badge variant='outline' className='border-border/50 font-mono text-[11px] tracking-tight uppercase'>
                    {latestRun.modelVersion}
                  </Badge>
                ) : null}
              </div>

              {hasSubtitle ? (
                <p className='text-muted-foreground max-w-3xl text-sm leading-relaxed'>{trimmedTitle}</p>
              ) : null}

              <div className='text-muted-foreground flex flex-wrap items-center gap-3 text-xs'>
                <span className='flex items-center gap-2'>
                  <PlatformAvatar platform={market.platform} size={18} />
                  <span className='flex items-center gap-1.5'>
                    <span className='bg-muted-foreground h-1.5 w-1.5 rounded-full' />
                    {platformLabel}
                  </span>
                </span>
                <span className='text-muted-foreground/50'>•</span>
                <span className='font-mono text-[11px]'>{formatIdentifierWithEllipsis(market.symbol)}</span>
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

                  if (nextStatus === 'ACTIVE' || nextStatus === 'INACTIVE') {
                    setAimmStatus(market.id, nextStatus);
                    updateMarketStatus(market.id, nextStatus);
                  }
                }}
                disabled={isStatusSelectDisabled}
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
                      <span className='bg-muted-foreground h-2 w-2 rounded-full' />
                      Inactive
                    </span>
                  </SelectItem>
                  {isClosedStatus ? (
                    <>
                      <SelectItem value='EXTERNALLY_CLOSED' className='text-xs' disabled>
                        <span className='flex items-center gap-2'>
                          <span className='h-2 w-2 rounded-full bg-amber-400' />
                          Externally closed
                        </span>
                      </SelectItem>
                      <SelectItem value='INTERNALLY_CLOSED' className='text-xs' disabled>
                        <span className='flex items-center gap-2'>
                          <span className='h-2 w-2 rounded-full bg-amber-400' />
                          Internally closed
                        </span>
                      </SelectItem>
                    </>
                  ) : null}
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
              {recomputeError ? <span className='text-destructive text-[11px]'>{recomputeError}</span> : null}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Live price</p>
              <p className='text-foreground font-mono text-2xl font-semibold'>
                {market.livePrice != null ? formatPercentage(market.livePrice) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-card/40 relative overflow-hidden border-blue-500/30'>
            <CardContent className='p-4'>
              <div className='absolute top-0 right-0 opacity-10'>
                <BrainIcon className='size-16 text-blue-500' />
              </div>
              <p className='text-[11px] tracking-wide text-blue-300 uppercase'>AIMM fair price</p>
              <p className='font-mono text-2xl font-semibold text-blue-300'>
                {market.aimmFairPrice != null ? formatPercentage(market.aimmFairPrice) : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Mispricing (Δ)</p>
              {mispricing ? (
                <>
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
                </>
              ) : (
                <p className='text-muted-foreground text-sm'>N/A</p>
              )}
            </CardContent>
          </Card>

          <Card className='bg-card/40'>
            <CardContent className='p-4'>
              <p className='text-muted-foreground text-[11px] tracking-wide uppercase'>Volume</p>
              <p className='text-foreground text-2xl font-semibold'>
                {market.volume24h != null ? formatUsd(market.volume24h) : 'N/A'}
              </p>
              <p className='text-muted-foreground text-[11px]'>Across Limitless & partners</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          <div className='flex flex-col gap-6 lg:col-span-8'>
            <Card className='bg-card/40'>
              <CardHeader className='border-border/60 flex flex-row items-center justify-between gap-4 border-b pb-3'>
                <div className='flex items-center gap-2 text-sm font-medium'>
                  <Activity02Icon className='text-muted-foreground size-4' />
                  Price history
                </div>
                <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <span
                      className='h-2 w-2 rounded-full'
                      style={{ backgroundColor: priceChartConfig.livePrice.color }}
                    />
                    Live
                  </div>
                  <div className='flex items-center gap-1'>
                    <span
                      className='h-2 w-2 rounded-full'
                      style={{ backgroundColor: priceChartConfig.fairPrice.color }}
                    />
                    AIMM
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <ChartContainer config={priceChartConfig} className='h-[320px] w-full'>
                  <LineChart data={detail.priceHistory} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray='4 4' stroke='var(--border)' />
                    <XAxis
                      dataKey='timestamp'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tickFormatter={value => Math.round((value as number) * 100).toString()}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
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
                <div className='flex items-center justify-between gap-2'>
                  <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                    <BrainIcon className='size-4 text-yellow-400' />
                    Live agent actions
                  </CardTitle>
                  <span className='text-muted-foreground text-[11px]'>Scoped to {market.symbol}</span>
                </div>
              </CardHeader>
              <CardContent className='p-0'>
                <LiveAgentActions marketTicker={market.symbol} hideHeader />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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

function clearTimerGroup(store: MutableRefObject<Array<ReturnType<typeof setTimeout>>>) {
  for (const timerId of store.current) {
    clearTimeout(timerId);
  }
  store.current = [];
}
