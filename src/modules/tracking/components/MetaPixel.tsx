'use client'
import Script from 'next/script'
import { useRef, useEffect } from 'react'
import { buildTrackingData } from '../services/trackingService'
import { AdvancedMatchingData } from '../types/tracking'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

declare global {
  interface Window { 
    fbq?: FbPixelFunction;
    metaPixelPageViewFired?: boolean; // Flag para controlar se o PageView inicial já foi disparado
    _fbq?: FbPixelFunction;
  }
}

// Interface para a função fbq do Facebook Pixel
interface FbPixelFunction {
  (method: string, ...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: FbPixelFunction;
  loaded?: boolean;
  version?: string;
}

export default function MetaPixel() {
  // Usar ref em vez de state para evitar re-renderizações
  const initializedRef = useRef(false)

  // Inicializar o pixel quando o componente for montado
  useEffect(() => {
    // Evitar inicialização duplicada
    if (initializedRef.current) {
      console.log('[Meta Pixel] Pixel já inicializado, ignorando')
      return
    }

    // Verificar se o ID do pixel está definido
    if (!META_PIXEL_ID) {
      console.error('[Meta Pixel] ID do pixel não encontrado. Verifique a variável de ambiente NEXT_PUBLIC_META_PIXEL_ID')
      return
    }

    console.log('[Meta Pixel] Iniciando configuração do pixel...')

    // Definir a função fbq global
    if (!window.fbq) {
      console.log('[Meta Pixel] Definindo objeto fbq global')
      // Definimos a função fbq global
      window.fbq = function(...args: unknown[]) {
        // Criamos uma referência local para evitar erros de tipo
        const fbq = window.fbq;
        
        // Verificamos se as propriedades existem antes de usar
        if (fbq) {
          // Usamos type assertion para evitar erros de tipagem
          const fbqWithMethods = fbq as unknown as {
            callMethod?: (...args: unknown[]) => void;
            queue?: unknown[];
          };
          
          if (fbqWithMethods.callMethod) {
            fbqWithMethods.callMethod(...args);
          } else if (fbqWithMethods.queue) {
            fbqWithMethods.queue.push(args);
          }
        }
      }
      if (window.fbq) {
        window.fbq.push = window.fbq
        window.fbq.loaded = true
        window.fbq.version = '2.0'
        window.fbq.queue = []
      }
    }

    // Inicializar o pixel com advanced matching
    const initPixel = async () => {
      try {
        console.log('[Meta Pixel] Obtendo dados de tracking...')
        const tracking = await buildTrackingData()
        
        // Criar objeto de advanced matching apenas com dados válidos
        const advancedMatching: AdvancedMatchingData = {}
        
        if (tracking.city) advancedMatching.city = tracking.city.toLowerCase()
        if (tracking.region) advancedMatching.region = tracking.region.toLowerCase()
        if (tracking.zip) advancedMatching.zip = String(tracking.zip).replace(/[^0-9]/g, '').substring(0, 5)
        if (tracking.country) advancedMatching.country = tracking.country.toLowerCase()
        if (tracking.ip) advancedMatching.clientIpAddress = tracking.ip
        
        if (tracking.userAgent) advancedMatching.clientUserAgent = tracking.userAgent

        if (tracking.fbp) advancedMatching.fbp = tracking.fbp
        if (tracking.fbc) advancedMatching.fbc = tracking.fbc
        
        console.log('[Meta Pixel] Inicializando com ID:', META_PIXEL_ID)
        console.log('[Meta Pixel] Advanced matching:', advancedMatching)
        
        // Inicializar o pixel
        if (window.fbq) {
          window.fbq('init', META_PIXEL_ID, advancedMatching)
          
          // Polling para aguardar sessionId e cookies fbp/fbc antes de disparar o PATCH
          let attempts = 0;
          const maxAttempts = 10; // evita loop infinito (ex: 10 tentativas)
          const interval = setInterval(async () => {
            attempts++;
            // Só dispara se sessionId existir e for válido
            if (tracking.sessionId) {
              const getCookie = (name: string): string | undefined => {
                const cookies = document.cookie.split(';')
                const match = cookies.find(c => c.trim().startsWith(`${name}=`))
                return match?.split('=')[1]
              }
              const fbp = getCookie('_fbp')
              const fbc = getCookie('_fbc')
              if (fbp || fbc) {
                try {
                  console.log('[Meta Pixel] Cookies encontrados após inicialização:', { fbp, fbc })
                  console.log('[Meta Pixel] Atualizando sessão com cookies...')
                  // Enviar atualização para a API
                  const response = await fetch('/api/tracking/session', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      sessionId: tracking.sessionId,
                      fbp,
                      fbc
                    }),
                  })
                  if (response.ok) {
                    console.log('[Meta Pixel] Sessão atualizada com sucesso com cookies fbp/fbc')
                  } else {
                    console.error('[Meta Pixel] Erro ao atualizar sessão com cookies:', await response.text())
                  }
                } catch (error) {
                  console.error('[Meta Pixel] Erro ao atualizar cookies na sessão:', error)
                }
                clearInterval(interval); // para o polling
              }
            }
            if (attempts >= maxAttempts) clearInterval(interval); // segurança
          }, 1000); // tenta a cada 1 segundo
          
          // Verificar se o evento PageView já foi disparado
          if (!window.metaPixelPageViewFired) {
            // Enviar evento PageView
            console.log('[Meta Pixel] Enviando evento PageView inicial')
            window.fbq('track', 'PageView')
          }
          
          // Marcar que o evento PageView já foi disparado
          window.metaPixelPageViewFired = true
          console.log('[Meta Pixel] Flag metaPixelPageViewFired definida como true')
        } else {
          console.log('[Meta Pixel] Evento PageView já foi disparado anteriormente, ignorando')
        }
        
        // Marcar como inicializado usando ref
        initializedRef.current = true
        console.log('[Meta Pixel] Inicialização concluída com sucesso')
      } catch (e) {
        console.error('[Meta Pixel] Erro durante a inicialização:', e)
      }
    }
    
    initPixel()
  }, []) // Array de dependências vazio para executar apenas uma vez

  return (
    <>
      {/* Script principal do Facebook Pixel */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `
        }}
      />
      
      {/* Fallback para navegadores sem JavaScript */}
      <noscript>
        {/* Usando um elemento div com background-image em vez de img para evitar o aviso do Next.js */}
      <div
        style={{
          position: 'absolute',
          height: '1px',
          width: '1px',
          overflow: 'hidden',
          backgroundImage: `url(https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1)`,
          backgroundSize: '1px 1px'
        }}
        role="presentation"
        aria-hidden="true"
      />
      </noscript>
    </>
  )
}
