import { ponder } from 'ponder:registry';
import {
  market,
  marketConfig,
  priceUpdate,
  marketStatusChange,
  defaultConfigUpdate,
  workflowResult,
  ownershipTransfer,
} from '../ponder.schema';

// Market Onboarded Event
ponder.on('AIMM:MarketOnboarded', async ({ event, context }) => {
  console.log('MarketOnboarded event received:', {
    platform: event.args.platform,
    externalMarketId: event.args.externalMarketId,
    marketName: event.args.marketName,
    optionA: event.args.optionA,
    optionB: event.args.optionB,
    blockNumber: event.block.number,
  });

  const { platform, externalMarketId, marketName, optionA, optionB } = event.args;
  const { db } = context;

  try {
    await db
      .insert(market)
      .values({
        id: externalMarketId,
        platform: platform,
        externalId: externalMarketId,
        marketName: marketName,
        optionAText: optionA,
        optionBText: optionB,
        status: 0, // Default to Active status (0)
        createdAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      })
      .onConflictDoUpdate({
        target: 'id',
        set: {
          platform: platform,
          externalId: externalMarketId,
          marketName: marketName,
          optionAText: optionA,
          optionBText: optionB,
          updatedAt: event.block.timestamp,
        },
      });

    console.log('MarketOnboarded successfully processed:', externalMarketId);
  } catch (error) {
    console.error('Error processing MarketOnboarded event:', error);
    throw error;
  }
});

// Market Config Updated Event
ponder.on('AIMM:MarketConfigUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, minPriceDiff, maxSpend, slippage } = event.args;
  const { db } = context;

  const configId = `${externalMarketId}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketConfig).values({
    id: configId,
    marketId: externalMarketId,
    platform,
    minPriceDiff,
    maxSpend,
    slippage,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Current Prices Updated Event (External)
ponder.on('AIMM:CurrentPricesUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, extPriceA, extPriceB } = event.args;
  const { db } = context;

  const priceUpdateId = `${externalMarketId}-external-${event.block.number}-${event.log.logIndex}`;

  await db.insert(priceUpdate).values({
    id: priceUpdateId,
    marketId: externalMarketId,
    platform,
    type: 'external',
    optionAPrice: extPriceA,
    optionBPrice: extPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Fair Prices Updated Event
ponder.on('AIMM:FairPricesUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, fairPriceA, fairPriceB } = event.args;
  const { db } = context;

  const priceUpdateId = `${externalMarketId}-fair-${event.block.number}-${event.log.logIndex}`;

  await db.insert(priceUpdate).values({
    id: priceUpdateId,
    marketId: externalMarketId,
    platform,
    type: 'fair',
    optionAPrice: fairPriceA,
    optionBPrice: fairPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Market Status Changed Event
ponder.on('AIMM:MarketStatusChanged', async ({ event, context }) => {
  const { externalMarketId, platform, newStatus } = event.args;
  const { db } = context;

  const statusChangeId = `${externalMarketId}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketStatusChange).values({
    id: statusChangeId,
    marketId: externalMarketId,
    platform,
    oldStatus: null, // Not provided in the new contract
    newStatus: Number(newStatus),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the market status in the market table
  await db
    .update(market, { id: externalMarketId })
    .set({
      status: Number(newStatus),
      updatedAt: event.block.timestamp,
    });
});

// Default Config Updated Event
ponder.on('AIMM:DefaultConfigUpdated', async ({ event, context }) => {
  const { driftPercentage, maxSpend, slippage } = event.args;
  const { db } = context;

  const configId = `${event.block.number}-${event.log.logIndex}`;

  await db.insert(defaultConfigUpdate).values({
    id: configId,
    driftPercentage,
    maxSpend,
    slippage,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Result Updated Event (Workflow Results)
ponder.on('AIMM:ResultUpdated', async ({ event, context }) => {
  const { resultId, finalResult } = event.args;
  const { db } = context;

  await db
    .insert(workflowResult)
    .values({
      id: resultId.toString(),
      resultId,
      finalResult,
      timestamp: event.block.timestamp,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
    })
    .onConflictDoUpdate({
      target: 'id',
      set: {
        finalResult,
        timestamp: event.block.timestamp,
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
      },
    });
});

// Ownership Transferred Event
ponder.on('AIMM:OwnershipTransferred', async ({ event, context }) => {
  const { previousOwner, newOwner } = event.args;
  const { db } = context;

  const transferId = `${event.block.number}-${event.log.logIndex}`;

  await db.insert(ownershipTransfer).values({
    id: transferId,
    previousOwner,
    newOwner,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});
