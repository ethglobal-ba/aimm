'use client';

import { useAIMMUpdateMarketConfig } from '../contract';

const AUTOMATION_MAX_SPEND_DECIMALS = 18;

function toBigIntWithDecimals(value: number, decimals: number): bigint {
  if (!Number.isFinite(value) || value <= 0) {
    return 0n;
  }

  const factor = 10 ** decimals;
  const scaled = Math.round(value * factor);
  return BigInt(scaled);
}
//Below was deleted because we have graphql api
// export function useMarkets(): {

//Below was deleted because we have graphql api
// export function useMarket(marketId?: string) {

export interface UpdateMarketAutomationConfigParams {
  driftThresholdPts: number;
  maxSpendUsd: number;
  slippagePts: number;
}

export function useUpdateMarketAutomationConfig(marketId?: string) {
  const { updateMarketConfig, isPending, isConfirming, isConfirmed, error } = useAIMMUpdateMarketConfig();

  const saveAutomationConfig = (params: UpdateMarketAutomationConfigParams) => {
    if (!marketId) {
      return;
    }

    const minPriceDiffBps = BigInt(Math.round(params.driftThresholdPts * 100));
    const maxSpend = toBigIntWithDecimals(params.maxSpendUsd, AUTOMATION_MAX_SPEND_DECIMALS);
    const slippageBps = BigInt(Math.round(params.slippagePts * 100));

    updateMarketConfig({
      marketId,
      minPriceDiff: minPriceDiffBps,
      maxSpend,
      slippageBps,
    });
  };

  return {
    updateConfig: saveAutomationConfig,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
