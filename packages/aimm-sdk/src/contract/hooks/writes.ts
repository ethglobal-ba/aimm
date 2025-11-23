'use client';

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { AIMM_CONTRACT_CONFIG, MarketStatus, Platform } from '../types';

export function useAIMMOnboardMarket() {
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const onboardMarket = (params: {
    ticker: string;
    platform: Platform;
    marketName: string;
    subtitle: string;
    eventTicker: string;
    optionACurrentExternalPrice: bigint;
    optionBCurrentExternalPrice: bigint;
    initialVolume: bigint;
    imageUrl: string;
  }) => {
    // Contract expects OnboardMarketParams struct
    const onboardParams = {
      ticker: params.ticker,
      platform: params.platform,
      marketName: params.marketName,
      subtitle: params.subtitle,
      eventTicker: params.eventTicker,
      optionACurrentExternalPrice: params.optionACurrentExternalPrice,
      optionBCurrentExternalPrice: params.optionBCurrentExternalPrice,
      initialVolume: params.initialVolume,
      imageUrl: params.imageUrl,
    };

    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'onboardMarket',
      args: [onboardParams],
    });
  };

  return {
    onboardMarket,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  };
}

export function useAIMMUpdateMarketConfig() {
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updateMarketConfig = (params: {
    marketId: string;
    minPriceDiff: bigint;
    maxSpend: bigint;
    slippageBps: bigint;
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketConfig',
      args: [params.marketId, params.minPriceDiff, params.maxSpend, params.slippageBps],
    });
  };

  return {
    updateMarketConfig,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  };
}

export function useAIMMUpdateMarketStatus() {
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updateMarketStatus = (params: {
    marketId: string;
    newStatus: MarketStatus;
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketStatus',
      args: [params.marketId, params.newStatus],
    });
  };

  return {
    updateMarketStatus,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  };
}

export function useAIMMUpdateDefaultConfig() {
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const updateDefaultConfig = (params: { driftPercentage: bigint; maxSpend: bigint; slippageBps: bigint }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateDefaultConfig',
      args: [params.driftPercentage, params.maxSpend, params.slippageBps],
    });
  };

  return {
    updateDefaultConfig,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  };
}

