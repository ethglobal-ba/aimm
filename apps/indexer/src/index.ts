import { ponder } from 'ponder:registry';
import {
  defaultConfigUpdate,
  market,
  marketConfig,
  marketStatusChange,
  ownershipTransfer,
  priceUpdate,
  workflowResult,
} from '../ponder.schema';

// Utility function to convert hex string to readable string
function hexToString(hex: string): string {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

  // Convert hex to bytes and then to UTF-8 string
  try {
    return Buffer.from(cleanHex, 'hex').toString('utf8').replace(/\0/g, '');
  } catch (error) {
    // If conversion fails, return original string
    console.warn(`Failed to convert hex to string: ${hex}`, error);
    return hex;
  }
}

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

  const { platform, externalMarketId, marketName, optionA, optionB,  } = event.args;
  const { db } = context;

  // Convert hex strings to readable strings
  const platformStr = hexToString(platform);
  const marketIdStr = hexToString(externalMarketId);
  const marketNameStr = hexToString(marketName);
  const optionAStr = hexToString(optionA);
  const optionBStr = hexToString(optionB);

  try {
    await db
      .insert(market)
      .values({
        id: marketIdStr,
        platform: platformStr,
        externalId: marketIdStr,
        marketName: marketNameStr,
        optionAText: optionAStr,
        optionBText: optionBStr,
        status: 0, // Default to Inactive status (0)
        // Initialize prices as null
        optionACurrentExternalPrice: 0n,
        optionBCurrentExternalPrice: 0n,
        lastExternalPriceUpdate: 0n,
        optionACurrentFairPrice: 0n,
        optionBCurrentFairPrice: 0n,
        lastFairPriceUpdate: 0n,
        volume: 0n,
        createdAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      })
      .onConflictDoUpdate({
        target: 'id',
        set: {
          platform: platformStr,
          externalId: marketIdStr,
          marketName: marketNameStr,
          optionAText: optionAStr,
          optionBText: optionBStr,
          updatedAt: event.block.timestamp,
        },
      });

    console.log('MarketOnboarded successfully processed:', marketIdStr);
  } catch (error) {
    console.error('Error processing MarketOnboarded event:', error);
    throw error;
  }
});

// Market Config Updated Event
ponder.on('AIMM:MarketConfigUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, minPriceDiff, maxSpend, slippage } = event.args;
  const { db } = context;

  // Convert hex strings to readable strings
  const marketIdStr = hexToString(externalMarketId);
  const platformStr = hexToString(platform);

  console.log('MarketConfigUpdated event received:', {
    externalMarketId: marketIdStr,
    platform: platformStr,
    minPriceDiff,
    maxSpend,
    slippage,
  });

  const configId = `${marketIdStr}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketConfig).values({
    id: configId,
    marketId: marketIdStr,
    platform: platformStr,
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

  // Convert hex strings to readable strings
  const marketIdStr = hexToString(externalMarketId);
  const platformStr = hexToString(platform);

  console.log('CurrentPricesUpdated event received:', {
    externalMarketId: marketIdStr,
    platform: platformStr,
    extPriceA,
    extPriceB,
  });

  const priceUpdateId = `${marketIdStr}-external-${event.block.number}-${event.log.logIndex}`;

  // Insert price update event record
  await db.insert(priceUpdate).values({
    id: priceUpdateId,
    marketId: marketIdStr,
    platform: platformStr,
    type: 'external',
    optionAPrice: extPriceA,
    optionBPrice: extPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the persistent market record with latest external prices (only if market exists)
  try {
    await db
      .update(market, { id: marketIdStr })
      .set({
        optionACurrentExternalPrice: extPriceA,
        optionBCurrentExternalPrice: extPriceB,
        lastExternalPriceUpdate: event.block.timestamp,
        updatedAt: event.block.timestamp,
      });
  } catch (error) {
    // Market doesn't exist yet, skip the update
    console.log(`Market ${marketIdStr} doesn't exist yet, skipping external price update`);
  }
});

