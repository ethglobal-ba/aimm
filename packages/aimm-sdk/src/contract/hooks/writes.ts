'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AIMM_CONTRACT_CONFIG } from '../types'

export function useAIMMOnboardMarket() {
  const { writeContract, data: hash, ...rest } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const onboardMarket = (params: {
    marketId: string
    externalId: string
    marketName: string
    optionAText: string
    optionBText: string
    optionACurrentExternalPrice: bigint
    optionBCurrentExternalPrice: bigint
    initialVolume: bigint
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'onboardMarket',
      args: [
        params.marketId,
        params.externalId,
        params.marketName,
        params.optionAText,
        params.optionBText,
        params.optionACurrentExternalPrice,
        params.optionBCurrentExternalPrice,
        params.initialVolume,
      ],
    })
  }

  return {
    onboardMarket,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  }
}

export function useAIMMUpdateMarketConfig() {
  const { writeContract, data: hash, ...rest } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const updateMarketConfig = (params: {
    marketId: string
    minPriceDiff: bigint
    maxSpend: bigint
    slippageBps: bigint
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketConfig',
      args: [
        params.marketId,
        params.minPriceDiff,
        params.maxSpend,
        params.slippageBps,
      ],
    })
  }

  return {
    updateMarketConfig,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  }
}

export function useAIMMUpdateMarketStatus() {
  const { writeContract, data: hash, ...rest } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const updateMarketStatus = (params: {
    marketId: string
    newStatus: 0 | 1 | 2 // MarketStatus enum values
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateMarketStatus',
      args: [params.marketId, params.newStatus],
    })
  }

  return {
    updateMarketStatus,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  }
}

export function useAIMMUpdateDefaultConfig() {
  const { writeContract, data: hash, ...rest } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash })

  const updateDefaultConfig = (params: {
    driftPercentage: bigint
    maxSpend: bigint
    slippageBps: bigint
  }) => {
    writeContract({
      ...AIMM_CONTRACT_CONFIG,
      functionName: 'updateDefaultConfig',
      args: [
        params.driftPercentage,
        params.maxSpend,
        params.slippageBps,
      ],
    })
  }

  return {
    updateDefaultConfig,
    hash,
    isConfirming,
    isConfirmed,
    ...rest,
  }
}