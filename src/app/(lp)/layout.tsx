'use client';

import { UtmifyScripts } from '@/scripts/utmifyScripts';
import { ClarityScript } from '@/scripts/clarityScripts';

/**
 * Layout específico para as landing pages (diretório (lp))
 * 
 * No Next.js App Router, os layouts são aninhados hierarquicamente:
 * 1. O layout raiz (src/app/layout.tsx) é aplicado a todas as páginas e define a estrutura HTML básica
 *    incluindo as tags html, head e body
 * 2. Este layout (lp) é aplicado apenas às páginas dentro do diretório (lp) e é renderizado
 *    dentro do layout raiz (dentro da tag body)
 * 3. A estrutura final será: RootLayout (html, head, body) > LandingPageLayout > Page
 */
export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Os scripts são adicionados apenas nas landing pages */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <ClarityScript />
          <UtmifyScripts />
        </>
      )}
      {children}
    </>
  );
}