// Fair Prices Updated Event
ponder.on('AIMM:FairPricesUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, fairPriceA, fairPriceB } = event.args;
  const { db } = context;

  // Convert hex strings to readable strings
  const marketIdStr = hexToString(externalMarketId);
  const platformStr = hexToString(platform);

  console.log('FairPricesUpdated event received:', {
    externalMarketId: marketIdStr,
    platform: platformStr,
    fairPriceA,
    fairPriceB,
  });
  const priceUpdateId = `${marketIdStr}-fair-${event.block.number}-${event.log.logIndex}`;

  // Insert price update event record
  await db.insert(priceUpdate).values({
    id: priceUpdateId,
    marketId: marketIdStr,
    platform: platformStr,
    type: 'fair',
    optionAPrice: fairPriceA,
    optionBPrice: fairPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the persistent market record with latest fair prices (only if market exists)
  try {
    await db
      .update(market, { id: marketIdStr })
      .set({
        optionACurrentFairPrice: fairPriceA,
        optionBCurrentFairPrice: fairPriceB,
        lastFairPriceUpdate: event.block.timestamp,
        updatedAt: event.block.timestamp,
      });
  } catch (error) {
    // Market doesn't exist yet, skip the update
    console.log(`Market ${marketIdStr} doesn't exist yet, skipping fair price update`);
  }
});

// Market Status Changed Event
ponder.on('AIMM:MarketStatusChanged', async ({ event, context }) => {
  const { externalMarketId, platform, newStatus } = event.args;
  const { db } = context;

  // Convert hex strings to readable strings
  const marketIdStr = hexToString(externalMarketId);
  const platformStr = hexToString(platform);

  console.log('MarketStatusChanged event received:', {
    externalMarketId: marketIdStr,
    platform: platformStr,
    newStatus,
  });
  const statusChangeId = `${marketIdStr}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketStatusChange).values({
    id: statusChangeId,
    marketId: marketIdStr,
    platform: platformStr,
    oldStatus: null, // Not provided in the new contract
    newStatus: Number(newStatus),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the market status in the market table (only if market exists)
  try {
    await db.update(market, { id: marketIdStr }).set({
      status: Number(newStatus),
      updatedAt: event.block.timestamp,
    });
  } catch (error) {
    // Market doesn't exist yet, skip the update
    console.log(`Market ${marketIdStr} doesn't exist yet, skipping status update`);
  }
});

// Market Status Updated Event (New event from changeMarketStatus function)
ponder.on('AIMM:MarketStatusUpdated', async ({ event, context }) => {
  const { externalMarketId, platform, newStatus } = event.args;
  const { db } = context;

  // Convert hex strings to readable strings
  const marketIdStr = hexToString(externalMarketId);
  const platformStr = hexToString(platform);

  console.log('MarketStatusUpdated event received:', {
    externalMarketId: marketIdStr,
    platform: platformStr,
    newStatus,
  });
  const statusChangeId = `${marketIdStr}-updated-${event.block.number}-${event.log.logIndex}`;

  // Insert status change event record (using same table but with different ID prefix)
  await db.insert(marketStatusChange).values({
    id: statusChangeId,
    marketId: marketIdStr,
    platform: platformStr,
    oldStatus: null, // Not provided in the event
    newStatus: Number(newStatus),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the market status in the persistent market table (only if market exists)
  try {
    await db
      .update(market, { id: marketIdStr })
      .set({
        status: Number(newStatus),
        updatedAt: event.block.timestamp,
      });
  } catch (error) {
    // Market doesn't exist yet, skip the update
    console.log(`Market ${marketIdStr} doesn't exist yet, skipping status update`);
  }
});

// Default Config Updated Event
ponder.on('AIMM:DefaultConfigUpdated', async ({ event, context }) => {
  const { driftPercentage, maxSpend, slippage } = event.args;
  const { db } = context;

  console.log('DefaultConfigUpdated event received:', {
    driftPercentage,
    maxSpend,
    slippage,
  });
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
