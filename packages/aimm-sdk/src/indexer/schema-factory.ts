// Schema factory to create hooks with the proper schema
// This allows consuming apps to provide their own schema imports

import { usePonderQuery } from '@ponder/react';
import { eq, desc, asc, and, gte, lte } from '@ponder/client';

export interface AimmSchema {
  markets: any;
  priceUpdates: any;
  marketStatusChanges: any;
  marketConfigs: any;
  workflowResults: any;
  defaultConfigUpdates: any;
  ownershipTransfers: any;
}

export function createAimmHooks(schema: AimmSchema) {
  return {
    /**
     * Hook to get all markets
     */
    useMarkets: (options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.markets)
            .orderBy(desc(schema.markets.createdAt)),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get a specific market by ID
     */
    useMarket: (marketId: string, options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.markets)
            .where(eq(schema.markets.id, marketId))
            .limit(1),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get markets by platform
     */
    useMarketsByPlatform: (platform: string, options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.markets)
            .where(eq(schema.markets.platform, platform))
            .orderBy(desc(schema.markets.createdAt)),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get markets by status
     */
    useMarketsByStatus: (status: number, options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.markets)
            .where(eq(schema.markets.status, status))
            .orderBy(desc(schema.markets.createdAt)),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get price updates for a market
     */
    useMarketPriceUpdates: (
      marketId: string,
      type?: 'external' | 'fair',
      options?: { live?: boolean; limit?: number }
    ) => {
      return usePonderQuery({
        queryFn: (db) => {
          let query = db
            .select()
            .from(schema.priceUpdates)
            .where(
              type
                ? and(
                    eq(schema.priceUpdates.marketId, marketId),
                    eq(schema.priceUpdates.type, type)
                  )
                : eq(schema.priceUpdates.marketId, marketId)
            );

          return query
            .orderBy(desc(schema.priceUpdates.timestamp))
            .limit(options?.limit ?? 50);
        },
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get latest price for a market
     */
    useLatestMarketPrices: (marketId: string, options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.priceUpdates)
            .where(eq(schema.priceUpdates.marketId, marketId))
            .orderBy(desc(schema.priceUpdates.timestamp))
            .limit(2), // Get latest external and fair prices
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get market status changes
     */
    useMarketStatusChanges: (marketId: string, options?: { live?: boolean; limit?: number }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.marketStatusChanges)
            .where(eq(schema.marketStatusChanges.marketId, marketId))
            .orderBy(desc(schema.marketStatusChanges.timestamp))
            .limit(options?.limit ?? 20),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get market configuration updates
     */
    useMarketConfigUpdates: (marketId: string, options?: { live?: boolean; limit?: number }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.marketConfigs)
            .where(eq(schema.marketConfigs.marketId, marketId))
            .orderBy(desc(schema.marketConfigs.timestamp))
            .limit(options?.limit ?? 10),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get workflow results
     */
    useWorkflowResults: (options?: { live?: boolean; limit?: number }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.workflowResults)
            .orderBy(desc(schema.workflowResults.timestamp))
            .limit(options?.limit ?? 50),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get latest workflow result
     */
    useLatestWorkflowResult: (options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.workflowResults)
            .orderBy(desc(schema.workflowResults.timestamp))
            .limit(1),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get default config updates
     */
    useDefaultConfigUpdates: (options?: { live?: boolean; limit?: number }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.defaultConfigUpdates)
            .orderBy(desc(schema.defaultConfigUpdates.timestamp))
            .limit(options?.limit ?? 10),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get latest default config
     */
    useLatestDefaultConfig: (options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.defaultConfigUpdates)
            .orderBy(desc(schema.defaultConfigUpdates.timestamp))
            .limit(1),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get ownership transfers
     */
    useOwnershipTransfers: (options?: { live?: boolean; limit?: number }) => {
      return usePonderQuery({
        queryFn: (db) =>
          db
            .select()
            .from(schema.ownershipTransfers)
            .orderBy(desc(schema.ownershipTransfers.timestamp))
            .limit(options?.limit ?? 10),
        live: options?.live ?? true,
      });
    },

    /**
     * Hook to get market statistics
     */
    useMarketStats: (options?: { live?: boolean }) => {
      return usePonderQuery({
        queryFn: async (db) => {
          const totalMarkets = await db
            .select({ count: schema.markets.id })
            .from(schema.markets);

          const activeMarkets = await db
            .select({ count: schema.markets.id })
            .from(schema.markets)
            .where(eq(schema.markets.status, 0)); // Active status

          const totalPriceUpdates = await db
            .select({ count: schema.priceUpdates.id })
            .from(schema.priceUpdates);

          const totalWorkflowResults = await db
            .select({ count: schema.workflowResults.id })
            .from(schema.workflowResults);

          return {
            totalMarkets: totalMarkets.length,
            activeMarkets: activeMarkets.length,
            totalPriceUpdates: totalPriceUpdates.length,
            totalWorkflowResults: totalWorkflowResults.length,
          };
        },
        live: options?.live ?? true,
      });
    },
  };
}