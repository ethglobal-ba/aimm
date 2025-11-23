import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LIMITLESS_API_BASE = 'https://api.limitless.exchange';

// Based on Limitless API response structure
interface LimitlessMarket {
  id: number;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  prices: number[];
  volume?: string;
  volumeFormatted?: string;
  liquidity?: string;
  liquidityFormatted?: string;
  openInterest?: string;
  openInterestFormatted?: string;
  createdAt: string;
  status: string;
  expirationTimestamp?: number;
  tradeType: 'amm' | 'clob';
  marketType: string;
  collateralToken: {
    address: string;
    decimals: number;
    symbol: string;
  };
  metadata?: {
    fee?: boolean;
    isBannered?: boolean;
    isPolyArbitrage?: boolean;
    shouldMarketMake?: boolean;
  };
  logo?: string | null;
}

interface LimitlessMarketsResponse {
  data: LimitlessMarket[];
  totalMarketsCount: number;
}


/**
 * Fetch active markets from Limitless Exchange
 */
async function getActiveMarketsFromLimitless(): Promise<LimitlessMarket[]> {
  try {
    const headers = {
      'Accept': 'application/json',
    };

    console.log('Fetching markets from Limitless API...');

    const response = await axios.get<LimitlessMarketsResponse>(
      `${LIMITLESS_API_BASE}/markets/active`,
      { headers }
    );

    console.log(`Found ${response.data.data.length} active markets from Limitless`);
    return response.data.data;

  } catch (error) {
    console.error('Error fetching Limitless markets:', error);
    throw error;
  }
}

/**
 * Process and display market data
 */
function processMarketData(markets: LimitlessMarket[]): void {
  console.log('\n📊 Processing market data...');

  for (const market of markets) {
    const yesPrice = market.prices?.[0] ? market.prices[0] / 100 : 0.5;
    const noPrice = market.prices?.[1] ? market.prices[1] / 100 : 0.5;
    const volume = market.volume ? parseFloat(market.volume) : 0;

    console.log(`\n📋 Market: ${market.title}`);
    console.log(`  Slug: ${market.slug}`);
    console.log(`  Type: ${market.tradeType.toUpperCase()}`);
    console.log(`  YES price: ${yesPrice.toFixed(3)}`);
    console.log(`  NO price: ${noPrice.toFixed(3)}`);
    console.log(`  Volume: ${market.volumeFormatted || '0'}`);
    console.log(`  Category: ${market.categories?.[0] || 'Unknown'}`);
    console.log(`  Status: ${market.status}`);
  }

  console.log(`\n✅ Processed ${markets.length} markets from Limitless Exchange`);
}

/**
 * Filter markets for the last 24 hours (optional)
 */
function filterMarketsFromLast24Hours(markets: LimitlessMarket[]): LimitlessMarket[] {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return markets.filter(market => {
    const createdAt = new Date(market.createdAt);
    return createdAt > twentyFourHoursAgo;
  });
}

async function main() {
  try {
    console.log('🚀 Starting Limitless markets data fetching script...');

    // Fetch active markets
    console.log('📊 Fetching active markets from Limitless Exchange...');
    const allMarkets = await getActiveMarketsFromLimitless();

    if (allMarkets.length === 0) {
      console.log('No active markets found');
      return;
    }

    // Optional: Filter for recent markets only
    const USE_24H_FILTER = process.env.LIMITLESS_24H_FILTER === 'true';
    const markets = USE_24H_FILTER ? filterMarketsFromLast24Hours(allMarkets) : allMarkets;

    if (USE_24H_FILTER) {
      console.log(`Filtered to ${markets.length} markets created in the last 24 hours`);
    }

    if (markets.length === 0) {
      console.log('No markets found matching filter criteria');
      return;
    }

    // Process and display market data
    processMarketData(markets);

    console.log('\n✅ Script completed successfully');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}