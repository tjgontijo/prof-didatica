import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UtmifyScripts from '@/components/utmfy-scripts';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Otimização de fonte
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Otimização de fonte
});

export const metadata: Metadata = {
  title: "Prof Didática | Seu Portal Educativo",
  description: "Materiais educativos e recursos para professores e estudantes",
  icons: {
    icon: '/images/system/favicon.png',
    apple: '/images/system/favicon.png',
  },
  // Metadados adicionais para otimização
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#1D3557',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Preconectar a origens importantes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Precarregar recursos críticos */}
        <link rel="preload" as="image" href="/images/carrossel/1.webp" />
      </head>
      <body className="antialiased">
        {children}
        <UtmifyScripts />
      </body>
    </html>
  );
}
