import { onchainTable } from 'ponder';

// Markets table
export const market = onchainTable('market', t => ({
  id: t.text().primaryKey(), // marketId (ticker)
  platform: t.integer().notNull(), // Platform enum: 0=KALSHI, 1=LIMITLESS, 2=TRUMPFUN
  platformName: t.text().notNull(), // Human readable platform name: 'Kalshi', 'Limitless', 'Trump.fun'
  tickerHash: t.hex().notNull(), // Hash of the ticker from contract event
  externalId: t.text().notNull(), // Same as id, kept for compatibility
  marketName: t.text().notNull(),
  optionAText: t.text().notNull(),
  optionBText: t.text().notNull(),
  subtitle: t.text().notNull(),
  eventTicker: t.text(),
  status: t.integer().notNull().default(0), // MarketStatus enum: 0=Inactive, 1=Active, 2=ClosedInternal, 3=ClosedExternal
  // Current external prices
  optionACurrentExternalPrice: t.bigint().default(0n),
  optionBCurrentExternalPrice: t.bigint().default(0n),
  lastExternalPriceUpdate: t.bigint().default(0n),
  // Current fair prices
  optionACurrentFairPrice: t.bigint().default(0n),
  optionBCurrentFairPrice: t.bigint().default(0n),
  lastFairPriceUpdate: t.bigint().default(0n),
  minPriceDiff: t.bigint().default(0n),
  maxSpend: t.bigint().default(0n),
  slippage: t.bigint().default(0n),
  // Volume
  volume: t.bigint().default(0n),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

// Market configuration updates
export const marketConfig = onchainTable('market_config', t => ({
  id: t.text().primaryKey(), // `${marketId}-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.integer().notNull(), // Platform enum
  platformName: t.text().notNull(), // Human readable platform name
  minPriceDiff: t.bigint().notNull(),
  maxSpend: t.bigint().notNull(),
  slippage: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Current price updates (external)
export const currentPriceUpdate = onchainTable('current_price_update', t => ({
  id: t.text().primaryKey(), // `${marketId}-external-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.integer().notNull(), // Platform enum
  platformName: t.text().notNull(), // Human readable platform name
  type: t.text().notNull(), // 'external'
  optionAPrice: t.bigint().notNull(),
  optionBPrice: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Fair market price updates
export const fairMarketPriceUpdate = onchainTable('fair_market_price_update', t => ({
  id: t.text().primaryKey(), // `${marketId}-fair-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.integer().notNull(), // Platform enum
  platformName: t.text().notNull(), // Human readable platform name
  type: t.text().notNull(), // 'fair'
  optionAPrice: t.bigint().notNull(),
  optionBPrice: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Market status changes
export const marketStatusChange = onchainTable('market_status_change', t => ({
  id: t.text().primaryKey(), // `${marketId}-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.integer().notNull(), // Platform enum
  platformName: t.text().notNull(), // Human readable platform name
  oldStatus: t.integer(),
  newStatus: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Default configuration updates
export const defaultConfigUpdate = onchainTable('default_config_update', t => ({
  id: t.text().primaryKey(), // `${blockNumber}-${logIndex}`
  driftPercentage: t.bigint().notNull(),
  maxSpend: t.bigint().notNull(),
  slippage: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Workflow results
export const workflowResult = onchainTable('workflow_result', t => ({
  id: t.text().primaryKey(), // `${resultId}`
  resultId: t.bigint().notNull(),
  finalResult: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Ownership transfers
export const ownershipTransfer = onchainTable('ownership_transfer', t => ({
  id: t.text().primaryKey(), // `${blockNumber}-${logIndex}`
  previousOwner: t.hex().notNull(),
  newOwner: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));
