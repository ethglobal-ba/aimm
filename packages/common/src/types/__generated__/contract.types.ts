// Auto-generated contract types for AIMM
import type { Address } from 'viem'

export interface AIMMContract {
  address: Address
  abi: typeof import('../../../apps/indexer/abis/AIMMABI').AIMMABI
}

export interface MarketData {
  marketId: string
  externalId: string
  marketName: string
  optionAText: string
  optionBText: string
  optionACurrentExternalPrice: bigint
  optionBCurrentExternalPrice: bigint
  optionACurrentFairPrice: bigint
  optionBCurrentFairPrice: bigint
  lastPriceUpdate: bigint
  minPriceDifference: bigint
  maxSpendAmount: bigint
  slippageToleranceBps: bigint
  status: number // MarketStatus enum
}

export interface WorkflowResult {
  workflowName: string
  marketId: string
  optionAPrice: bigint
  optionBPrice: bigint
  offchainValue: bigint
  onchainValue: bigint
  finalResult: bigint
}

// Contract deployment info from broadcast
export const AIMM_DEPLOYMENTS = {
  baseSepolia: {
    address: '0xbCa1C2Ccd1A0A9012Be825eD872b4F73b12f9A02' as Address,
    blockNumber: 34029115n, // 0x2073e3b in decimal
    chainId: 84532
  }
} as const

export type AIMMEvents =
  | 'ResultUpdated'
  | 'MarketOnboarded'
  | 'MarketConfigUpdated'
  | 'CurrentPricesUpdated'
  | 'FairPricesUpdated'
  | 'MarketStatusChanged'
  | 'DefaultConfigUpdated'
  | 'OwnershipTransferred'
