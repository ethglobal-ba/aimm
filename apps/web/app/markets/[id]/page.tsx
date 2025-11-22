import { notFound } from 'next/navigation';

import { MarketDetailView } from '@/components/market-detail/market-detail-view';
import { mockMarkets } from '@/lib/mock-data';
import { getMarketDetailData } from '@/lib/mock-market-detail';

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const resolvedParams = await params;
  const market = mockMarkets.find(item => item.id === resolvedParams.id);

  if (!market) {
    notFound();
  }

  const detail = getMarketDetailData(market.id);

  return <MarketDetailView market={market} detail={detail} />;
}
