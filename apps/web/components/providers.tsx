'use client';

import { MarketsStatusProvider } from '@/components/markets-status-context';
import { wagmiConfig } from '@/wagmi-config';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'http://38.224.253.95:42069/graphql',
  }),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development',
});

export function Providers({ children }: { children: React.ReactNode }): JSX.Element {
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
