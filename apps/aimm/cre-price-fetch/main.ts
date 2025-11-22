import { cre, type CronPayload, getNetwork, Runner, type Runtime } from '@chainlink/cre-sdk';
import { z } from 'zod';

const configSchema = z.object({
  schedule: z.string(),
  kalshiApiUrl: z.string(),
  aimmContractAddress: z.string(),
  chainSelectorName: z.string(),
  gasLimit: z.string(),
});

type Config = z.infer<typeof configSchema>;

// type MarketUpdate = {
//   externalMarketId: string;
//   optionAPrice: bigint;
//   optionBPrice: bigint;
//   volume: bigint;
// };

// // Kalshi API response interface
// interface KalshiApiResponse {
//   market: KalshiMarket;
// }

// interface KalshiMarket {
//   ticker: string;
//   event_ticker: string;
//   market_type: string;
//   title: string;
//   subtitle: string;
//   yes_sub_title: string;
//   no_sub_title: string;
//   created_time: string;
//   open_time: string;
//   close_time: string;
//   expected_expiration_time: string;
//   expiration_time: string;
//   latest_expiration_time: string;
//   settlement_timer_seconds: number;
//   status: string;
//   response_price_units: string;
//   yes_bid: number;
//   yes_bid_dollars: string;
//   yes_ask: number;
//   yes_ask_dollars: string;
//   no_bid: number;
//   no_bid_dollars: string;
//   no_ask: number;
//   no_ask_dollars: string;
//   last_price: number;
//   last_price_dollars: string;
//   volume: number;
//   volume_24h: number;
//   result: string;
//   can_close_early: boolean;
//   open_interest: number;
//   notional_value: number;
//   notional_value_dollars: string;
// }

// Utility function to safely stringify objects with bigints
// const safeJsonStringify = (obj: any): string =>
//   JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);

// Since we now use externalMarketId directly, no need to generate market IDs

// Convert price from Kalshi format (cents) to 6-decimal format for USDC compatibility
// const convertPriceToSixDecimals = (priceInCents: number): bigint => {
//   return BigInt(Math.round(priceInCents * 10000)); // Convert cents to 6 decimals: cents * 10^4
// };

// Convert volume to appropriate scale
// const convertVolume = (volume: number): bigint => {
//   return BigInt(Math.round(volume * 1e18)); // Standard 18-decimal scaling for volume
// };

// Fetch a single Kalshi market and convert to our market update format
// const fetchSingleMarketUpdate = (
//   sendRequester: HTTPSendRequester,
//   config: Config,
//   externalMarketId: string
// ): MarketUpdate => {
//   const req = {
//     url: `${config.kalshiApiUrl}/markets/${externalMarketId}`,
//     method: 'GET' as const,
//   };

//   const resp = sendRequester.sendRequest(req).result();

//   if (resp.statusCode !== 200) {
//     throw new Error(`Kalshi API request failed for ${externalMarketId} with status: ${resp.statusCode}`);
//   }

//   const bodyText = new TextDecoder().decode(resp.body);
//   const apiResponse = JSON.parse(bodyText) as KalshiApiResponse;

//   // Convert prices from cents to 6-decimal format
//   const optionAPrice = convertPriceToSixDecimals(apiResponse.market.yes_ask);
//   const optionBPrice = convertPriceToSixDecimals(apiResponse.market.no_ask);
//   const volume = convertVolume(apiResponse.market.volume);

//   return {
//     externalMarketId,
//     optionAPrice,
//     optionBPrice,
//     volume,
//   } satisfies MarketUpdate;
// };

const updateAllMarkets = (runtime: Runtime<Config>): string => {
  runtime.log(`Updating all markets`);
  //   // Get tracked markets from contract (with fallback)
  //   const trackedMarkets = [{ externalMarketId: 'KXNEWPOPE-35-PPAR' }];
  //   runtime.log(`Fetching Kalshi market prices for ${trackedMarkets.length} markets`);

  //   const httpCapability = new cre.capabilities.HTTPClient();

  //   for (const trackedMarket of trackedMarkets) {
  //     runtime.log(`Fetching data for market: ${trackedMarket.externalMarketId}`);

  //     try {
  //       const currentMarketPrices = httpCapability
  //         .sendRequest(
  //           runtime,
  //           fetchSingleMarketUpdate,
  //           ConsensusAggregationByFields<MarketUpdate>({
  //             externalMarketId: identical,
  //             optionAPrice: median,
  //             optionBPrice: median,
  //             volume: median,
  //           })
  //         )(runtime.config, trackedMarket.externalMarketId)
  //         .result();

  //       runtime.log(`Market data for ${trackedMarket.externalMarketId}: ${currentMarketPrices}`);
  //     } catch (error) {
  //       runtime.log(`Error fetching data for market ${trackedMarket.externalMarketId}: ${error}`);
  //       // Continue with other markets even if one fails
  //       continue;
  //     }
  //   }

  // Update AIMM contract with all market data
  //   return updateAIMMPrices(runtime, marketUpdates);
  return 'success';
};

const onCronTrigger = (runtime: Runtime<Config>, payload: CronPayload): string => {
  runtime.log(`Running price fetch for all tracked Kalshi markets...`);

  if (!payload.scheduledExecutionTime) {
    throw new Error('Scheduled execution time is required');
  }

  runtime.log(`CronTrigger scheduled execution time: ${payload.scheduledExecutionTime}`);

  try {
    return updateAllMarkets(runtime);
  } catch (error) {
    runtime.log(`Error updating all markets: ${error}`);
    return 'error';
  }
};

const initWorkflow = (config: Config) => {
  const cronTrigger = new cre.capabilities.CronCapability();
  const network = getNetwork({
    chainFamily: 'evm',
    chainSelectorName: config.chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Network not found for chain selector name: ${config.chainSelectorName}`);
  }

  //   const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector);

  return [
    cre.handler(
      cronTrigger.trigger({
        schedule: config.schedule,
      }),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configSchema,
  });
  await runner.run(initWorkflow);
}

main();
