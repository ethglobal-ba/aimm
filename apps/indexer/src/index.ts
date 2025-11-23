import { ponder } from 'ponder:registry';
import {
  defaultConfigUpdate,
  market,
  marketConfig,
  marketStatusChange,
  ownershipTransfer,
  currentPriceUpdate,
  fairMarketPriceUpdate,
  workflowResult,
} from '../ponder.schema';

// Utility function to get platform name from enum value
function getPlatformName(platform: number): string {
  switch (platform) {
    case 0:
      return 'Kalshi';
    case 1:
      return 'Limitless';
    case 2:
      return 'Trump.fun';
    default:
      return 'Unknown';
  }
}

// Utility function to convert hex string to readable string
function hexToString(hex: string): string {
  // If it doesn't look like hex, return as-is
  if (!hex || typeof hex !== 'string') {
    return hex;
  }

  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;

  // If it's not a valid hex string, return as-is
  if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
    return hex;
  }

  // Convert hex to bytes and then to UTF-8 string
  try {
    const buffer = Buffer.from(cleanHex, 'hex');
    const decoded = buffer.toString('utf8');

    // Check if the decoded string contains only printable ASCII characters
    // and no null bytes (except at the end for padding)
    const cleaned = decoded.replace(/\0+$/, ''); // Remove trailing null bytes

    // If it contains non-printable characters (except common whitespace), it's probably not text
    if (/[\x00-\x08\x0E-\x1F\x7F-\x9F]/.test(cleaned)) {
      console.warn(`Hex value appears to be binary data, not text: ${hex}`);
      return hex; // Return original hex
    }

    return cleaned || hex; // Return cleaned string or original if empty
  } catch (error) {
    // If conversion fails, return original string
    console.warn(`Failed to convert hex to string: ${hex}`, error);
    return hex;
  }
}

// Market Onboarded Event
ponder.on('AIMM:MarketOnboarded', async ({ event, context }) => {
  const { platform, tickerHash, ticker, marketName, subtitle, eventTicker, volume, optionACurrentExternalPrice, optionBCurrentExternalPrice } = event.args;
  const { db } = context;

  // Platform is now an enum (number), ticker is the readable string
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);
  const marketIdStr = ticker;
  const marketNameStr = marketName;
  const subtitleStr = subtitle;
  const eventTickerStr = eventTicker;

  console.log('MarketOnboarded event received:', {
    platform: `${platformNum} (${platformName})`,
    ticker: marketIdStr,
    marketName: marketNameStr,
    subtitle: subtitleStr,
    eventTicker: eventTickerStr,
    volume: volume,
    optionACurrentExternalPrice: optionACurrentExternalPrice,
    optionBCurrentExternalPrice: optionBCurrentExternalPrice,
    blockNumber: event.block.number,
  });

  try {
    await db
      .insert(market)
      .values({
        id: marketIdStr,
        platform: platformNum,
        platformName: platformName,
        tickerHash: tickerHash,
        externalId: marketIdStr,
        marketName: marketNameStr,
        optionAText: "Yes",
        optionBText: "No",
        subtitle: subtitleStr,
        eventTicker: eventTickerStr,
        status: 0, // Default to Inactive status (0)
        // Use prices from the event
        optionACurrentExternalPrice: optionACurrentExternalPrice,
        optionBCurrentExternalPrice: optionBCurrentExternalPrice,
        lastExternalPriceUpdate: event.block.timestamp,
        optionACurrentFairPrice: 0n,
        optionBCurrentFairPrice: 0n,
        lastFairPriceUpdate: 0n,
        volume: volume,
        createdAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      })
      .onConflictDoUpdate({
        platform: platformNum,
        platformName: platformName,
        tickerHash: tickerHash,
        externalId: marketIdStr,
        marketName: marketNameStr,
        optionAText: "Yes",
        optionBText: "No",
        subtitle: subtitleStr,
        eventTicker: eventTickerStr,
        updatedAt: event.block.timestamp,
      });

    console.log('MarketOnboarded successfully processed:', marketIdStr);
  } catch (error) {
    console.error('Error processing MarketOnboarded event:', error);
    throw error;
  }
});

