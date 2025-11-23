'use client'

import { useMemo } from 'react'
import { useAIMMAllMarketIds, useAIMMMultipleMarkets, useAIMMUpdateMarketConfig } from '../contract'
import type { Market, MarketStatus as FrontendMarketStatus, AIRunStatus } from './types'

// NOTE: Contract market type intentionally kept as unknown shape here because
// it is derived from on-chain ABI types. We only access a narrow, well-known
// subset of fields below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformContractMarketToFrontendMarket(
  marketId: string,
  contractMarket: any
): Market {
  const statusMap: Record<number, FrontendMarketStatus> = {
    0: 'open', // Active
    1: 'closed', // ClosedInternal
    2: 'closed', // ClosedExternal
  }

  const aCurrentPrice = Number(contractMarket.optionACurrentExternalPrice) / 100
  const bCurrentPrice = Number(contractMarket.optionBCurrentExternalPrice) / 100
  const aFairPrice = Number(contractMarket.optionACurrentFairPrice) / 100
  const bFairPrice = Number(contractMarket.optionBCurrentFairPrice) / 100

  const livePrice = aCurrentPrice > bCurrentPrice ? aCurrentPrice : (100 - aCurrentPrice)
  const aimmFairPrice = aFairPrice > bFairPrice ? aFairPrice : (100 - aFairPrice)

  const platform = marketId.includes('polymarket') ? 'polymarket'
    : marketId.includes('kalshi') ? 'kalshi'
    : marketId.includes('limitless') ? 'limitless'
    : marketId.includes('trump') ? 'trump.fun'
    : 'limitless'

  return {
    id: marketId,
    title: contractMarket.marketName || 'Unknown Market',
    platform,
    symbol: contractMarket.externalId || marketId,
    livePrice,
    aimmFairPrice,
    status: statusMap[contractMarket.status] || 'open',
    agentPosition: null,
    lastAction: null,
    lastActionTimestamp: new Date(Number(contractMarket.lastCurrentPriceUpdate) * 1000),
    lastAIRun: new Date(Number(contractMarket.lastFairPriceUpdate) * 1000),
    aiRunStatus: 'success' as AIRunStatus,
    volume24h: Number(contractMarket.volume),
    timeToClose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }
}

const AUTOMATION_MAX_SPEND_DECIMALS = 18

function toBigIntWithDecimals(value: number, decimals: number): bigint {
  if (!Number.isFinite(value) || value <= 0) {
    return 0n
  }

  const factor = 10 ** decimals
  const scaled = Math.round(value * factor)
  return BigInt(scaled)
}
//Below was deleted because we have graphql api
// export function useMarkets(): {

//Below was deleted because we have graphql api
// export function useMarket(marketId?: string) {

export interface UpdateMarketAutomationConfigParams {
  driftThresholdPts: number
  maxSpendUsd: number
  slippagePts: number
}

export function useUpdateMarketAutomationConfig(marketId?: string) {
  const {
    updateMarketConfig,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useAIMMUpdateMarketConfig()

  const saveAutomationConfig = (params: UpdateMarketAutomationConfigParams) => {
    if (!marketId) {
      return
    }

    const minPriceDiffBps = BigInt(Math.round(params.driftThresholdPts * 100))
    const maxSpend = toBigIntWithDecimals(params.maxSpendUsd, AUTOMATION_MAX_SPEND_DECIMALS)
    const slippageBps = BigInt(Math.round(params.slippagePts * 100))

    updateMarketConfig({
      marketId,
      minPriceDiff: minPriceDiffBps,
      maxSpend,
      slippageBps,
    })
  }

  return {
    updateConfig: saveAutomationConfig,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}