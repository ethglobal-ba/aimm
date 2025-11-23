'use client';

import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { ShieldKeyIcon } from 'hugeicons-react';
import { useEffect, useState } from 'react';

import { DemoOnboardingProvider } from '@/components/demo-onboarding-context';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Text } from '@workspace/ui/components/text';

interface AuthGateProps {
  children: React.ReactNode;
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
    <div className='relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-slate-950 to-background text-foreground'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(52,211,153,0.12),_transparent_55%)]' />

      <div className='relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-8'>
        <header className='mb-12 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 text-primary inline-flex items-center justify-center rounded-md p-2'>
              <ShieldKeyIcon className='size-4' />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
                AIMM
              </span>
              <span className='text-sm text-muted-foreground'>AI market maker for prediction markets</span>
            </div>
          </div>
          <Text as='p' variant='caption' muted className='hidden text-xs sm:block'>
            Institutional-grade pricing inference for long‑tail markets.
          </Text>
        </header>

        <main className='flex flex-1 flex-col gap-10 lg:flex-row lg:items-center'>
          <section className='flex-1 space-y-8'>
            <div className='space-y-4'>
              <div className='bg-emerald-500/10 text-emerald-300 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
                <span>Turn dead markets into functioning order books</span>
              </div>
              <div className='space-y-3'>
                <h1 className='text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl'>
                  Connect your wallet to activate your AI market maker.
                </h1>
                <p className='text-muted-foreground text-sm sm:text-base'>
                  AIMM researches real‑time data, prices niche prediction markets in seconds, and automatically
                  balances odds for you across Limitless, Kalshi, Polymarket and beyond.
                </p>
              </div>
            </div>

            <div className='grid gap-4 text-xs sm:grid-cols-3 sm:text-sm'>
              <div className='bg-background/60 border-border/40 rounded-lg border p-4 backdrop-blur'>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Research layer</p>
                <p className='mt-1 text-[13px] text-foreground'>
                  AI agent synthesizes comparable markets, news and sentiment to infer fair prices.
                </p>
              </div>
              <div className='bg-background/60 border-border/40 rounded-lg border p-4 backdrop-blur'>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Execution layer</p>
                <p className='mt-1 text-[13px] text-foreground'>
                  On-chain automation keeps your order books aligned with the agent&apos;s fair value 24/7.
                </p>
              </div>
              <div className='bg-background/60 border-border/40 rounded-lg border p-4 backdrop-blur'>
                <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Market access</p>
                <p className='mt-1 text-[13px] text-foreground'>
                  Retrieve x402-enabled prices or let AIMM trade directly on integrated venues.
                </p>
              </div>
            </div>

            <div className='border-border/40 text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] sm:text-xs'>
              <span className='font-medium text-foreground'>How it works</span>
              <span>1. Connect your wallet</span>
              <span>2. Choose markets to manage</span>
              <span>3. Configure limits & intervals</span>
            </div>
          </section>

          <section className='w-full max-w-md lg:w-[380px]'>
            <Card className='border-border/60 bg-card/75 shadow-lg shadow-black/30'>
              <CardHeader className='space-y-2'>
                <div className='bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs'>
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
                        : "This looks like your first time here. Before the agent can trade on your behalf, you'll deposit into the AIMM vault contract."}
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
                      Click below to sign in with Coinbase CDP embedded wallets. We&apos;ll create a wallet for you
                      under the hood.
                    </Text>
                    <div className='flex justify-start'>
                      <AuthButton />
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3 text-sm'>
                    <Text as='p' variant='caption' muted>
                      For this hackathon build we simulate the vault balance locally. In the full version, this step
                      will check your deposited balance in the AIMM contract on-chain.
                    </Text>
                    <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-xs'>
                      <li>Your wallet stays in control of funds.</li>
                      <li>The agent only trades using funds you deposit into the vault.</li>
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className='border-border/50 bg-muted/5 flex flex-col items-stretch gap-2 border-t px-6 py-4'>
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

            <p className='text-muted-foreground mt-3 text-[11px] leading-relaxed'>
              By continuing, you agree that AIMM acts as a non-custodial agent, placing orders on your behalf within
              the limits you configure. You can pause or modify agents at any time from the dashboard.
            </p>
          </section>
        </main>

        <footer className='mt-10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground'>
          <span>AIMM: Adding efficiency to financial markets.</span>
          <span>Built for ETHGlobal Buenos Aires 2025.</span>
        </footer>
      </div>
    </div>
  );
}
