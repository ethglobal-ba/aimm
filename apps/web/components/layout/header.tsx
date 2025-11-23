'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowDown01Icon, Wallet01Icon } from 'hugeicons-react';
import { useEvmAddress, useSignOut } from '@coinbase/cdp-hooks';
import { ExportWalletModal } from '@coinbase/cdp-react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { evmAddress } = useEvmAddress();
  const { signOut } = useSignOut();
  const [isExportOpen, setIsExportOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Markets' },
    { href: '/overview', label: 'Overview' },
    { href: '/signals', label: 'Signals' },
  ];

  const shortAddress = evmAddress ? `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}` : null;

  return (
    <header className='border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='container flex h-14 max-w-screen-2xl items-center px-4'>
        <div className='flex flex-1 items-center gap-8'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              src='/aimm-logo.png'
              alt='AIMM'
              width={706}
              height={202}
              className='h-6 w-auto'
              priority
            />
          </Link>
          <nav className='hidden items-center gap-6 text-[13px] md:flex'>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-foreground transition-colors ${
                    isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className='flex items-center gap-2'>
          {shortAddress ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='border-border/40 bg-muted/40 text-foreground hover:bg-muted font-mono text-[11px]'
                >
                  <span className='mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400' />
                  {shortAddress}
                  <ArrowDown01Icon className='text-muted-foreground ml-2 size-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[220px]'>
                <DropdownMenuLabel className='flex flex-col gap-1 text-xs'>
                  <span className='text-muted-foreground'>Connected wallet</span>
                  <span className='font-mono text-[11px]'>{evmAddress}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-xs'
                  onSelect={() => {
                    if (!evmAddress) return;
                    void navigator.clipboard.writeText(evmAddress);
                  }}
                >
                  Copy address
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-xs'
                  onSelect={() => {
                    if (!evmAddress) return;
                    setIsExportOpen(true);
                  }}
                >
                  Export wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  className='text-xs'
                  onSelect={event => {
                    event.preventDefault();
                    void signOut();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
      <div className='hidden'>
        {evmAddress ? <ExportWalletModal address={evmAddress} open={isExportOpen} setIsOpen={setIsExportOpen} /> : null}
      </div>
    </header>
  );
}
