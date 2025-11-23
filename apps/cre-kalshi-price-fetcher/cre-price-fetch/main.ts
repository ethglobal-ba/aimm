import {
  bytesToHex,
  ConsensusAggregationByFields,
  cre,
  type CronPayload,
  getNetwork,
  hexToBase64,
  HTTPSendRequester,
  identical,
  median,
  Runner,
  type Runtime,
  TxStatus,
} from '@chainlink/cre-sdk';
import { type Address, encodeAbiParameters } from 'viem';
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
  status: MarketStatus;
};

type MarketIdsResponse = {
  markets: IndexerMarket[];
};

// Market status enum matching the contract
enum MarketStatus {
  Inactive = 0,
  Active = 1,
  ClosedInternal = 2,
  ClosedExternal = 3,
}

// Platform enum matching the contract enum
enum Platform {
  KALSHI = 0,
  LIMITLESS = 1,
  TRUMPFUN = 2,
}

// WorkflowResult type matching the contract struct
type WorkflowResult = {
  workflowName: string;
  platform: Platform;
  ticker: string;
  optionAPrice: bigint;
  optionBPrice: bigint;
  volume: bigint;
  status: MarketStatus;
};

// GraphQL response interfaces
interface IndexerMarket {
  externalId: string;
  platform: number;
  platformName: string;
}

