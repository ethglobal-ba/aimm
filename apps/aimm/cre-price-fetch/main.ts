import { AIMMABI } from '../../indexer/abis/AIMMABI';
import {
  bytesToHex,
  ConsensusAggregationByFields,
  cre,
  type CronPayload,
  encodeCallMsg,
  getNetwork,
  HTTPSendRequester,
  identical,
  LAST_FINALIZED_BLOCK_NUMBER,
  median,
  Runner,
  type Runtime,
} from '@chainlink/cre-sdk';
import { type Address, decodeFunctionResult, encodeFunctionData, zeroAddress } from 'viem';
import { z } from 'zod';

const configSchema = z.object({
  schedule: z.string(),
  kalshiApiUrl: z.string(),
  aimmContractAddress: z.string(),
  chainSelectorName: z.string(),
  gasLimit: z.string(),
  aimmIndexerUrl: z.string(),
});

type Config = z.infer<typeof configSchema>;

type MarketUpdate = {
  externalMarketId: string;
  optionAPrice: bigint;
  optionBPrice: bigint;
  volume: bigint;
};

type MarketIdsResponse = {
  marketIds: string[];
};

// GraphQL response interfaces
interface IndexerMarket {
  externalId: string;
  marketName: string;
  optionAText: string;
  optionBText: string;
  platform: string;
  status: number;
}

interface IndexerResponse {
  data: {
    marketss: {
      items: IndexerMarket[];
    };
  };
}

// Kalshi API response interface
interface KalshiApiResponse {
  market: KalshiMarket;
}

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

// Utility function to safely stringify objects with bigints
const safeJsonStringify = (obj: unknown): string =>
  JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);

// Convert price from Kalshi format (cents) to 6-decimal format for USDC compatibility
const convertPriceToSixDecimals = (priceInCents: number): bigint => {
  return BigInt(Math.round(priceInCents * 10000)); // Convert cents to 6 decimals: cents * 10^4
};

// Convert volume to appropriate scale
const convertVolume = (volume: number): bigint => {
  return BigInt(Math.round(volume * 1e18)); // Standard 18-decimal scaling for volume
};


// Fetch tracked market IDs from the AIMM contract - COMMENTED OUT
// const fetchTrackedMarketsFromChain = (runtime: Runtime<Config>, evmConfig: Config): readonly string[] => {
//   runtime.log(
//     `Fetching tracked markets from contract: ${runtime.config.aimmContractAddress}, using ${evmConfig.chainSelectorName} chain selector`
//   );
//   const network = getNetwork({
//     chainFamily: 'evm',
//     chainSelectorName: evmConfig.chainSelectorName,
//     isTestnet: true,
//   });

//   runtime.log(`Network: ${safeJsonStringify(network)}`);
//   if (!network) {
//     throw new Error(`Network not found for chain selector name: ${evmConfig.chainSelectorName}`);
//   }

//   const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector);
//   runtime.log('Building call data for fetch markets');

//   // Encode the contract call data for getAllMarketIds
//   const callData = encodeFunctionData({
//     abi: AIMMABI,
//     functionName: 'getAllMarketIds',
//   });

//   runtime.log("")

//   const contractCall = evmClient
//     .callContract(runtime, {
//       call: encodeCallMsg({
//         from: zeroAddress,
//         to: evmConfig.aimmContractAddress as Address,
//         data: callData,
//       }),
//       blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
//     })
//     .result();

//   // Decode the result
//   const marketIds = decodeFunctionResult({
//     abi: AIMMABI,
//     functionName: 'getAllMarketIds',
//     data: bytesToHex(contractCall.data),
//   });

//   if (!marketIds || marketIds.length === 0) {
//     throw new Error('No market IDs returned from contract');
//   }

//   return marketIds;
// };

