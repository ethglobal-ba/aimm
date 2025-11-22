// Market status enum matching the contract
export enum MarketStatus {
  Active = 0,
  ClosedInternal = 1,
  ClosedExternal = 2,
}

// Price update types
export type PriceUpdateType = 'external' | 'fair';

// Activity types for the recent activity hook
export type ActivityType = 'price_update' | 'status_change' | 'workflow_result';

// Market data with parsed status
export interface MarketWithStatus {
  id: string;
  platform: string;
  externalId: string;
  marketName: string;
  optionAText: string;
  optionBText: string;
  status: MarketStatus;
  createdAt: bigint;
  updatedAt: bigint;
}

// Price data with parsed values
export interface PriceData {
  id: string;
  marketId: string;
  platform: string;
  type: PriceUpdateType;
  optionAPrice: bigint;
  optionBPrice: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Market statistics
export interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  totalPriceUpdates: number;
  totalWorkflowResults: number;
}

// Activity item for recent activity feed
export interface ActivityItem {
  type: ActivityType;
  marketId: string | null;
  timestamp: bigint;
  data: any;
}

// Common query options
export interface QueryOptions {
  live?: boolean;
  limit?: number;
}

// Market query filters
export interface MarketFilters {
  platform?: string;
  status?: MarketStatus;
  limit?: number;
}

// Price query filters
export interface PriceFilters {
  type?: PriceUpdateType;
  limit?: number;
  fromTimestamp?: bigint;
  toTimestamp?: bigint;
}

// Status change data
export interface StatusChangeData {
  id: string;
  marketId: string;
  platform: string;
  oldStatus: number | null;
  newStatus: number;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Config update data
export interface ConfigUpdateData {
  id: string;
  marketId: string;
  platform: string;
  minPriceDiff: bigint;
  maxSpend: bigint;
  slippage: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Workflow result data
export interface WorkflowResultData {
  id: string;
  resultId: bigint;
  finalResult: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Default config data
export interface DefaultConfigData {
  id: string;
  driftPercentage: bigint;
  maxSpend: bigint;
  slippage: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

// Ownership transfer data
export interface OwnershipTransferData {
  id: string;
  previousOwner: `0x${string}`;
  newOwner: `0x${string}`;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}