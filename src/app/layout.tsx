import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import TrackingInitializer from '@/modules/tracking/components/Initializer';

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
      </head>     
      <body className={`${inter.variable} font-sans antialiased`}>
        <TrackingInitializer />        
        {children}
      </body>
    </html>
  );
}