import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
//import UtmTracker from '@/scripts/utmTracker';
//import { Suspense } from 'react';
//import MetaPixel from '@/scripts/MetaPixel';

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
        {/* O Next.js automaticamente move os componentes Script para o lugar correto */}
      </head>     
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* <MetaPixel />        
        <Suspense fallback={<div />}>
          <UtmTracker />
        </Suspense> */}
        {children}
      </body>
    </html>
  );
}