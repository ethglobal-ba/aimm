'use client';

import { MarketDetailView } from '@/components/market-detail/market-detail-view';
import { getMarketDetailData } from '@/lib/mock-market-detail';
import { useMarket } from '@workspace/aimm-sdk';

interface MarketDetailClientProps {
  marketId: string;
}

export default function MarketDetailClient({ marketId }: MarketDetailClientProps) {
  const { data: market, isLoading, error } = useMarket(marketId);

  if (isLoading) {
    return (
      <div className='flex min-h-[200px] items-center justify-center px-6 py-10 text-sm text-muted-foreground'>
        Loading market…
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className='flex min-h-[200px] items-center justify-center px-6 py-10 text-sm text-muted-foreground'>
        Market not found.
      </div>
    );
  }

  const detail = getMarketDetailData(marketId);

  return <MarketDetailView market={market} detail={detail} />;
}


