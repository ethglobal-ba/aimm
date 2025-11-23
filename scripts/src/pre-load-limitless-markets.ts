import axios from 'axios';
import dotenv from 'dotenv';
import { createWalletClient, http, publicActions, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { aimmAbi } from './contract.types';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AIMM_CONTRACT_ADDRESS = '0x64F65c2366BEFC2540c9312A794f0DAb5c3952F4' as Address;
const LIMITLESS_API_BASE = 'https://api.limitless.exchange';

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

async function getMarketsFromLast24Hours(): Promise<LimitlessMarket[]> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  console.log('Fetching markets from Limitless API...');

  try {
    const response = await axios.get<LimitlessMarketsResponse>(`${LIMITLESS_API_BASE}/markets/active`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    // Filter markets created in the last 24 hours
    const allMarkets = response.data.data.filter(market => {
      const createdAt = new Date(market.createdAt);
      return createdAt > twentyFourHoursAgo;
    });

    // Pick a random set of 25 markets from the filtered list (or fewer if <25 returned)
    const shuffled = allMarkets.slice().sort(() => Math.random() - 0.5);
    const selectedMarkets = shuffled.slice(0, 25);

    console.log(`Found ${selectedMarkets.length} markets created in the last 24 hours`);
    return selectedMarkets;
  } catch (error) {
    console.error('Error fetching Limitless markets:', error);
    throw error;
  }
}

function convertPriceToWei(price: number): bigint {
  return BigInt(Math.round(price * 10 ** 6)); // USDC decimals
}

function mapLimitlessMarketToParams(market: LimitlessMarket) {
  // Extract YES/NO prices from array, fallback to 50/50 if not available
  const yesPrice = market.prices?.[0] ? market.prices[0] / 100 : 0.5;
  const noPrice = market.prices?.[1] ? market.prices[1] / 100 : 0.5;

  // Parse volume from string format
  const volume = market.volume ? parseFloat(market.volume) : 0;

  return {
    ticker: market.slug,
    platform: 2, // LIMITLESS enum value
    marketName: market.title,
    subtitle: market.description || '',
    eventTicker: market.categories?.[0] || 'LIMITLESS',
    optionACurrentExternalPrice: convertPriceToWei(yesPrice),
    optionBCurrentExternalPrice: convertPriceToWei(noPrice),
    initialVolume: BigInt(Math.round(volume)),
    imageUrl: market.logo || 'https://limitless.exchange/favicon.ico',
  };
}

async function onboardMarketsToAIMM(markets: LimitlessMarket[]): Promise<void> {
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  }).extend(publicActions);

  console.log(`Onboarding ${markets.length} markets to AIMM contract...`);

  for (const market of markets) {
    try {
      const params = mapLimitlessMarketToParams(market);

      console.log(`Onboarding market: ${params.marketName} (${params.ticker})`);

      const hash = await client.writeContract({
        address: AIMM_CONTRACT_ADDRESS,
        abi: aimmAbi,
        functionName: 'onboardMarket',
        args: [params],
      });

      console.log(`✓ Market onboarded successfully. Transaction hash: ${hash}`);

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`✗ Failed to onboard market ${market.slug}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('Fetching Limitless markets from the last 24 hours...');
    const markets = await getMarketsFromLast24Hours();

    if (markets.length === 0) {
      console.log('No new markets found in the last 24 hours');
      return;
    }

    await onboardMarketsToAIMM(markets);
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}