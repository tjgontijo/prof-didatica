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
      
      {/* Script para enviar o PageView com os parâmetros adicionais e advanced matching */}
      <Script id="facebook-pixel-pageview" strategy="afterInteractive">
        {`
          // Função para obter dados do cliente do localStorage
          function getCustomerDataFromStorage() {
            try {
              // Verificar se temos dados do cliente armazenados
              const customerDataStr = localStorage.getItem('customerData');
              if (customerDataStr) {
                return JSON.parse(customerDataStr);
              }
              
              // Verificar se temos dados de usuário armazenados em outro formato
              const userData = localStorage.getItem('userData');
              if (userData) {
                const parsedUserData = JSON.parse(userData);
                return {
                  email: parsedUserData.email,
                  phone: parsedUserData.phone || parsedUserData.telefone,
                  firstName: parsedUserData.firstName || parsedUserData.nome,
                  lastName: parsedUserData.lastName || parsedUserData.sobrenome,
                  city: parsedUserData.city || parsedUserData.cidade,
                  state: parsedUserData.state || parsedUserData.estado,
                  zipCode: parsedUserData.zipCode || parsedUserData.cep,
                  country: parsedUserData.country || parsedUserData.pais || 'Brasil',
                  externalId: parsedUserData.externalId || parsedUserData.id
                };
              }
            } catch (e) {
              console.error('Erro ao recuperar dados do cliente:', e);
            }
            return null;
          }
          
          // Função para aplicar hash SHA-256 aos dados do cliente
          async function hashCustomerData(customerData) {
            if (!customerData) return {};
            
            const hashValue = async (value) => {
              if (!value) return undefined;
              
              // Normalizar o valor (remover espaços, converter para minúsculas)
              const normalized = value.trim().toLowerCase();
              
              // Verificar se o navegador suporta SubtleCrypto
              if (window.crypto && window.crypto.subtle && window.crypto.subtle.digest) {
                try {
                  // Converter string para bytes
                  const encoder = new TextEncoder();
                  const data = encoder.encode(normalized);
                  
                  // Gerar hash SHA-256
                  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                  
                  // Converter buffer para string hexadecimal
                  const hashArray = Array.from(new Uint8Array(hashBuffer));
                  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                  
                  return hashHex;
                } catch (e) {
                  console.error('Erro ao gerar hash:', e);
                }
              }
              
              return undefined;
            };
            
            // Aplicar hash em todos os campos
            const hashedData = {};
            if (customerData.email) hashedData.em = await hashValue(customerData.email);
            if (customerData.phone) hashedData.ph = await hashValue(customerData.phone);
            if (customerData.firstName) hashedData.fn = await hashValue(customerData.firstName);
            if (customerData.lastName) hashedData.ln = await hashValue(customerData.lastName);
            if (customerData.city) hashedData.ct = await hashValue(customerData.city);
            if (customerData.state) hashedData.st = await hashValue(customerData.state);
            if (customerData.zipCode) hashedData.zp = await hashValue(customerData.zipCode);
            if (customerData.country) hashedData.country = await hashValue(customerData.country);
            if (customerData.externalId) hashedData.external_id = await hashValue(customerData.externalId);
            
            return hashedData;
          }
          
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
          
          // Processar e enviar o evento com advanced matching
          async function sendPageViewWithAdvancedMatching() {
            try {
              // Obter dados do cliente do localStorage
              const customerData = getCustomerDataFromStorage();
              
              // Se temos dados do cliente, aplicar hash e incluir no advanced matching
              if (customerData) {
                const hashedData = await hashCustomerData(customerData);
                
                // Inicializar o pixel com advanced matching
                if (typeof fbq !== 'undefined' && Object.keys(hashedData).length > 0) {
                  fbq('init', '${META_PIXEL_ID}', hashedData);
                }
              }
              
              // Enviar evento PageView com dados adicionais
              if (typeof fbq !== 'undefined') {
                fbq('track', 'PageView', pageViewData);
              }
            } catch (e) {
              console.error('Erro ao processar advanced matching:', e);
              
              // Garantir que o evento seja enviado mesmo se houver erro
              if (typeof fbq !== 'undefined') {
                fbq('track', 'PageView', pageViewData);
              }
            }
          }
          
          // Executar o envio do evento
          sendPageViewWithAdvancedMatching();
        `.replace(/\$\{META_PIXEL_ID\}/g, META_PIXEL_ID || '')}
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
