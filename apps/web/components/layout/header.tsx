'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet01Icon } from 'hugeicons-react';
import { AppKitButton } from '@/components/appkit-button';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Markets' },
    { href: '/overview', label: 'Overview' },
    { href: '/signals', label: 'Signals' },
  ];

  return (
    <header className='border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
      <div className='container flex h-14 max-w-screen-2xl items-center px-4'>
        <div className='flex flex-1 items-center gap-8'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='bg-primary/10 text-primary rounded-md p-1.5'>
              <Wallet01Icon className='size-4' />
            </div>
            <span className='text-[15px] font-semibold'>AIMM</span>
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
        <div className='flex items-center gap-3'>
          <AppKitButton />
        </div>
      </div>
    </header>
  );
}
