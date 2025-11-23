'use client';

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { AIMM_CONTRACT_CONFIG } from '@/lib/aimm-contract';

const AUTOMATION_MAX_SPEND_DECIMALS = 18;

function toBigIntWithDecimals(value: number, decimals: number): bigint {
  if (!Number.isFinite(value) || value <= 0) {
    return 0n;
  }

  const factor = 10 ** decimals;
  const scaled = Math.round(value * factor);
  return BigInt(scaled);
}

export interface UpdateMarketAutomationConfigParams {
  driftThresholdPts: number;
  maxSpendUsd: number;
  slippagePts: number;
}

export function useUpdateMarketAutomationConfig(marketId?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updateConfig = (params: UpdateMarketAutomationConfigParams) => {
    if (!marketId) {
      return;
    }

    const minPriceDiffBps = BigInt(Math.round(params.driftThresholdPts * 100));
    const maxSpend = toBigIntWithDecimals(params.maxSpendUsd, AUTOMATION_MAX_SPEND_DECIMALS);
    const slippageBps = BigInt(Math.round(params.slippagePts * 100));

    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketConfig',
      args: [marketId, minPriceDiffBps, maxSpend, slippageBps],
    });
  };

  return {
    updateConfig,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}


