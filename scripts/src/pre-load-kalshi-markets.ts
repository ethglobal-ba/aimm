import dotenv from 'dotenv';
import axios from 'axios';
import { createWalletClient, http, publicActions, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { aimmAbi } from '../../packages/common/src/types/__generated__/contract.types.js';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AIMM_CONTRACT_ADDRESS = "0x89f10af821bf8f4e6732cc929f1a7cc80fe57825" as Address;
const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle: string;
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

interface OnboardMarketParams {
  externalMarketId: string;
  platform: string;
  marketName: string;
  optionAText: string;
  optionBText: string;
  optionACurrentExternalPrice: bigint;
  optionBCurrentExternalPrice: bigint;
  initialVolume: bigint;
}

async function getMarketsFromLast24Hours(): Promise<KalshiMarket[]> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const minCreatedTs = twentyFourHoursAgo.toISOString();

  try {
    const response = await axios.get<KalshiMarketsResponse>(
      `${KALSHI_API_BASE}/markets`,
      {
        params: {
          status: 'open',
          mve_filter: 'exclude',
          limit: 1000,
          min_created_ts: minCreatedTs
        }
      }
    );

    console.log(`Found ${response.data.markets.length} markets created in the last 24 hours`);
    return response.data.markets;
  } catch (error) {
    console.error('Error fetching Kalshi markets:', error);
    throw error;
  }
}

function convertPriceToWei(price: number): bigint {
  return BigInt(Math.round(price * 1000));
}

function mapKalshiMarketToParams(market: KalshiMarket): OnboardMarketParams {
  const yesPriceCents = market.yes_ask > 0 ? market.yes_ask : (market.yes_bid || 50);
  const noPriceCents = market.no_ask > 0 ? market.no_ask : (market.no_bid || 50);
  
  return {
    externalMarketId: market.ticker,
    platform: 'kalshi',
    marketName: market.title,
    optionAText: 'Yes',
    optionBText: 'No', 
    optionACurrentExternalPrice: convertPriceToWei(yesPriceCents),
    optionBCurrentExternalPrice: convertPriceToWei(noPriceCents),
    initialVolume: BigInt(market.volume || 0)
  };
}

async function onboardMarketsToAIMM(markets: KalshiMarket[]): Promise<void> {
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http()
  }).extend(publicActions);

  console.log(`Onboarding ${markets.length} markets to AIMM contract...`);

  for (const market of markets) {
    try {
      const params = mapKalshiMarketToParams(market);
      
      console.log(`Onboarding market: ${params.marketName} (${params.externalMarketId})`);
      
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

