import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ATIVIDADES português 1° AO 5° ANO (BNCC) | Prof Didática',
  description: 'Material completo de atividades de português para alunos do 1° ao 5° ano, alinhado à BNCC.',
};

export default function UpsellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
