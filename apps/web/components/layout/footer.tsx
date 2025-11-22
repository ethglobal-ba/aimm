import Link from 'next/link';

export function Footer() {
  return (
    <footer className='border-border/40 bg-background border-t'>
      <div className='container flex flex-col items-center justify-between gap-3 py-6 md:h-16 md:flex-row md:py-0'>
        <div className='flex flex-col items-center gap-3 px-8 md:flex-row md:gap-2 md:px-0'>
          <p className='text-muted-foreground text-center text-[13px] leading-relaxed md:text-left'>
            Built for{' '}
            <Link
              href='https://ethglobal.com'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground font-medium underline underline-offset-4'
            >
              ETHGlobal Devconnect Buenos Aires
            </Link>
            . Powered by{' '}
            <Link
              href='https://base.org'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground font-medium underline underline-offset-4'
            >
              Base
            </Link>
            ,{' '}
            <Link
              href='https://pyth.network'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground font-medium underline underline-offset-4'
            >
              Pyth
            </Link>
            {' & '}
            <Link
              href='https://chain.link'
              target='_blank'
              rel='noreferrer'
              className='hover:text-foreground font-medium underline underline-offset-4'
            >
              Chainlink
            </Link>
            .
          </p>
        </div>
        <div className='flex gap-4'>
          <Link
            href='https://github.com'
            target='_blank'
            rel='noreferrer'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <span className='sr-only'>GitHub</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' />
              <path d='M9 18c-4.51 2-5-2-7-2' />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
