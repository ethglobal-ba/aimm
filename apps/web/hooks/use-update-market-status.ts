'use client';

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { AIMM_CONTRACT_CONFIG, MarketStatus } from '@/lib/aimm-contract';
import type { MarketAimmStatus } from '@/types/market';

type UpdatableMarketAimmStatus = Extract<MarketAimmStatus, 'ACTIVE' | 'INACTIVE'>;

interface UseUpdateMarketStatusResult {
  readonly updateStatus: (marketId: string, nextStatus: UpdatableMarketAimmStatus) => void;
  readonly isPending: boolean;
  readonly isConfirming: boolean;
  readonly isConfirmed: boolean;
  readonly error: Error | null;
}

export function useUpdateMarketStatus(): UseUpdateMarketStatusResult {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const updateStatus = (marketId: string, nextStatus: UpdatableMarketAimmStatus) => {
    if (!marketId) {
      return;
    }

    const onchainStatus = nextStatus === 'ACTIVE' ? MarketStatus.Active : MarketStatus.Inactive;

    console.log('onchainStatus', onchainStatus);
    console.log('marketId', marketId);
    console.log('nextStatus', nextStatus);
    console.log('AIMM_CONTRACT_CONFIG', AIMM_CONTRACT_CONFIG);
    console.log('functionName', 'updateMarketStatus');
    console.log('args', [marketId, onchainStatus]);

    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketStatus',
      args: [marketId, onchainStatus],
    });
  };

  return {
    updateStatus,
    isPending,
    isConfirming,
    isConfirmed,
    error: (error as Error | null) ?? null,
  };
}
