'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/wagmi-config';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute='class'
          defaultTheme='dark'
          forcedTheme='dark'
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
