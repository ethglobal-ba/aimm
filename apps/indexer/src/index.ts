import { ponder } from 'ponder:registry';
import {
  markets,
  marketConfigs,
  priceUpdates,
  marketStatusChanges,
  defaultConfigUpdates,
  workflowResults,
  ownershipTransfers,
} from '../ponder.schema';

// Market Onboarded Event
ponder.on('AIMM:MarketOnboarded', async ({ event, context }) => {
  const { platform, marketId, marketName, optionA, optionB } = event.args;
  const { db } = context;

  await db
    .insert(markets)
    .values({
      id: marketId,
      platform: platform,
      externalId: marketId, // Use marketId as externalId since it's the external platform's market ID
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
        externalId: marketId,
        marketName: marketName,
        optionAText: optionA,
        optionBText: optionB,
        updatedAt: event.block.timestamp,
      },
    });
});

// Market Config Updated Event
ponder.on('AIMM:MarketConfigUpdated', async ({ event, context }) => {
  const { marketId, platform, minPriceDiff, maxSpend, slippage } = event.args;
  const { db } = context;

  const configId = `${marketId}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketConfigs).values({
    id: configId,
    marketId,
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
  const { marketId, platform, optionAPrice, optionBPrice } = event.args;
  const { db } = context;

  const priceUpdateId = `${marketId}-external-${event.block.number}-${event.log.logIndex}`;

  await db.insert(priceUpdates).values({
    id: priceUpdateId,
    marketId,
    platform,
    type: 'external',
    optionAPrice,
    optionBPrice,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Fair Prices Updated Event
ponder.on('AIMM:FairPricesUpdated', async ({ event, context }) => {
  const { marketId, platform, optionAPrice, optionBPrice } = event.args;
  const { db } = context;

  const priceUpdateId = `${marketId}-fair-${event.block.number}-${event.log.logIndex}`;

  await db.insert(priceUpdates).values({
    id: priceUpdateId,
    marketId,
    platform,
    type: 'fair',
    optionAPrice,
    optionBPrice,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});

// Market Status Changed Event
ponder.on('AIMM:MarketStatusChanged', async ({ event, context }) => {
  const { marketId, platform, oldStatus, newStatus } = event.args;
  const { db } = context;

  const statusChangeId = `${marketId}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketStatusChanges).values({
    id: statusChangeId,
    marketId,
    platform,
    oldStatus: oldStatus ? Number(oldStatus) : null,
    newStatus: Number(newStatus),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the market status in the markets table
  await db
    .update(markets)
    .set({
      status: Number(newStatus),
      updatedAt: event.block.timestamp,
    })
    .where({ id: marketId });
});

// Default Config Updated Event
ponder.on('AIMM:DefaultConfigUpdated', async ({ event, context }) => {
  const { driftPercentage, maxSpend, slippage } = event.args;
  const { db } = context;

  const configId = `${event.block.number}-${event.log.logIndex}`;

  await db.insert(defaultConfigUpdates).values({
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
    .insert(workflowResults)
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

  await db.insert(ownershipTransfers).values({
    id: transferId,
    previousOwner,
    newOwner,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
});
