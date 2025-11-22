'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { config, networks, projectId, wagmiAdapter } from '@/config';
import { mainnet } from '@reown/appkit/networks';

const queryClient = new QueryClient();

const metadata = {
  name: 'ETHGlobal Devconnect BA Prework',
  description: 'Web3 Application',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://example.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Initialize AppKit outside the component render cycle
if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: networks,
    defaultNetwork: mainnet,
    metadata,
    features: { analytics: true },
  });
}

export function Providers({ children, cookies }: { children: React.ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(config as Config, cookies);

  return (
    <WagmiProvider config={config as Config} initialState={initialState}>
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
