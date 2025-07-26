import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
//import { UtmifyScripts } from '@/scripts/utmifyScripts';
import { ClarityScript } from '@/scripts/clarityScripts';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prof Didática | Seu Portal Educativo',
  description: 'Materiais educativos e recursos para professores e estudantes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* <UtmifyScripts /> */}
            <Script id="config-init" strategy="beforeInteractive">
              {`
                window.__config__ = {};
              `}
            </Script>

            <Script
              src="/scripts/pixel-tracking.js"
              strategy="afterInteractive"
            />

            <ClarityScript />
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
