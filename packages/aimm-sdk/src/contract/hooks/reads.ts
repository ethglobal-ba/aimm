'use client'

import { useReadContract, useReadContracts } from 'wagmi'
import { AIMM_CONTRACT_CONFIG, type ExternalMarket, type DefaultConfig, type PriceDriftResult } from '../types'

export function useAIMMDefaultConfig() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'defaultConfig',
  })
}

export function useAIMMAllMarketIds() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getAllMarketIds',
  })
}

export function useAIMMMarket(marketId?: string) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getMarket',
    args: marketId ? [marketId] : undefined,
    query: {
      enabled: !!marketId,
    },
  })
}

export function useAIMMShouldBalancePrice(marketId?: string) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'shouldBalancePrice',
    args: marketId ? [marketId] : undefined,
    query: {
      enabled: !!marketId,
    },
  })
}

export function useAIMMMultipleMarkets(marketIds: string[]) {
  const contracts = marketIds.map(marketId => ({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getMarket' as const,
    args: [marketId],
  }))

  return useReadContracts({
    contracts,
    query: {
      enabled: marketIds.length > 0,
    },
  })
}

export function useAIMMMarketPriceDrift(marketIds: string[]) {
  const contracts = marketIds.map(marketId => ({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'shouldBalancePrice' as const,
    args: [marketId],
  }))

  return useReadContracts({
    contracts,
    query: {
      enabled: marketIds.length > 0,
    },
  })
}