'use client';

import Script from 'next/script';

// Usar a variável de ambiente para o ID do pixel
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  return (
    <>
      {/* Meta Pixel Code - Inicialização básica */}
      <Script id="facebook-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          // Inicializar o pixel
          fbq('init', '${META_PIXEL_ID}');
        `.replace(/\$\{META_PIXEL_ID\}/g, META_PIXEL_ID || '')}
      </Script>
      
      {/* Script para capturar e usar fbp e fbc */}
      <Script id="facebook-pixel-fbp-fbc" strategy="afterInteractive">
        {`
          // Função para obter o parâmetro fbclid da URL
          function getFbclid() {
            const params = new URLSearchParams(window.location.search);
            return params.get('fbclid');
          }
          
          // Função para obter o cookie _fbp existente
          function getExistingFbp() {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.indexOf('_fbp=') === 0) {
                return cookie.substring('_fbp='.length);
              }
            }
            return null;
          }
          
          // Função para obter o cookie _fbc existente
          function getExistingFbc() {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.indexOf('_fbc=') === 0) {
                return cookie.substring('_fbc='.length);
              }
            }
            return null;
          }
          
          // Criar novo cookie _fbp se não existir
          function createFbpCookie() {
            const version = 'fb';
            const subdomainIndex = '1';
            const creationTime = Date.now();
            const randomNumber = Math.floor(Math.random() * 1000000000);
            
            const fbpValue = version + '.' + subdomainIndex + '.' + creationTime + '.' + randomNumber;
            
            // Definir o cookie _fbp com validade de 90 dias
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 90);
            document.cookie = '_fbp=' + fbpValue + ';expires=' + expiryDate.toUTCString() + ';path=/;domain=' + window.location.hostname + ';SameSite=Lax';
            
            return fbpValue;
          }
          
          // Criar novo cookie _fbc se tiver fbclid
          function createFbcCookie(fbclid) {
            if (!fbclid) return null;
            
            const version = 'fb';
            const subdomainIndex = '1';
            const creationTime = Date.now();
            
            const fbcValue = version + '.' + subdomainIndex + '.' + creationTime + '.' + fbclid;
            
            // Definir o cookie _fbc com validade de 90 dias
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 90);
            document.cookie = '_fbc=' + fbcValue + ';expires=' + expiryDate.toUTCString() + ';path=/;domain=' + window.location.hostname + ';SameSite=Lax';
            
            return fbcValue;
          }
          
          // Obter ou criar os cookies fbp e fbc
          let fbp = getExistingFbp();
          if (!fbp) {
            fbp = createFbpCookie();
          }
          
          const fbclid = getFbclid();
          let fbc = getExistingFbc();
          if (fbclid) {
            fbc = createFbcCookie(fbclid);
          }
        `}
      </Script>
      
      {/* Script para enviar o PageView com os parâmetros adicionais */}
      <Script id="facebook-pixel-pageview" strategy="afterInteractive">
        {`
          // Coletar informações adicionais para o PageView
          const pageViewData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            referrer: document.referrer || undefined,
            user_agent: navigator.userAgent,
            language: navigator.language,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            timestamp: new Date().toISOString()
          };
          
          // Adicionar os parâmetros fbp e fbc para melhorar o matching
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf('_fbp=') === 0) {
              pageViewData.fbp = cookie.substring('_fbp='.length);
            }
            if (cookie.indexOf('_fbc=') === 0) {
              pageViewData.fbc = cookie.substring('_fbc='.length);
            }
          }
          
          // Enviar evento PageView com dados adicionais
          if (typeof fbq !== 'undefined') {
            fbq('track', 'PageView', pageViewData);
          }
        `}
      </Script>
      
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