// Market Config Updated Event
ponder.on('AIMM:MarketConfigUpdated', async ({ event, context }) => {
  const { tickerHash, ticker, platform, minPriceDiff, maxSpend, slippage } = event.args;
  const { db } = context;

  // Platform is now enum, ticker is readable string
  const marketIdStr = ticker;
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);

  console.log('MarketConfigUpdated event received:', {
    ticker: marketIdStr,
    platform: `${platformNum} (${platformName})`,
    minPriceDiff,
    maxSpend,
    slippage,
  });

  const configId = `${marketIdStr}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketConfig).values({
    id: configId,
    marketId: marketIdStr,
    platform: platformNum,
    platformName: platformName,
    minPriceDiff,
    maxSpend,
    slippage,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });
  try {
    await db.update(market, { id: marketIdStr }).set({
      minPriceDiff,
      maxSpend,
      slippage,
      updatedAt: event.block.timestamp,
    });
  } catch (error) {
    // Market doesn't exist yet, skip the update
    console.log(`Market ${marketIdStr} doesn't exist yet, skipping fair price update`);
  }
});

// Current Prices Updated Event (External)
ponder.on('AIMM:CurrentPricesUpdated', async ({ event, context }) => {
  const { tickerHash, ticker, platform, extPriceA, extPriceB } = event.args;
  const { db } = context;

  // Platform is now enum, ticker is readable string
  const marketIdStr = ticker;
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);

  console.log('CurrentPricesUpdated event received:', {
    ticker: marketIdStr,
    platform: `${platformNum} (${platformName})`,
    extPriceA,
    extPriceB,
  });

  const priceUpdateId = `${marketIdStr}-external-${event.block.number}-${event.log.logIndex}`;

  // Insert current price update event record
  await db.insert(currentPriceUpdate).values({
    id: priceUpdateId,
    marketId: marketIdStr,
    platform: platformNum,
    platformName: platformName,
    type: 'external',
    optionAPrice: extPriceA,
    optionBPrice: extPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the persistent market record with latest external prices (only if market exists)
  try {
    await db.update(market, { id: marketIdStr }).set({
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
  const { tickerHash, ticker, platform, fairPriceA, fairPriceB } = event.args;
  const { db } = context;

  // Platform is now enum, ticker is readable string
  const marketIdStr = ticker;
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);

  console.log('FairPricesUpdated event received:', {
    ticker: marketIdStr,
    platform: `${platformNum} (${platformName})`,
    fairPriceA,
    fairPriceB,
  });
  const priceUpdateId = `${marketIdStr}-fair-${event.block.number}-${event.log.logIndex}`;

  // Insert fair market price update event record
  await db.insert(fairMarketPriceUpdate).values({
    id: priceUpdateId,
    marketId: marketIdStr,
    platform: platformNum,
    platformName: platformName,
    type: 'fair',
    optionAPrice: fairPriceA,
    optionBPrice: fairPriceB,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the persistent market record with latest fair prices (only if market exists)
  try {
    await db.update(market, { id: marketIdStr }).set({
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
  const { tickerHash, ticker, platform, newStatus } = event.args;
  const { db } = context;

  // Platform is now enum, ticker is readable string
  const marketIdStr = ticker;
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);

  console.log('MarketStatusChanged event received:', {
    ticker: marketIdStr,
    platform: `${platformNum} (${platformName})`,
    newStatus,
  });
  const statusChangeId = `${marketIdStr}-${event.block.number}-${event.log.logIndex}`;

  await db.insert(marketStatusChange).values({
    id: statusChangeId,
    marketId: marketIdStr,
    platform: platformNum,
    platformName: platformName,
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
  const { tickerHash, ticker, platform, newStatus } = event.args;
  const { db } = context;

  // Platform is now enum, ticker is readable string
  const marketIdStr = ticker;
  const platformNum = Number(platform);
  const platformName = getPlatformName(platformNum);

  console.log('MarketStatusUpdated event received:', {
    ticker: marketIdStr,
    platform: `${platformNum} (${platformName})`,
    newStatus,
  });
  const statusChangeId = `${marketIdStr}-updated-${event.block.number}-${event.log.logIndex}`;

  // Insert status change event record (using same table but with different ID prefix)
  await db.insert(marketStatusChange).values({
    id: statusChangeId,
    marketId: marketIdStr,
    platform: platformNum,
    platformName: platformName,
    oldStatus: null, // Not provided in the event
    newStatus: Number(newStatus),
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionHash: event.transaction.hash,
  });

  // Update the market status in the persistent market table (only if market exists)
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
      finalResult,
      timestamp: event.block.timestamp,
      blockNumber: event.block.number,
      transactionHash: event.transaction.hash,
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
