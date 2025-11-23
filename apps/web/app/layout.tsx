import type { ReactNode } from 'react';
import { Bricolage_Grotesque, Geist_Mono } from 'next/font/google';
import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';
import { AuthGate } from '@/components/auth-gate';
import { CdpProvider } from '@/components/cdp-provider';

const fontSans = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root { color-scheme: dark; }
            html, body { background-color: oklch(0.18 0.005 264); color: oklch(0.9 0.005 264); }
          `,
          }}
        />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} dark font-sans antialiased`}>
        <Providers>
          <CdpProvider>
            <AuthGate>{children}</AuthGate>
          </CdpProvider>
        </Providers>
      </body>
    </html>
  );
}
