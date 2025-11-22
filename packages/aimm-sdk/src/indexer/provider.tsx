import React, { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PonderProvider } from '@ponder/react';
import { createPonderClient, DEFAULT_INDEXER_URL } from './client';
import type { AimmSchema } from './schema-factory';

export interface AimmIndexerConfig {
  indexerUrl?: string;
  queryClient?: QueryClient;
  schema?: AimmSchema;
}

interface AimmIndexerContextValue {
  indexerUrl: string;
  client: ReturnType<typeof createPonderClient>;
}

const AimmIndexerContext = createContext<AimmIndexerContextValue | null>(null);

export interface AimmIndexerProviderProps {
  children: ReactNode;
  config?: AimmIndexerConfig;
}

/**
 * Provider component that sets up both TanStack Query and Ponder clients
 * for the AIMM indexer data
 */
export function AimmIndexerProvider({ children, config = {} }: AimmIndexerProviderProps) {
  const indexerUrl = config.indexerUrl ?? DEFAULT_INDEXER_URL;
  const queryClient = config.queryClient ?? new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });

  const ponderClient = createPonderClient(indexerUrl, config.schema);

  const contextValue: AimmIndexerContextValue = {
    indexerUrl,
    client: ponderClient,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PonderProvider client={ponderClient}>
        <AimmIndexerContext.Provider value={contextValue}>
          {children}
        </AimmIndexerContext.Provider>
      </PonderProvider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access the AIMM indexer context
 */
export function useAimmIndexer() {
  const context = useContext(AimmIndexerContext);
  if (!context) {
    throw new Error('useAimmIndexer must be used within an AimmIndexerProvider');
  }
  return context;
}

/**
 * Hook to get the current indexer URL
 */
export function useIndexerUrl() {
  const { indexerUrl } = useAimmIndexer();
  return indexerUrl;
}

/**
 * Hook to get the Ponder client instance
 */
export function usePonderClient() {
  const { client } = useAimmIndexer();
  return client;
}