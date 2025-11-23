'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { AIMM_CONTRACT_CONFIG } from '../types';

export function useAIMMDefaultConfig() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'defaultConfig',
  });
}

export function useAIMMAllMarketIds() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getAllMarketIds',
  });
}

export function useAIMMMarket(marketId?: string) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getMarket',
    args: marketId ? [marketId] : undefined,
    query: {
      enabled: !!marketId,
    },
  });
}

export function useAIMMShouldBalancePrice(marketId?: string) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'shouldBalancePrice',
    args: marketId ? [marketId] : undefined,
    query: {
      enabled: !!marketId,
    },
  });
}

export function useAIMMMultipleMarkets(marketIds: string[]) {
  const contracts = marketIds.map(marketId => ({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'getMarket' as const,
    args: [marketId],
  }));

  return useReadContracts({
    contracts,
    query: {
      enabled: marketIds.length > 0,
    },
  });
}

export function useAIMMMarketPriceDrift(marketIds: string[]) {
  const contracts = marketIds.map(marketId => ({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'shouldBalancePrice' as const,
    args: [marketId],
  }));

  return useReadContracts({
    contracts,
    query: {
      enabled: marketIds.length > 0,
    },
  });
}

export function useAIMMMarketConfig(marketId?: string) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'marketConfigs',
    args: marketId ? [marketId] : undefined,
    query: {
      enabled: !!marketId,
    },
  });
}

export function useAIMMLatestResult() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'latestResult',
  });
}

export function useAIMMResultCount() {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'resultCount',
  });
}

export function useAIMMResult(resultId?: bigint) {
  return useReadContract({
    ...AIMM_CONTRACT_CONFIG,
    functionName: 'results',
    args: resultId !== undefined ? [resultId] : undefined,
    query: {
      enabled: resultId !== undefined,
    },
  });
}
