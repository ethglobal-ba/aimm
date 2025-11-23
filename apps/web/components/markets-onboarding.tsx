'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@workspace/ui/components/input-group';
import { Label } from '@workspace/ui/components/label';
import { Text } from '@workspace/ui/components/text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { useDemoOnboarding } from '@/components/demo-onboarding-context';
import { formatIdentifierWithEllipsis } from '@/lib/market-utils';
import { useGetMarketsQuery } from '@/lib/generated/hooks';
import type { GetMarketsQuery } from '@/lib/generated/graphql';
import { useMarketsStatus } from '@/components/markets-status-context';
import type { MarketAimmStatus } from '@/types/market';

type AutomationInterval = 'on_price_update' | '5m' | '15m' | '1h';

interface OnboardingMarket {
  id: string;
  title: string;
  platform: string;
  symbol: string;
}

interface MarketAutomationConfig {
  driftThresholdPts: number;
  maxSpendUsd: number;
  slippagePts: number;
  interval: AutomationInterval;
}

const DEFAULT_CONFIG: MarketAutomationConfig = {
  driftThresholdPts: 5,
  maxSpendUsd: 25000,
  slippagePts: 1,
  interval: 'on_price_update',
};

const INTERVAL_OPTIONS: { value: AutomationInterval; label: string }[] = [
  { value: 'on_price_update', label: 'Every price update' },
  { value: '5m', label: 'Every 5 minutes' },
  { value: '15m', label: 'Every 15 minutes' },
  { value: '1h', label: 'Every hour' },
];

