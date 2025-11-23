import axios from 'axios';
import dotenv from 'dotenv';
import { createWalletClient, http, publicActions, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { aimmAbi } from './contract.types';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AIMM_CONTRACT_ADDRESS = '0x53B3B952320E4e38887e85329a5A6E0dFBd5eF10' as Address;
const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle: string;
  event_ticker: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  volume: number;
  open_interest: number;
  created_at: string;
  status: string;
}

interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string;
}

async function getMarketsFromLast24Hours(): Promise<KalshiMarket[]> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const minCreatedTs = Math.floor(twentyFourHoursAgo.getTime() / 1000).toString();
  const params = {
    status: 'open',
    mve_filter: 'exclude',
    limit: 1000,
    min_created_ts: minCreatedTs,
  };
  console.log('Kalshi markets fetch params:', params);
  try {
    const response = await axios.get<KalshiMarketsResponse>(`${KALSHI_API_BASE}/markets`, {
      params,
    });
    // Pick a random set of 25 markets from the full list (or fewer if <25 returned)
    const allMarkets = response.data.markets;
    const shuffled = allMarkets.slice().sort(() => Math.random() - 0.5);
    const selectedMarkets = shuffled.slice(0, 25);
    // Replace response.data.markets with selectedMarkets for downstream logic
    response.data.markets = selectedMarkets;

    console.log(`Found ${response.data.markets.length} markets created in the last 24 hours`);
    return response.data.markets;
  } catch (error) {
    console.error('Error fetching Kalshi markets:', error);
    throw error;
  }
}

function convertPriceToWei(price: number): bigint {
  return BigInt(Math.round(price * 10 ** 6)); //USDC decimals
}

function mapKalshiMarketToParams(market: KalshiMarket) {
  const yesPriceCents = market.yes_ask > 0 ? market.yes_ask : market.yes_bid || 50;
  const noPriceCents = market.no_ask > 0 ? market.no_ask : market.no_bid || 50;

  return {
    ticker: market.ticker,
    platform: 0, // KALSHI enum value
    marketName: market.title,
    subtitle: market.subtitle,
    eventTicker: market.event_ticker, // Use the actual event_ticker from API
    optionACurrentExternalPrice: convertPriceToWei(yesPriceCents), //Adds 6 decimals to line up w/ USDC
    optionBCurrentExternalPrice: convertPriceToWei(noPriceCents), //Addds 6 decimals to line up w/ USDC
    initialVolume: BigInt(market.volume || 0),
    imageUrl: 'https://trading.kalshi.com/favicon.ico', // Default Kalshi favicon
  };
}

async function onboardMarketsToAIMM(markets: KalshiMarket[]): Promise<void> {
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
      const params = mapKalshiMarketToParams(market);

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
      console.error(`✗ Failed to onboard market ${market.ticker}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('Fetching Kalshi markets from the last 24 hours...');
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
