import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import MetaPixel from '@/modules/tracking/components/MetaPixel';
import PageViewTracker from '@/modules/tracking/components/PageViewTracker';
import { TrackingInitializer } from '@/modules/tracking/components/TrackingInitializer';


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
        {/* Inicialização do tracking e gerenciamento de sessão */}
        <TrackingInitializer />
        {/* Usando apenas o MetaPixel para inicialização e primeiro PageView */}
        <MetaPixel />
        {/* PageViewTracker agora só rastreia mudanças de rota após o carregamento inicial */}
        <PageViewTracker />    
        {children}
      </body>
    </html>
  );
}