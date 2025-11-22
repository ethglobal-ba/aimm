import { onchainTable } from 'ponder';

// Markets table
export const markets = onchainTable('markets', t => ({
  id: t.text().primaryKey(), // marketId
  platform: t.text().notNull(),
  externalId: t.text().notNull(),
  marketName: t.text().notNull(),
  optionAText: t.text().notNull(),
  optionBText: t.text().notNull(),
  status: t.integer().notNull().default(0), // MarketStatus enum
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

// Market configuration updates
export const marketConfigs = onchainTable('market_configs', t => ({
  id: t.text().primaryKey(), // `${marketId}-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.text().notNull(),
  minPriceDiff: t.bigint().notNull(),
  maxSpend: t.bigint().notNull(),
  slippage: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Price updates (external)
export const priceUpdates = onchainTable('price_updates', t => ({
  id: t.text().primaryKey(), // `${marketId}-external-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.text().notNull(),
  type: t.text().notNull(), // 'external' or 'fair'
  optionAPrice: t.bigint().notNull(),
  optionBPrice: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Market status changes
export const marketStatusChanges = onchainTable('market_status_changes', t => ({
  id: t.text().primaryKey(), // `${marketId}-${blockNumber}-${logIndex}`
  marketId: t.text().notNull(),
  platform: t.text().notNull(),
  oldStatus: t.integer(),
  newStatus: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Default configuration updates
export const defaultConfigUpdates = onchainTable('default_config_updates', t => ({
  id: t.text().primaryKey(), // `${blockNumber}-${logIndex}`
  driftPercentage: t.bigint().notNull(),
  maxSpend: t.bigint().notNull(),
  slippage: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Workflow results
export const workflowResults = onchainTable('workflow_results', t => ({
  id: t.text().primaryKey(), // `${resultId}`
  resultId: t.bigint().notNull(),
  finalResult: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));

// Ownership transfers
export const ownershipTransfers = onchainTable('ownership_transfers', t => ({
  id: t.text().primaryKey(), // `${blockNumber}-${logIndex}`
  previousOwner: t.hex().notNull(),
  newOwner: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}));
