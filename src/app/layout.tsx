import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UtmifyScripts } from '@/scripts/utmifyScripts';
import { Claritycript } from '@/scripts/clarityScripts';
import './globals.css';

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
            <UtmifyScripts />
            <Claritycript />
          </>
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
