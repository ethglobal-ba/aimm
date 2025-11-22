import { onchainTable } from 'ponder';

// Markets table
export const market = onchainTable('market', t => ({
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
export const marketConfig = onchainTable('market_config', t => ({
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
export const priceUpdate = onchainTable('price_update', t => ({
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
export const marketStatusChange = onchainTable('market_status_change', t => ({
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
