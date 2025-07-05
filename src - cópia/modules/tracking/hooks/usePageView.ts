'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Declaração global para acessar a flag metaPixelPageViewFired
// Interface para a função fbq do Facebook Pixel
interface FbPixelFunction {
  (method: string, ...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: FbPixelFunction;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: FbPixelFunction;
    metaPixelPageViewFired?: boolean;
  }
}

export function usePageView() {
  const pathname = usePathname()
  const previousPath = useRef<string>()
  const isFirstLoad = useRef<boolean>(true)

  useEffect(() => {
    console.log('[Meta Pixel] usePageView - Pathname atual:', pathname)
    
    if (!window.fbq) {
      console.error('[Meta Pixel] usePageView - fbq não está disponível')
      return
    }
    
    // Na primeira carga ou se o evento PageView já foi disparado pelo MetaPixel.tsx
    if (isFirstLoad.current) {
      console.log('[Meta Pixel] usePageView - Primeira carga, verificando flag global')
      
      // Definir a flag global se ainda não estiver definida
      if (typeof window.metaPixelPageViewFired === 'undefined') {
        window.metaPixelPageViewFired = false;
        console.log('[Meta Pixel] usePageView - Flag metaPixelPageViewFired inicializada como false')
      } else {
        console.log('[Meta Pixel] usePageView - Flag metaPixelPageViewFired já está definida como:', window.metaPixelPageViewFired)
      }
      
      previousPath.current = pathname
      isFirstLoad.current = false
      return
    }
    
    // Evitar duplicação se o pathname não mudou
    if (previousPath.current === pathname) {
      console.log('[Meta Pixel] usePageView - Mesmo pathname, ignorando')
      return
    }
    
    // Definir a flag global se ainda não estiver definida
    if (typeof window.metaPixelPageViewFired === 'undefined') {
      window.metaPixelPageViewFired = false;
    }
    
    // Disparar evento PageView apenas para mudanças de rota após a primeira carga
    console.log('[Meta Pixel] usePageView - Mudança de rota detectada, enviando evento PageView para:', pathname)
    
    // Atualizar a flag global para indicar que o PageView foi disparado
    window.metaPixelPageViewFired = true;
    
    window.fbq('track', 'PageView')
    previousPath.current = pathname
  }, [pathname])
}
