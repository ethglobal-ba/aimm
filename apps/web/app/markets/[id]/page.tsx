import MarketDetailClient from './market-detail-client';

interface MarketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const resolvedParams = await params;

  return <MarketDetailClient marketId={resolvedParams.id} />;
}
