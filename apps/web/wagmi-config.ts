import { createConfig } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { http } from 'viem';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import type { Config as CDPConfig } from '@coinbase/cdp-core';

const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? 'eba3698b-ef14-48d0-8a32-85ed0bfd3339';

// CDP core configuration shared between the embedded wallet connector and React hooks.
const cdpConfig: CDPConfig = {
  projectId,
  ethereum: {
    createOnLogin: 'eoa',
  },
};

const cdpConnector = createCDPEmbeddedWalletConnector({
  cdpConfig,
  providerConfig: {
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [cdpConnector],
  ssr: true,
});
