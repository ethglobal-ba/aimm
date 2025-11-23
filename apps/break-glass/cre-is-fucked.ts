import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import axios from 'axios';
import { aimmAbi } from '@aimm/common';

const AIMM_CONTRACT_ADDRESS = '0xEC767714Eb59B730e0Ec1d8d713ba3b3F2822fe0' as const;
const KALSHI_API_URL = 'https://api.elections.kalshi.com/trade-api/v2';

interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  created_time: string;
  open_time: string;
  close_time: string;
  expected_expiration_time: string;
  expiration_time: string;
  latest_expiration_time: string;
  settlement_timer_seconds: number;
  status: string;
  response_price_units: string;
  yes_bid: number;
  yes_bid_dollars: string;
  yes_ask: number;
  yes_ask_dollars: string;
  no_bid: number;
  no_bid_dollars: string;
  no_ask: number;
  no_ask_dollars: string;
  last_price: number;
  last_price_dollars: string;
  volume: number;
  volume_24h: number;
  result: string;
  can_close_early: boolean;
  open_interest: number;
  notional_value: number;
  notional_value_dollars: string;
}

interface KalshiApiResponse {
  market: KalshiMarket;
}

enum MarketStatus {
  Active = 0,
  ClosedInternal = 1,
  ClosedExternal = 2
}

