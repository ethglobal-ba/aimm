'use client';

import { MarketDetailView } from '@/components/market-detail/market-detail-view';
import { getMarketDetailData } from '@/lib/mock-market-detail';
import { useGetMarketQuery } from '@/lib/generated/hooks';
import { mapIndexerMarketToMarket } from '@/lib/indexer-market-adapter';

interface MarketDetailClientProps {
  marketId: string;
}

export default function MarketDetailClient({ marketId }: MarketDetailClientProps) {
  const { data, loading, error } = useGetMarketQuery({
    variables: { id: marketId },
  });

  const indexerMarket = data?.market ? mapIndexerMarketToMarket(data.market) : null;

  if (loading) {
    return (
      <div className='text-muted-foreground flex min-h-[200px] items-center justify-center px-6 py-10 text-sm'>
        Loading market…
      </div>
    );
  }

  if (error || !indexerMarket) {
    return (
      <div className='text-muted-foreground flex min-h-[200px] items-center justify-center px-6 py-10 text-sm'>
        Market not found.
      </div>
    );
  }

  const detail = getMarketDetailData(marketId);

  return <MarketDetailView market={indexerMarket} detail={detail} />;
}
