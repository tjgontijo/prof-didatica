import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
//import { UtmifyScripts } from '@/scripts/utmifyScripts';
import { ClarityScript } from '@/scripts/clarityScripts';
import { Elev8TrackingScript } from '@/scripts/Elev8TrackingScript';

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
            <ClarityScript />
            <Elev8TrackingScript pixelId="7968324796552425" />
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
