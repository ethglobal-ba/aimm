'use client';

import { useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@workspace/ui/components/input-group';
import { Label } from '@workspace/ui/components/label';
import { Text } from '@workspace/ui/components/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { mockMarkets } from '@/lib/mock-data';
import type { Market } from '@/types/market';
import { useDemoOnboarding } from '@/components/demo-onboarding-context';

type AutomationInterval = 'on_price_update' | '5m' | '15m' | '1h';

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

export function MarketsOnboarding() {
  const { isDemoOnboardingMode, toggleDemoOnboardingMode } = useDemoOnboarding();

  const candidateMarkets: Market[] = mockMarkets.filter(market => market.status === 'open');

  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>(() =>
    candidateMarkets.slice(0, 3).map(market => market.id),
  );

  const [configsByMarket, setConfigsByMarket] = useState<Record<string, MarketAutomationConfig>>(() => {
    const initial: Record<string, MarketAutomationConfig> = {};
    candidateMarkets.forEach(market => {
      initial[market.id] = { ...DEFAULT_CONFIG };
    });
    return initial;
  });

  const handleToggleMarket = (marketId: string) => {
    setSelectedMarketIds(prevIds =>
      prevIds.includes(marketId) ? prevIds.filter(id => id !== marketId) : [...prevIds, marketId],
    );
  };

  const handleConfigChange = <K extends keyof MarketAutomationConfig>(
    marketId: string,
    key: K,
    value: MarketAutomationConfig[K],
  ) => {
    setConfigsByMarket(prev => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        [key]: value,
      },
    }));
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
          <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary'>
            <span className='font-medium tracking-wide'>Step 1 · Pick markets</span>
          </div>
          <div className='space-y-1'>
            <h2 className='text-foreground text-sm font-semibold tracking-tight sm:text-base'>
              Choose which markets AIMM should manage
            </h2>
            <Text as='p' size='xs' className='text-muted-foreground max-w-2xl'>
              Select one or more markets to onboard and set per-market automation limits. These settings are demo-only
              and will be wired to the AIMM contract in the full version.
            </Text>
          </div>
        </div>
        <Badge variant='outline' className='text-muted-foreground border-border/60 px-2 py-1 text-[11px]'>
          {selectedMarketIds.length === 0
            ? 'No markets selected'
            : `${selectedMarketIds.length} market${selectedMarketIds.length === 1 ? '' : 's'} selected`}
        </Badge>
      </div>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>
        <div className='space-y-2 rounded-md border border-border/60 bg-muted/10 p-3 sm:p-4'>
          <Text as='p' size='xs' className='text-muted-foreground mb-1 font-medium tracking-wide uppercase'>
            Markets
          </Text>
          <div className='space-y-2'>
            {candidateMarkets.map(market => {
              const isSelected = selectedMarketIds.includes(market.id);
              return (
                <div
                  key={market.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => handleToggleMarket(market.id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleToggleMarket(market.id);
                    }
                  }}
                  className='border-border/60 hover:border-border/80 hover:bg-muted/30 flex w-full items-center justify-between rounded-md border bg-background/40 px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
                >
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleMarket(market.id)}
                      aria-label={`Toggle ${market.title}`}
                    />
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-foreground text-xs font-medium'>{market.title}</span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='text-muted-foreground border-border/60 h-4 rounded-sm px-1.5 text-[10px] uppercase tracking-wide'
                        >
                          {market.platform}
                        </Badge>
                        <span className='text-muted-foreground font-mono text-[11px]'>{market.symbol}</span>
                      </div>
                    </div>
                  </div>
                  <span className='text-muted-foreground font-mono text-[11px]'>
                    Live {Math.round(market.livePrice * 100)} · AIMM {Math.round(market.aimmFairPrice * 100)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className='space-y-3 rounded-md border border-border/60 bg-muted/5 p-3 sm:p-4'>
          <Text as='p' size='xs' className='text-muted-foreground mb-1 font-medium tracking-wide uppercase'>
            Per-market automation config
          </Text>

          {selectedMarketIds.length === 0 ? (
            <Text as='p' size='xs' className='text-muted-foreground'>
              Select at least one market on the left to configure drift thresholds, spend limits, slippage, and
              automation cadence.
            </Text>
          ) : (
            <div className='space-y-4 overflow-y-auto pr-1'>
              {selectedMarketIds.map(marketId => {
                const market = candidateMarkets.find(m => m.id === marketId);
                const config = configsByMarket[marketId] ?? DEFAULT_CONFIG;

                if (!market) {
                  return null;
                }

                return (
                  <div
                    key={marketId}
                    className='border-border/50 bg-background/60 hover:border-border/80 rounded-md border px-3 py-3 text-xs transition-colors'
                  >
                    <div className='mb-2 flex items-center justify-between gap-2'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-foreground text-xs font-medium'>{market.title}</span>
                        <span className='text-muted-foreground font-mono text-[11px]'>{market.symbol}</span>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-muted-foreground border-border/60 h-4 rounded-sm px-1.5 text-[10px] uppercase tracking-wide'
                      >
                        {market.platform}
                      </Badge>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2'>
                      <div className='space-y-1'>
                        <Label htmlFor={`drift-${marketId}`} className='text-[11px]'>
                          Drift threshold
                        </Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText className='text-[11px]'>Trigger when</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id={`drift-${marketId}`}
                            type='number'
                            min={0}
                            step={0.1}
                            value={config.driftThresholdPts.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(
                                marketId,
                                'driftThresholdPts',
                                Number.isNaN(numeric) ? 0 : numeric,
                              );
                            }}
                            className='text-right text-xs'
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText className='text-[11px]'>pts mispricing</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor={`max-spend-${marketId}`} className='text-[11px]'>
                          Max spend per rebalance
                        </Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText className='text-[11px]'>$</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id={`max-spend-${marketId}`}
                            type='number'
                            min={0}
                            step={100}
                            value={config.maxSpendUsd.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(marketId, 'maxSpendUsd', Number.isNaN(numeric) ? 0 : numeric);
                            }}
                            className='text-right text-xs'
                          />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupText className='text-[11px]'>per rebalance</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className='space-y-1'>
                        <Label htmlFor={`slippage-${marketId}`} className='text-[11px]'>
                          Slippage tolerance
                        </Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText className='text-[11px]'>Allow up to</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            id={`slippage-${marketId}`}
                            type='number'
                            min={0}
                            step={0.05}
                            value={config.slippagePts.toString()}
                            onChange={event => {
                              const numeric = Number(event.target.value);
                              handleConfigChange(marketId, 'slippagePts', Number.isNaN(numeric) ? 0 : numeric);
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
                          onValueChange={value =>
                            handleConfigChange(marketId, 'interval', value as AutomationInterval)
                          }
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className='mt-1 flex flex-col gap-2 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between'>
        <Text as='p' size='xs' className='text-muted-foreground'>
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