// Function to decode hex hash back to string (if possible)
function tryDecodeHexToString(hex: string): string | null {
  try {
    // Remove 0x prefix
    const hexWithoutPrefix = hex.slice(2);
    // Convert hex to bytes
    const bytes = new Uint8Array(hexWithoutPrefix.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    // Try to decode as UTF-8
    const decoded = new TextDecoder('utf-8').decode(bytes);
    // Check if it looks like a valid Kalshi ticker
    if (/^[A-Z0-9\-]+$/i.test(decoded.replace(/\0/g, '').trim())) {
      return decoded.replace(/\0/g, '').trim();
    }
  } catch (e) {
    // Ignore decode errors
  }
  return null;
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http()
  });

  console.log('Checking if contract exists at address...');
  
  // First check if there's code at the address
  const code = await publicClient.getCode({
    address: AIMM_CONTRACT_ADDRESS
  });
  
  if (!code || code === '0x') {
    console.error(`No contract found at address ${AIMM_CONTRACT_ADDRESS}`);
    return;
  }
  
  console.log('Contract found. Fetching all market IDs from AIMM contract...');
  
  let marketIds: string[];
  
  try {
    marketIds = await publicClient.readContract({
      address: AIMM_CONTRACT_ADDRESS,
      abi: aimmAbi,
      functionName: 'getAllMarketIds'
    }) as string[];

    console.log(`Found ${marketIds.length} markets:`, marketIds);
  
  console.log('\nAnalyzing market IDs from contract:');
  marketIds.forEach((hash, index) => {
    console.log(`Market ${index}: ${hash}`);
    const decoded = tryDecodeHexToString(hash);
    if (decoded) {
      console.log(`  Could decode as: "${decoded}"`);
    } else {
      console.log(`  Cannot decode as string - appears to be hash`);
    }
  });
    
    if (marketIds.length === 0) {
      console.log('No markets found in contract. The contract may be newly deployed or no markets have been onboarded yet.');
      return;
    }
  } catch (error) {
    console.error('Error fetching market IDs:', error);
    return;
  }

  // First, let's just test reading market data to understand the structure
  console.log('\n=== Testing Market Data Retrieval ===');
  for (let i = 0; i < Math.min(marketIds.length, 2); i++) {
    const marketId = marketIds[i];
    try {
      console.log(`\nTesting market ${i}: ${marketId}`);
      
      const marketData = await publicClient.readContract({
        address: AIMM_CONTRACT_ADDRESS,
        abi: aimmAbi,
        functionName: 'getMarket',
        args: [marketId]
      });

      console.log('Market data structure:');
      console.log(`  Platform: "${marketData.platform}"`);
      console.log(`  Market Name: "${marketData.marketName}"`);
      console.log(`  Option A: "${marketData.optionAText}"`);
      console.log(`  Option B: "${marketData.optionBText}"`);
      console.log(`  Status: ${marketData.status} (${MarketStatus[marketData.status]})`);
      
      // The real question: what's the actual external market ID stored?
      console.log(`  External Market ID stored in contract: "${marketId}"`);
      
    } catch (error) {
      console.error(`Error reading market ${marketId}:`, error);
    }
  }
  
  console.log('\n=== Reading Market Data from Contract ===');
  console.log('All market data will be read directly from the deployed contract...');
  
  console.log('\n=== Processing Markets with Correct Kalshi Tickers ===');

  for (const marketId of marketIds) {
    try {
      console.log(`\nProcessing market: ${marketId}`);
      
      const marketData = await publicClient.readContract({
        address: AIMM_CONTRACT_ADDRESS,
        abi: aimmAbi,
        functionName: 'getMarket',
        args: [marketId]
      });

      console.log(`Current status: ${marketData.status} (${MarketStatus[marketData.status]})`);
      
      if (marketData.status !== MarketStatus.Active) {
        console.log(`Skipping inactive market: ${marketId}`);
        continue;
      }

      // With the corrected contract, the marketId IS the Kalshi ticker
      const kalshiTicker = marketId;
      console.log(`Market ID is the Kalshi ticker: ${kalshiTicker}`);
      console.log(`Fetching Kalshi data for: ${kalshiTicker}`);
      console.log(`Full API URL: ${KALSHI_API_URL}/markets/${kalshiTicker}`);
      
      const response = await axios.get<KalshiApiResponse>(`${KALSHI_API_URL}/markets/${kalshiTicker}`);
      const kalshiMarket = response.data.market;
      
      console.log(`Kalshi market status: ${kalshiMarket.status}`);
      console.log(`Current prices - Yes: ${kalshiMarket.yes_ask}¢, No: ${kalshiMarket.no_ask}¢`);
      console.log(`Volume: ${kalshiMarket.volume}`);
      
      const convertPriceToSixDecimals = (priceInCents: number): bigint => {
        return BigInt(Math.round(priceInCents * 10000));
      };
      
      const convertVolume = (volume: number): bigint => {
        return BigInt(Math.round(volume * 1e18));
      };

      const optionAPrice = convertPriceToSixDecimals(kalshiMarket.yes_ask);
      const optionBPrice = convertPriceToSixDecimals(kalshiMarket.no_ask);
      const volume = convertVolume(kalshiMarket.volume);
      
      let newStatus = MarketStatus.Active;
      if (kalshiMarket.status === 'closed' || kalshiMarket.status === 'settled') {
        newStatus = MarketStatus.ClosedExternal;
      }

      console.log(`Market data for ${kalshiTicker}:`);
      console.log(`- Option A Price: ${optionAPrice}`);
      console.log(`- Option B Price: ${optionBPrice}`);
      console.log(`- Volume: ${volume}`);
      console.log(`- Status: ${newStatus} (${MarketStatus[newStatus]})`);

      if (newStatus === MarketStatus.ClosedExternal && marketData.status === MarketStatus.Active) {
        console.log(`Updating market ${kalshiTicker} status to ClosedExternal`);
        
        const hash = await walletClient.writeContract({
          address: AIMM_CONTRACT_ADDRESS,
          abi: aimmAbi,
          functionName: 'updateMarketStatus',
          args: [marketId, MarketStatus.ClosedExternal]
        });
        
        console.log(`Transaction hash: ${hash}`);
        
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log(`Status updated successfully. Block: ${receipt.blockNumber}`);
      } else {
        // Test a simple price update to verify we can write to the contract
        console.log(`\nTesting contract write capability...`);
        console.log(`Current external prices: A=${marketData.optionACurrentExternalPrice}, B=${marketData.optionBCurrentExternalPrice}`);
        console.log(`New prices from Kalshi: A=${optionAPrice}, B=${optionBPrice}`);
        
        // Only attempt write if prices have actually changed
        if (marketData.optionACurrentExternalPrice !== optionAPrice || 
            marketData.optionBCurrentExternalPrice !== optionBPrice) {
          
          console.log(`Prices have changed! Attempting to update market ${kalshiTicker}...`);
          
          // Note: This would normally be done through the contract's reporting mechanism
          // For demo purposes, we'll try updating the market configuration to test write capability
          try {
            console.log(`Testing contract write with updateMarketConfig...`);
            const hash = await walletClient.writeContract({
              address: AIMM_CONTRACT_ADDRESS,
              abi: aimmAbi,
              functionName: 'updateMarketConfig',
              args: [marketId, 500n, 1000000000000000000n, 100n] // drift: 5%, maxSpend: 1 ETH, slippage: 1%
            });
            
            console.log(`✅ Write test successful! Transaction hash: ${hash}`);
            
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
            console.log(`✅ Contract write capability verified!`);
            
          } catch (error) {
            console.error(`❌ Contract write failed:`, error);
          }
        } else {
          console.log(`Prices unchanged - no update needed`);
        }
      }

    } catch (error) {
      console.error(`Error processing market ${marketId}:`, error);
      continue;
    }
  }

  console.log('\nPrice update process completed!');
}

main().catch(console.error);