// Fetch a single Kalshi market and convert to our market update format
const fetchSingleMarketUpdate = (
  sendRequester: HTTPSendRequester,
  config: Config,
  externalMarketId: string
): MarketUpdate => {
  const req = {
    url: `${config.kalshiApiUrl}/markets/${externalMarketId}`,
    method: 'GET' as const,
  };

  const resp = sendRequester.sendRequest(req).result();

  if (resp.statusCode !== 200) {
    throw new Error(`Kalshi API request failed for ${externalMarketId} with status: ${resp.statusCode}`);
  }

  const bodyText = new TextDecoder().decode(resp.body);
  const apiResponse = JSON.parse(bodyText) as KalshiApiResponse;

  // Convert prices from cents to 6-decimal format
  const optionAPrice = convertPriceToSixDecimals(apiResponse.market.yes_ask);
  const optionBPrice = convertPriceToSixDecimals(apiResponse.market.no_ask);
  const volume = convertVolume(apiResponse.market.volume);

  return {
    externalMarketId,
    optionAPrice,
    optionBPrice,
    volume,
  } satisfies MarketUpdate;
};

// Fetch tracked market IDs from indexer - following the same pattern as fetchSingleMarketUpdate
const fetchMarketIds = (
  sendRequester: HTTPSendRequester,
  config: Config
): MarketIdsResponse => {
  const query = {
    query: `query OpenMarkets {
  marketss(where: {status: 0}) {
    items {
      externalId
      marketName
      optionAText
      optionBText
      platform
      status
    }
  }
}`,
  };

  const req = {
    url: `${config.aimmIndexerUrl}/graphql`,
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  };

  const resp = sendRequester.sendRequest(req).result();

  if (resp.statusCode !== 200) {
    throw new Error(`Indexer GraphQL request failed with status: ${resp.statusCode}`);
  }

  const bodyText = new TextDecoder().decode(resp.body);
  const indexerResponse = JSON.parse(bodyText) as IndexerResponse;

  const marketIds = indexerResponse.data.marketss.items.map(market => market.externalId);

  if (!marketIds || marketIds.length === 0) {
    throw new Error('No market IDs returned from indexer');
  }

  return {
    marketIds,
  } satisfies MarketIdsResponse;
};


const updateAllMarkets = (runtime: Runtime<Config>): string => {
  runtime.log(`Updating all markets`);

  const httpCapability = new cre.capabilities.HTTPClient();

  // Get tracked markets from indexer using the same pattern as Kalshi fetching
  runtime.log(`Fetching tracked markets from indexer`);
  
  const marketIdsResponse = httpCapability
    .sendRequest(
      runtime,
      fetchMarketIds,
      ConsensusAggregationByFields<MarketIdsResponse>({
        marketIds: identical,
      })
    )(runtime.config)
    .result();

  const trackedMarketIds = marketIdsResponse.marketIds;

  runtime.log(`Found ${trackedMarketIds.length} tracked markets from indexer: ${trackedMarketIds.join(', ')}`);

  const trackedMarkets = trackedMarketIds.map(id => ({ externalMarketId: id }));
  runtime.log(`Fetching Kalshi market prices for ${trackedMarkets.length} markets`);

  for (const trackedMarket of trackedMarkets) {
    runtime.log(`Fetching data for market: ${trackedMarket.externalMarketId}`);

    try {
      const currentMarketPrices = httpCapability
        .sendRequest(
          runtime,
          fetchSingleMarketUpdate,
          ConsensusAggregationByFields<MarketUpdate>({
            externalMarketId: identical,
            optionAPrice: median,
            optionBPrice: median,
            volume: median,
          })
        )(runtime.config, trackedMarket.externalMarketId)
        .result();

      runtime.log(`Market data for ${trackedMarket.externalMarketId}: ${safeJsonStringify(currentMarketPrices)}`);
    } catch (error) {
      runtime.log(`Error fetching data for market ${trackedMarket.externalMarketId}: ${error}`);
      // Continue with other markets even if one fails
      continue;
    }
  }

  // Update AIMM contract with all market data
  // return updateAIMMPrices(runtime, marketUpdates);
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
