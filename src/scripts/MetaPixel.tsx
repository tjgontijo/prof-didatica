'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// Usar a variável de ambiente para o ID do pixel
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// Interface para os dados do cliente usados no Advanced Matching
interface CustomerData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
}

/**
 * Componente para inicializar e gerenciar o Meta Pixel com Advanced Matching
 * Deve ser incluído no layout principal da aplicação
 */
// Componente interno que usa useSearchParams
function MetaPixelContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para formatar os dados do cliente para Advanced Matching
  const formatCustomerDataForAdvancedMatching = (data: CustomerData) => {
    if (!data) return {};
    
    // Formatação conforme documentação da Meta
    const formattedData: Record<string, string | undefined> = {
      // Email deve estar em minúsculas
      em: data.email?.toLowerCase(),
      
      // Telefone deve conter apenas dígitos
      // Adicionar código do país se não estiver presente (55 para Brasil)
      ph: data.phone ? (
        data.phone.replace(/\D/g, '').startsWith('55') 
          ? data.phone.replace(/\D/g, '') 
          : `55${data.phone.replace(/\D/g, '')}`
      ) : undefined,
      
      // Nome em minúsculas e sem pontuação ou caracteres especiais
      fn: data.firstName?.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z]/g, ''),        // Remove não-letras
      
      // Sobrenome em minúsculas e sem pontuação ou caracteres especiais
      ln: data.lastName?.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z]/g, ''),        // Remove não-letras
      
      // Cidade em minúsculas e sem espaços ou caracteres especiais
      ct: data.city?.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s/g, '')              // Remove espaços
        .replace(/[^a-z]/g, ''),        // Remove não-letras
      
      // Estado como código de duas letras em minúsculas
      st: data.state?.toLowerCase().substring(0, 2),
      
      // CEP como string sem hífens ou espaços
      // Para CEPs dos EUA, usar apenas os 5 primeiros dígitos
      zp: data.zipCode?.replace(/[\s-]/g, ''),
      
      // País como código de duas letras em minúsculas
      country: data.country?.toLowerCase().substring(0, 2) || 'br',
      
      // ID externo
      external_id: data.externalId,     
      
    };
    
    // Remover campos undefined
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    });
    
    return formattedData;
  };

  // Função para obter dados do cliente do localStorage
  const getCustomerDataFromStorage = (): CustomerData | null => {
    try {
      const customerDataStr = localStorage.getItem('customerData');
      if (!customerDataStr) return null;
      
      const customerData = JSON.parse(customerDataStr);
      
      // Verificar cookies do Facebook
      const getCookie = (name: string): string | null => {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.indexOf(`${name}=`) === 0) {
            return cookie.substring(`${name}=`.length);
          }
        }
        return null;
      };
      
      // Adicionar cookies se não estiverem presentes
      customerData.fbp = customerData.fbp || getCookie('_fbp');
      customerData.fbc = customerData.fbc || getCookie('_fbc');
      
      return customerData;
    } catch (e) {
      console.error('Erro ao recuperar dados do cliente:', e);
      return null;
    }
  };

  // Inicializar o pixel e monitorar mudanças de rota
  useEffect(() => {
    // Função para inicializar o pixel
    const initializePixel = () => {
      if (typeof window === 'undefined' || !window.fbq || !META_PIXEL_ID) return;
      
      try {
        // Obter dados do cliente para Advanced Matching
        const customerData = getCustomerDataFromStorage();
        const advancedMatchingData = customerData ? formatCustomerDataForAdvancedMatching(customerData) : {};
        
        // Inicializar o pixel com Advanced Matching
        window.fbq('init', META_PIXEL_ID, advancedMatchingData);
        
        // Marcar como inicializado
        setIsInitialized(true);
        
        // Log para depuração
        console.log('Meta Pixel inicializado com Advanced Matching:', advancedMatchingData);
      } catch (error) {
        console.error('Erro ao inicializar o Meta Pixel:', error);
      }
    };
    
    // Inicializar o pixel quando o script estiver carregado
    if (typeof window !== 'undefined' && window.fbq && !isInitialized) {
      initializePixel();
    }
  }, [isInitialized]);

  // Enviar evento PageView em cada mudança de rota
  useEffect(() => {
    if (typeof window === 'undefined' || !window.fbq || !isInitialized) return;
    
    // Enviar evento PageView
    try {
      window.fbq('track', 'PageView');
      console.log('Evento PageView enviado para o Meta Pixel');
    } catch (error) {
      console.error('Erro ao enviar evento PageView:', error);
    }
  }, [pathname, searchParams, isInitialized]);

  return (
    <>
      {/* Meta Pixel Code - Script base */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
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

/**
 * Componente exportado que envolve o conteúdo em um Suspense boundary
 * para resolver o erro de useSearchParams
 */
export default function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelContent />
    </Suspense>
  );
}