export function MarketsOnboarding(): JSX.Element {
  const { isDemoOnboardingMode, toggleDemoOnboardingMode } = useDemoOnboarding();

  const { data, loading, error } = useGetMarketsQuery();
  const { setStatus: setAimmStatus } = useMarketsStatus();

  const indexerMarkets: OnboardingMarket[] = useMemo(() => {
    if (!data?.markets?.items) {
      return [];
    }

    return data.markets.items.map((item: GetMarketsQuery['markets']['items'][number]): OnboardingMarket => ({
      id: item.id,
      title: item.marketName,
      platform: item.platform,
      symbol: item.externalId,
    }));
  }, [data]);

  const candidateMarkets: OnboardingMarket[] = indexerMarkets;

  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>([]);
  const [configsByMarket, setConfigsByMarket] = useState<Record<string, MarketAutomationConfig>>({});

  useEffect(() => {
    if (candidateMarkets.length === 0) {
      setConfigsByMarket({});
      setSelectedMarketIds([]);
      return;
    }

    setConfigsByMarket(prevConfigs => {
      const nextConfigs: Record<string, MarketAutomationConfig> = {};

      candidateMarkets.forEach(market => {
        nextConfigs[market.id] = prevConfigs[market.id] ?? { ...DEFAULT_CONFIG };
      });

      return nextConfigs;
    });
  }, [candidateMarkets]);

  useEffect(() => {
    if (candidateMarkets.length === 0) {
      return;
    }

    const validIds = new Set(candidateMarkets.map(market => market.id));
    setSelectedMarketIds(prevIds => prevIds.filter(id => validIds.has(id)));
  }, [candidateMarkets]);

  useEffect(() => {
    if (!isDemoOnboardingMode) {
      return;
    }

    setSelectedMarketIds([]);
  }, [isDemoOnboardingMode]);

  const handleToggleMarket = (marketId: string) => {
    setSelectedMarketIds(prevIds => {
      return prevIds.includes(marketId) ? prevIds.filter(id => id !== marketId) : [...prevIds, marketId];
    });
  };

  const handleConfigChange = <K extends keyof MarketAutomationConfig>(
    marketId: string,
    key: K,
    value: MarketAutomationConfig[K]
  ) => {
    setConfigsByMarket(prev => {
      const existingConfig = prev[marketId] ?? DEFAULT_CONFIG;

      const next: Record<string, MarketAutomationConfig> = {
        ...prev,
        [marketId]: {
          ...existingConfig,
          [key]: value,
        },
      };

      return next;
    });
  };

  const handleCompleteOnboarding = () => {
    if (selectedMarketIds.length === 0) {
      return;
    }

    // MOCK: Persist selected markets + config locally for demo purposes.
    // In production this will be replaced by AIMM contract writes + backend storage.
    if (typeof window !== 'undefined') {
      const payload = {
        selectedMarketIds,
        configsByMarket,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem('aimmDemoOnboardingConfig', JSON.stringify(payload));
    }

    /**
     * MOCK: Map the onboarding selection into AIMM activation statuses.
     *
     * In this demo build, we treat selected markets as ACTIVE and all other
     * candidates as INACTIVE. This is purely a UI affordance; in production the
     * real activation state will be controlled by AIMM contracts / indexer.
     */
    const selectedSet = new Set<string>(selectedMarketIds);
    const nextActiveStatus: MarketAimmStatus = 'ACTIVE';
    const nextInactiveStatus: MarketAimmStatus = 'INACTIVE';

    candidateMarkets.forEach(market => {
      const nextStatus = selectedSet.has(market.id) ? nextActiveStatus : nextInactiveStatus;
      setAimmStatus(market.id, nextStatus);
    });

    // In demo mode, automatically flip back to the markets table after onboarding.
    if (isDemoOnboardingMode) {
      toggleDemoOnboardingMode();
    }
  };

  const hasSelection = selectedMarketIds.length > 0;

  return (
    <div className='flex h-full flex-col gap-4 p-4 sm:p-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <div className='bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px]'>
            <span className='font-medium tracking-wide'>Step 1 · Pick markets</span>
          </div>
          <div className='space-y-1'>
            <h2 className='text-foreground text-sm font-semibold tracking-tight sm:text-base'>
              Choose which markets AIMM should manage
            </h2>
            <Text as='p' className='text-muted-foreground max-w-2xl text-xs'>
              Select one or more markets to onboard and their configuration panes will expand in-place. These settings
              are demo-only and will be wired to the AIMM contract in the full version.
            </Text>
          </div>
        </div>
        <Badge variant='outline' className='text-muted-foreground border-border/60 px-2 py-1 text-[11px]'>
          {selectedMarketIds.length === 0
            ? 'No markets selected'
            : `${selectedMarketIds.length} market${selectedMarketIds.length === 1 ? '' : 's'} selected`}
        </Badge>
      </div>

      <div className='border-border/60 bg-muted/10 space-y-2 rounded-md border p-3 sm:p-4'>
        <Text as='p' className='text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase'>
          Markets
        </Text>
        <div className='space-y-2'>
          {loading && !error && indexerMarkets.length === 0 ? (
            <Text as='p' className='text-muted-foreground text-xs'>
              Loading markets from the AIMM indexer…
            </Text>
          ) : null}

          {!loading && candidateMarkets.length === 0 ? (
            <Text as='p' className='text-muted-foreground text-xs'>
              No markets are available yet. Configure the AIMM indexer and refresh to begin onboarding.
            </Text>
          ) : null}

          {candidateMarkets.map(market => {
            const isSelected = selectedMarketIds.includes(market.id);
            const config = configsByMarket[market.id] ?? DEFAULT_CONFIG;

            return (
              <div
                key={market.id}
                className={`rounded-md border p-2 sm:p-3 ${
                  isSelected ? 'border-primary/50 bg-primary/5 shadow-inner shadow-primary/10' : 'border-border/60 bg-background/40'
                }`}
              >
                <div
                  role='button'
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-expanded={isSelected}
                  onClick={() => handleToggleMarket(market.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleToggleMarket(market.id);
                    }
                  }}
                  className='focus-visible:ring-ring/60 flex w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2'
                >
                  <div className='flex flex-1 items-center gap-3'>
                    <Checkbox
                      id={`market-${market.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleMarket(market.id)}
                      onClick={event => event.stopPropagation()}
                      aria-label={`Toggle ${market.title}`}
                    />
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-foreground text-xs font-medium'>{market.title}</span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='text-muted-foreground border-border/60 h-4 rounded-sm px-1.5 text-[10px] tracking-wide uppercase'
                        >
                          {formatIdentifierWithEllipsis(market.platform)}
                        </Badge>
                        <span className='text-muted-foreground font-mono text-[11px]'>
                          {formatIdentifierWithEllipsis(market.symbol)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                    aria-hidden='true'
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>

                {isSelected && (
                  <div className='border-border/50 bg-background/70 mt-3 rounded-md border px-3 py-3 text-xs'>
                    <Text as='p' className='text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase'>
                      Automation config
                    </Text>
                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div className='space-y-1'>
                        <Label htmlFor={`drift-${market.id}`} className='text-[11px]'>
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
                            value={config.driftThresholdPts.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(market.id, 'driftThresholdPts', Number.isNaN(numeric) ? 0 : numeric);
                            }}
                            className='text-right text-xs'
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText className='text-[11px]'>pts mispricing</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor={`max-spend-${market.id}`} className='text-[11px]'>
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
                            value={config.maxSpendUsd.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(market.id, 'maxSpendUsd', Number.isNaN(numeric) ? 0 : numeric);
                            }}
                            className='text-right text-xs'
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText className='text-[11px]'>per rebalance</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor={`slippage-${market.id}`} className='text-[11px]'>
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
                            value={config.slippagePts.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(market.id, 'slippagePts', Number.isNaN(numeric) ? 0 : numeric);
                            }}
                            className='text-right text-xs'
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText className='text-[11px]'>pts</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className='space-y-1'>
                        <Label className='text-[11px]'>Automation interval (demo)</Label>
                        <Select
                          value={config.interval}
                          onValueChange={value => handleConfigChange(market.id, 'interval', value as AutomationInterval)}
                        >
                          <SelectTrigger size='sm' className='h-8 w-full text-xs'>
                            <SelectValue placeholder='Choose cadence' />
                          </SelectTrigger>
                          <SelectContent align='start'>
                            {INTERVAL_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value} className='text-xs'>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className='border-border/40 mt-1 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between'>
        <Text as='p' className='text-muted-foreground text-xs'>
          These settings are per-market and demo-only. In production they will be written to the AIMM contract and used
          by the agent when deciding whether to balance each market.
        </Text>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='text-[11px]'
            disabled={!hasSelection}
            onClick={handleCompleteOnboarding}
          >
            {hasSelection ? 'Confirm markets & continue' : 'Select at least one market'}
          </Button>
        </div>
      </div>
    </div>
  );
}


