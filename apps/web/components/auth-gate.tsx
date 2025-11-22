'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ShieldKeyIcon } from 'hugeicons-react';
import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';

import { MainLayout } from '@/components/layout/main-layout';
import { DemoOnboardingProvider } from '@/components/demo-onboarding-context';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Text } from '@workspace/ui/components/text';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isSignedIn } = useIsSignedIn();
  const [hasContractBalance, setHasContractBalance] = useState<boolean | null>(null);
  const [hasConnectionSettled, setHasConnectionSettled] = useState(false);

  // MOCK: for this hackathon build we simulate the vault balance via localStorage instead of reading the AIMM contract.
  // Replace this effect with a real on-chain balance check when wiring production.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem('aimmHasContractBalance');
    if (stored === 'true') {
      setHasContractBalance(true);
      return;
    }

    if (stored === 'false') {
      setHasContractBalance(false);
      return;
    }

    setHasContractBalance(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setHasConnectionSettled(true);
    }, 250);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  // MOCK: marks onboarding as complete purely in local state + localStorage; no real deposits are made here.
  const handleCompleteOnboarding = () => {
    setHasContractBalance(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aimmHasContractBalance', 'true');
    }
  };

  const authState: 'connecting' | 'disconnected' | 'onboarding' | 'ready' = (() => {
    if (!hasConnectionSettled) {
      return 'connecting';
    }

    if (!isSignedIn) {
      return 'disconnected';
    }

    if (hasContractBalance === null) {
      return 'connecting';
    }

    return hasContractBalance ? 'ready' : 'onboarding';
  })();

  if (authState === 'ready') {
    return (
      <DemoOnboardingProvider>
        <MainLayout>{children}</MainLayout>
      </DemoOnboardingProvider>
    );
  }

  return (
    <div className='flex min-h-[70vh] items-center justify-center px-4 py-8'>
      <Card className='w-full max-w-md border-border/60 bg-card/70 shadow-lg shadow-black/30'>
        <CardHeader className='space-y-2'>
          <div className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary'>
            <ShieldKeyIcon className='size-3.5' />
            <span>Wallet access required</span>
          </div>
          {authState === 'connecting' ? (
            <>
              <CardTitle className='text-lg font-semibold tracking-tight'>Preparing your dashboard…</CardTitle>
              <Text as='p' variant='body' muted>
                Verifying wallet connection and AIMM vault state.
              </Text>
            </>
          ) : (
            <>
              <CardTitle className='text-lg font-semibold tracking-tight'>
                {authState === 'disconnected' ? 'Connect your wallet to continue' : 'Set up your AIMM vault'}
              </CardTitle>
              <Text as='p' variant='body' muted>
                {authState === 'disconnected'
                  ? 'AIMM uses your connected wallet to scope access to markets and manage positions.'
                  : 'This looks like your first time here. Before the agent can trade on your behalf, you\'ll deposit into the AIMM vault contract.'}
              </Text>
            </>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          {authState === 'connecting' ? (
            <Text as='p' variant='body' muted>
              Detecting wallet connection…
            </Text>
          ) : authState === 'disconnected' ? (
            <div className='flex flex-col gap-3'>
              <Text as='p' variant='caption' muted>
                Click below to sign in with Coinbase CDP embedded wallets. We&apos;ll create a wallet for you under the hood.
              </Text>
              <div className='flex justify-start'>
                <AuthButton />
              </div>
            </div>
          ) : (
            <div className='space-y-3 text-sm'>
              <Text as='p' variant='caption' muted>
                For this hackathon build we simulate the vault balance locally. In the full version, this step will
                check your deposited balance in the AIMM contract on-chain.
              </Text>
              <ul className='list-disc space-y-1 pl-4 text-xs text-muted-foreground'>
                <li>Your wallet stays in control of funds.</li>
                <li>The agent only trades using funds you deposit into the vault.</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className='flex flex-col items-stretch gap-2 border-t border-border/50 bg-muted/5 px-6 py-4'>
          {authState === 'disconnected' ? (
            <Text as='p' variant='caption' muted>
              Once connected, you&apos;ll see your AIMM dashboard here.
            </Text>
          ) : authState === 'onboarding' ? (
            <>
              <Button size='sm' className='w-full text-xs' onClick={handleCompleteOnboarding}>
                Simulate deposit & continue
              </Button>
              <Text as='p' variant='caption' muted>
                Demo mode only – real deposits will be wired to the AIMM vault contract later.
              </Text>
            </>
          ) : (
            <Text as='p' variant='caption' muted>
              Waiting for wallet status…
            </Text>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}


