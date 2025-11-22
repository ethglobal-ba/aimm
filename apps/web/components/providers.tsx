'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/wagmi-config';
import { MarketsStatusProvider } from '@/components/markets-status-context';

const queryClient = new QueryClient();

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://38.224.253.95:42069/graphql',
  }),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <MarketsStatusProvider>
            <NextThemesProvider
              attribute='class'
              defaultTheme='dark'
              forcedTheme='dark'
              disableTransitionOnChange
              enableColorScheme
            >
              {children}
            </NextThemesProvider>
          </MarketsStatusProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
