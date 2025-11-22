'use client'

import { useMemo } from 'react'
import { useAIMMAllMarketIds, useAIMMMultipleMarkets } from '../contract'
import type { Market, MarketStatus as FrontendMarketStatus, AIRunStatus } from './types'

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

export function useMarkets() {
  const { data: marketIds, isLoading: idsLoading, error: idsError } = useAIMMAllMarketIds()
  const { data: marketsData, isLoading: marketsLoading, error: marketsError } = useAIMMMultipleMarkets(
    marketIds ? [...marketIds] : []
  )

  const markets = useMemo(() => {
    if (!marketIds || !marketsData) return []

    return marketIds.map((marketId, index) => {
      const result = marketsData[index]
      if (!result?.result) return null

      return transformContractMarketToFrontendMarket(marketId, result.result)
    }).filter((market): market is Market => market !== null)
  }, [marketIds, marketsData])

  return {
    data: markets,
    isLoading: idsLoading || marketsLoading,
    error: idsError || marketsError,
  }
}

export function useMarket(marketId?: string) {
  const { data: marketIds } = useAIMMAllMarketIds()
  const validMarketId = marketId && marketIds?.includes(marketId) ? marketId : undefined
  const { data: marketsData, isLoading, error } = useAIMMMultipleMarkets(
    validMarketId ? [validMarketId] : []
  )

  const market = useMemo(() => {
    if (!validMarketId || !marketsData?.[0]?.result) return null

    return transformContractMarketToFrontendMarket(validMarketId, marketsData[0].result)
  }, [validMarketId, marketsData])

  return {
    data: market,
    isLoading,
    error,
  }
}