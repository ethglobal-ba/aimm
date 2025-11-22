'use client';

import { useState } from 'react';
import { FilterIcon, SortingAZ01Icon } from 'hugeicons-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/components/toggle-group';
import { MarketsTable } from '@/components/markets-table';
import { MainLayout } from '@/components/layout/main-layout';

export default function Home() {
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [sortBy, setSortBy] = useState<'mispricing' | 'timeToClose' | 'volume'>('mispricing');

  return (
    <MainLayout>
      <div className='bg-background mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col p-6'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h1 className='text-foreground text-2xl font-bold tracking-tight'>Markets Overview</h1>
            <p className='text-muted-foreground mt-1 text-sm'>Monitoring {10} active markets across 4 platforms.</p>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size='sm' className='h-8 w-[150px] gap-2 bg-transparent text-xs'>
                <FilterIcon className='text-muted-foreground h-3.5 w-3.5' />
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent position='popper' align='end' sideOffset={4}>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='open'>Open</SelectItem>
                <SelectItem value='suspended'>Suspended</SelectItem>
                <SelectItem value='closed'>Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={val => setSortBy(val as typeof sortBy)}>
              <SelectTrigger size='sm' className='h-8 w-[170px] gap-2 bg-transparent text-xs'>
                <SortingAZ01Icon className='text-muted-foreground h-3.5 w-3.5' />
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent position='popper' align='end' sideOffset={4}>
                <SelectItem value='mispricing'>Mispricing</SelectItem>
                <SelectItem value='timeToClose'>Closing Soon</SelectItem>
                <SelectItem value='volume'>Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className='border-border bg-card/50 flex flex-1 flex-col overflow-hidden'>
          <CardContent className='flex-1 overflow-auto p-0'>
            <MarketsTable platformFilter={platformFilter} statusFilter={statusFilter} sortBy={sortBy} />
          </CardContent>

          <CardFooter className='border-border text-muted-foreground bg-muted/20 flex items-center justify-between border-t p-3 text-xs'>
            <span>Showing 10 of 10 markets</span>
            <div className='flex gap-2'>
              <Button variant='ghost' size='sm' disabled className='h-7 text-xs'>
                Previous
              </Button>
              <Button variant='ghost' size='sm' disabled className='h-7 text-xs'>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
