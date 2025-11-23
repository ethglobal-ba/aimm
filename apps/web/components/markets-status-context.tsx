'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { MarketAimmStatus } from '@/types/market';

interface MarketsStatusState {
  readonly statusesById: Record<string, MarketAimmStatus>;
  readonly getStatus: (marketId: string) => MarketAimmStatus | undefined;
  readonly setStatus: (marketId: string, status: MarketAimmStatus) => void;
}

const MarketsStatusContext = createContext<MarketsStatusState | null>(null);

interface MarketsStatusProviderProps {
  children: ReactNode;
}

/**
 * MOCK: Frontend-only, in-memory store for AIMM market statuses.
 *
 * This provider is intentionally UI-only for now. It lets users mark markets
 * as ACTIVE / INACTIVE / EXTERNALLY_CLOSED / INTERNALLY_CLOSED and share that
 * state between the overview table and the market detail page.
 *
 * In production this will be replaced by persisted state coming from the AIMM
 * contracts / indexer / backend. When that is wired, this provider should
 * become a thin adapter over those real data sources instead of local state.
 */
export function MarketsStatusProvider({ children }: MarketsStatusProviderProps): JSX.Element {
  const [statusesById, setStatusesById] = useState<Record<string, MarketAimmStatus>>({});

  const getStatus = useCallback(
    (marketId: string) => {
      return statusesById[marketId];
    },
    [statusesById]
  );

  const setStatus = useCallback((marketId: string, status: MarketAimmStatus) => {
    setStatusesById(prev => {
      if (prev[marketId] === status) {
        return prev;
      }

      return {
        ...prev,
        [marketId]: status,
      };
    });
  }, []);

  const value: MarketsStatusState = useMemo(
    () => ({
      statusesById,
      getStatus,
      setStatus,
    }),
    [statusesById, getStatus, setStatus]
  );

  return <MarketsStatusContext.Provider value={value}>{children as any}</MarketsStatusContext.Provider>;
}

export function useMarketsStatus(): MarketsStatusState {
  const context = useContext(MarketsStatusContext);

  if (!context) {
    throw new Error('useMarketsStatus must be used within a MarketsStatusProvider');
  }

  return context;
}


