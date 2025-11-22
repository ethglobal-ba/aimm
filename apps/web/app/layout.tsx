import { Geist, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';

import '@workspace/ui/globals.css';
import { Providers } from '@/components/providers';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

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
        <Providers cookies={cookies}>{children}</Providers>
      </body>
    </html>
  );
}
