import { AIMMABI } from './abi'

export type ContractMarketStatus = 'Active' | 'ClosedInternal' | 'ClosedExternal'

export interface ExternalMarket {
  externalId: string
  marketName: string
  optionAText: string
  optionBText: string
  optionACurrentExternalPrice: bigint
  optionBCurrentExternalPrice: bigint
  optionACurrentFairPrice: bigint
  optionBCurrentFairPrice: bigint
  lastCurrentPriceUpdate: bigint
  lastFairPriceUpdate: bigint
  volume: bigint
  minPriceDifference: bigint
  maxSpendAmount: bigint
  slippageToleranceBps: bigint
  status: ContractMarketStatus
}

export interface DefaultConfig {
  driftPercentagePoints: bigint
  maxSpendAmount: bigint
  slippageToleranceBps: bigint
}

export interface WorkflowResult {
  workflowName: string
  marketId: string
  optionAPrice: bigint
  optionBPrice: bigint
  volume: bigint
  offchainValue: bigint
  onchainValue: bigint
  finalResult: bigint
}

export interface PriceDriftResult {
  shouldBalance: boolean
  driftA: bigint
  driftB: bigint
}

export const AIMM_CONTRACT_CONFIG = {
  address: '0x7Eb455A7D85A0098714B3F682b3BE8c994c5A843' as const,
  abi: AIMMABI,
  chainId: 84532, // Base Sepolia
}