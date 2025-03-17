import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UtmifyScripts } from '@/components/scripts/utmifyScripts';
import { Claritycript } from '@/components/scripts/clarityScripts';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prof Didática | Seu Portal Educativo",
  description: "Materiais educativos e recursos para professores e estudantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Claritycript />
        <UtmifyScripts />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