interface IndexerResponse {
  data: {
    markets: {
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
  return BigInt(Math.round(volume * 1e6)); // Standard 18-decimal scaling for volume
};
const mapStatus = (status: string): MarketStatus => {
  switch (status) {
    case 'open':
      return MarketStatus.Active;
    case 'closed':
      return MarketStatus.ClosedExternal;
    case 'settled':
      return MarketStatus.ClosedInternal;
    default:
      return MarketStatus.Inactive;
  }
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
const fetchSingleKalshiMarketUpdate = (
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

  const status = mapStatus(apiResponse.market.status);
  return {
    externalMarketId,
    optionAPrice,
    optionBPrice,
    volume,
    status,
  };
};

// Fetch tracked market IDs from indexer - following the same pattern as fetchSingleMarketUpdate
const fetchMarketIds = (sendRequester: HTTPSendRequester, config: Config): MarketIdsResponse => {
  const query = {
    query: `query OpenMarkets {
  markets(where: {status: 1}) {
    items {
      externalId
      platform
      platformName
    }
  }
}`,
  };

  // Serialize the data to JSON and encode as bytes
  const bodyBytes = new TextEncoder().encode(JSON.stringify(query));

  // Convert to base64 for the request
  const body = Buffer.from(bodyBytes).toString('base64');

  const req = {
    url: `${config.aimmIndexerUrl}`,
    method: 'POST' as const,
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log(`[fetchMarketIds] Making request to: ${config.aimmIndexerUrl}`);

  const resp = sendRequester.sendRequest(req).result();

  console.log(`[fetchMarketIds] Response status: ${resp.statusCode}`);

  if (resp.statusCode !== 200) {
    const errorBody = new TextDecoder().decode(resp.body);
    console.log(`[fetchMarketIds] Error response body: ${errorBody}`);
    throw new Error(`Indexer GraphQL request failed with status: ${resp.statusCode}, body: ${errorBody}`);
  }

  const bodyText = new TextDecoder().decode(resp.body);
  console.log(`[fetchMarketIds] Response body: ${bodyText}`);

  const indexerResponse = JSON.parse(bodyText) as IndexerResponse;

  if (!indexerResponse.data) {
    throw new Error(`Invalid indexer response - no data field: ${bodyText}`);
  }

  if (!indexerResponse.data.markets) {
    throw new Error(`Invalid indexer response - no markets field: ${bodyText}`);
  }

  const markets = indexerResponse.data.markets.items;

  if (!markets || markets.length === 0) {
    throw new Error('No market IDs returned from indexer');
  }

  return {
    markets,
  };
};

// Write market price updates to AIMM contract - following the same pattern as updateReserves
const updateAIMMPrices = (runtime: Runtime<Config>, workflowResult: WorkflowResult): string => {
  runtime.log(
    `Updating AIMM prices for market ${workflowResult.ticker}: optionA=${workflowResult.optionAPrice.toString()}, optionB=${workflowResult.optionBPrice.toString()}`
  );

  const network = getNetwork({
    chainFamily: 'evm',
    chainSelectorName: runtime.config.chainSelectorName,
    isTestnet: true,
  });

  if (!network) {
    throw new Error(`Network not found for chain selector name: ${runtime.config.chainSelectorName}`);
  }

  const evmClient = new cre.capabilities.EVMClient(network.chainSelector.selector);

  // ABI encode the WorkflowResult struct for the onReport function
  // The onReport function expects (bytes metadata, bytes report)
  // where report is the ABI-encoded WorkflowResult struct
  const reportData = encodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          { name: 'workflowName', type: 'string' },
          { name: 'platform', type: 'uint8' },
          { name: 'externalMarketId', type: 'string' },
          { name: 'optionAPrice', type: 'uint256' },
          { name: 'optionBPrice', type: 'uint256' },
          { name: 'volume', type: 'uint256' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
    [
      {
        workflowName: workflowResult.workflowName,
        platform: workflowResult.platform,
        externalMarketId: workflowResult.ticker,
        optionAPrice: workflowResult.optionAPrice,
        optionBPrice: workflowResult.optionBPrice,
        volume: workflowResult.volume,
        status: workflowResult.status,
      },
    ]
  );

  // Generate report using consensus capability
  const reportResponse = runtime
    .report({
      encodedPayload: hexToBase64(reportData),
      encoderName: 'evm',
      signingAlgo: 'ecdsa',
      hashingAlgo: 'keccak256',
    })
    .result();

  const resp = evmClient
    .writeReport(runtime, {
      receiver: runtime.config.aimmContractAddress as Address,
      report: reportResponse,
      gasConfig: {
        gasLimit: runtime.config.gasLimit,
      },
    })
    .result();

  const txStatus = resp.txStatus;

  if (txStatus !== TxStatus.SUCCESS) {
    throw new Error(`Failed to write report: ${resp.errorMessage || txStatus}`);
  }

  const txHash = resp.txHash || new Uint8Array(32);

  runtime.log(`Write report transaction succeeded at txHash: ${bytesToHex(txHash)}`);

  return bytesToHex(txHash);
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
        markets: identical,
      })
    )(runtime.config)
    .result();

  const trackedMarkets = marketIdsResponse.markets;

  runtime.log(
    `Found ${trackedMarkets.length} tracked markets from indexer: ${trackedMarkets.map(m => m.externalId).join(', ')}`
  );
  runtime.log(`Fetching Kalshi market prices for ${trackedMarkets.length} markets`);

  // Collect all market updates
  const marketUpdates: MarketUpdate[] = [];

  for (const trackedMarket of trackedMarkets) {
    runtime.log(`Fetching data for market: ${trackedMarket.externalId}`);

    try {
      const currentMarketPrices = httpCapability
        .sendRequest(
          runtime,
          fetchSingleKalshiMarketUpdate,
          ConsensusAggregationByFields<MarketUpdate>({
            externalMarketId: identical,
            optionAPrice: median,
            optionBPrice: median,
            volume: median,
            status: identical,
          })
        )(runtime.config, trackedMarket.externalId)
        .result();

      runtime.log(`Market data for ${trackedMarket.externalId}: ${safeJsonStringify(currentMarketPrices)}`);
      marketUpdates.push(currentMarketPrices);
    } catch (error) {
      runtime.log(`Error fetching data for market ${trackedMarket.externalId}: ${error}`);
      // Continue with other markets even if one fails
      continue;
    }
  }

  // Convert market updates to workflow results and write to AIMM contract
  runtime.log(`Writing ${marketUpdates.length} market updates to AIMM contract`);

  for (const marketUpdate of marketUpdates) {
    try {
      const workflowResult: WorkflowResult = {
        workflowName: 'currentPriceFetch',
        platform: Platform.KALSHI, // Since we're fetching from Kalshi
        ticker: marketUpdate.externalMarketId,
        optionAPrice: marketUpdate.optionAPrice,
        optionBPrice: marketUpdate.optionBPrice,
        volume: marketUpdate.volume,
        status: marketUpdate.status,
      };

      const txHash = updateAIMMPrices(runtime, workflowResult);
      runtime.log(`Successfully updated AIMM contract for market ${marketUpdate.externalMarketId}, txHash: ${txHash}`);
    } catch (error) {
      runtime.log(`Error updating AIMM contract for market ${marketUpdate.externalMarketId}: ${error}`);
      // Continue with other markets even if one fails
      continue;
    }
  }

  return `Successfully processed ${marketUpdates.length} markets`;
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
