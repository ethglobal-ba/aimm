'use client';

import type { ReactNode } from 'react';
import { CDPReactProvider } from '@coinbase/cdp-react/components/CDPReactProvider';

interface CdpProviderProps {
  children: ReactNode;
}

export function CdpProvider({ children }: CdpProviderProps) {
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? 'eba3698b-ef14-48d0-8a32-85ed0bfd3339';
  const appName = process.env.NEXT_PUBLIC_CDP_APP_NAME ?? 'AIMM Dashboard';

  if (!projectId) {
    // CDP requires a project ID configured at build time; without it we can't initialize the provider.
    // We intentionally render children so the rest of the app still loads in non-wallet environments.
    return <>{children}</>;
  }

  return (
    <CDPReactProvider
      config={{
        projectId,
        appName,
        ethereum: {
          createOnLogin: 'eoa',
        },
      }}
    >
      {children}
    </CDPReactProvider>
  );
}
