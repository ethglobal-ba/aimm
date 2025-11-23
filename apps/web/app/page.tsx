'use client';

import { useState } from 'react';
import { FilterIcon, SortingAZ01Icon } from 'hugeicons-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';
import { MarketsTable } from '@/components/markets-table';
import { MarketsOnboarding } from '@/components/markets-onboarding';
import { LiveAgentActions } from '@/components/live-agent-actions';
import { PortfolioBalance } from '@/components/portfolio-balance';
import type { MarketAimmStatus, Market } from '@/types/market';
import { useDemoOnboarding } from '@/components/demo-onboarding-context';
import { useGetMarketsQuery } from '@/lib/generated/hooks';
import { mapIndexerMarketToMarket } from '@/lib/indexer-market-adapter';

export default function Home() {
  const [platformFilter, setPlatformFilter] = useState('all');
  type AimmStatusFilter = 'all' | MarketAimmStatus;
  const [statusFilter, setStatusFilter] = useState<AimmStatusFilter>('ACTIVE');
  const [sortBy, setSortBy] = useState<'mispricing' | 'alphabetical' | 'volume'>('mispricing');
  const { isDemoOnboardingMode } = useDemoOnboarding();

  const { data, loading, error } = useGetMarketsQuery();

  const marketsFromIndexer: Market[] =
    data?.markets?.items?.map(mapIndexerMarketToMarket) ?? [];
  const hasIndexerMarkets = marketsFromIndexer.length > 0;
  const shouldShowOnboarding =
    isDemoOnboardingMode || (!loading && !error && marketsFromIndexer.length === 0);

  const subtitle = isDemoOnboardingMode
    ? 'Demo onboarding mode – configure which markets AIMM should manage.'
    : hasIndexerMarkets
      ? `Monitoring ${marketsFromIndexer.length} indexed markets.`
      : 'No indexed markets are available yet. Configure AIMM and indexer to begin monitoring.';

  return (
    <div className='bg-background mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col p-6'>
      <div className='mb-6 flex gap-4'>
        {/* Left Column: Title & Filters */}
        <div className='flex min-w-0 flex-1 flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h1 className='text-foreground text-2xl font-bold tracking-tight'>Markets Overview</h1>
              <p className='text-muted-foreground mt-1 text-sm'>{subtitle}</p>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='bg-muted/50 border-border flex h-8 items-center rounded-md border px-1'>
              <ToggleGroup
                type='single'
                value={platformFilter}
                onValueChange={val => setPlatformFilter(val || 'all')}
                className='h-full gap-0'
              >
                <ToggleGroupItem
                  value='all'
                  size='sm'
                  className='data-[state=on]:bg-background h-full text-xs data-[state=on]:shadow-sm'
                >
                  All
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='limitless'
                  size='sm'
                  className='data-[state=on]:bg-background h-full text-xs data-[state=on]:shadow-sm'
                >
                  Limitless
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='polymarket'
                  size='sm'
                  className='data-[state=on]:bg-background h-full text-xs data-[state=on]:shadow-sm'
                >
                  Polymarket
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='kalshi'
                  size='sm'
                  className='data-[state=on]:bg-background h-full text-xs data-[state=on]:shadow-sm'
                >
                  Kalshi
                </ToggleGroupItem>
                <ToggleGroupItem
                  value='trump.fun'
                  size='sm'
                  className='data-[state=on]:bg-background h-full text-xs data-[state=on]:shadow-sm'
                >
                  Trump.fun
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Select value={statusFilter} onValueChange={value => setStatusFilter(value as AimmStatusFilter)}>
              <SelectTrigger size='sm' className='h-8 w-[160px] gap-2 bg-transparent text-xs'>
                <FilterIcon className='text-muted-foreground h-3.5 w-3.5' />
                <SelectValue placeholder='AIMM status' />
              </SelectTrigger>
              <SelectContent position='popper' align='start' sideOffset={4}>
                <SelectItem value='all'>All AIMM statuses</SelectItem>
                <SelectItem value='ACTIVE'>Active only</SelectItem>
                <SelectItem value='INACTIVE'>Inactive only</SelectItem>
                <SelectItem value='EXTERNALLY_CLOSED'>Externally closed</SelectItem>
                <SelectItem value='INTERNALLY_CLOSED'>Internally closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={val => setSortBy(val as typeof sortBy)}>
              <SelectTrigger size='sm' className='h-8 w-[160px] gap-2 bg-transparent text-xs'>
                <SortingAZ01Icon className='text-muted-foreground h-3.5 w-3.5' />
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent position='popper' align='start' sideOffset={4}>
                <SelectItem value='mispricing'>Mispricing</SelectItem>
                <SelectItem value='alphabetical'>Name (A–Z)</SelectItem>
                <SelectItem value='volume'>Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column: Portfolio Balance */}
        {!shouldShowOnboarding && (
          <Card className='border-border bg-card/50 w-[340px] shrink-0 overflow-hidden'>
            <CardContent className='p-0'>
              <PortfolioBalance compact />
            </CardContent>
          </Card>
        )}
      </div>

      <div className='flex min-h-0 flex-1 gap-4'>
        {/* Left: Markets table / onboarding card (~70% width) */}
        <Card className='border-border bg-card/50 flex min-w-0 flex-1 flex-col overflow-hidden'>
          <CardContent className='flex-1 overflow-auto p-0'>
            {shouldShowOnboarding ? (
              <MarketsOnboarding />
            ) : (
              <MarketsTable
                markets={marketsFromIndexer}
                platformFilter={platformFilter}
                statusFilter={statusFilter}
                sortBy={sortBy}
              />
            )}
          </CardContent>

          {!shouldShowOnboarding && (
            <CardFooter className='border-border text-muted-foreground bg-muted/20 flex items-center justify-between border-t p-3 text-xs'>
              <span>
                {loading && !error
                  ? 'Loading markets from the indexer…'
                  : `Showing ${marketsFromIndexer.length} indexed markets`}
              </span>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' disabled className='h-7 text-xs'>
                  Previous
                </Button>
                <Button variant='ghost' size='sm' disabled className='h-7 text-xs'>
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Right: Live Agent Actions cards (hidden during onboarding) */}
        {!shouldShowOnboarding && (
          <div className='flex w-[340px] shrink-0 flex-col'>
            <Card className='border-border bg-card/50 flex flex-1 overflow-hidden'>
              <CardContent className='flex h-full flex-col p-0'>
                <LiveAgentActions />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
