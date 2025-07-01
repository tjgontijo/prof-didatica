// Utilitários para manipulação de cookies

/**
 * Obtém um cookie pelo nome
 * @param name Nome do cookie
 * @returns Valor do cookie ou null se não existir
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(`${name}=`) === 0) {
      return cookie.substring(`${name}=`.length);
    }
  }
  
  return null;
}

/**
 * Interface para cookies do Facebook
 */
interface FacebookCookies {
  fbp: string | null;
  fbc: string | null;
}

/**
 * Obtém os cookies do Facebook (_fbp e _fbc)
 * @returns Objeto com os valores dos cookies do Facebook
 */
export function getFacebookCookies(): FacebookCookies {
  // Obter cookies diretamente do navegador
  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');
  
  // Se algum dos cookies não estiver disponível, tentar recuperar da estrutura unificada
  if (!fbp || !fbc) {
    try {
      const storedData = localStorage.getItem('tracking');
      if (storedData) {
        const trackingData = JSON.parse(storedData);
        
        // Verificar se há cookies na estrutura unificada
        if (trackingData.cookies) {
          // Usar o valor armazenado apenas se o cookie não estiver disponível
          return {
            fbp: fbp || trackingData.cookies.fbp,
            fbc: fbc || trackingData.cookies.fbc
          };
        }
      }
    } catch (error) {
      console.error('Erro ao recuperar cookies do Facebook do localStorage:', error);
    }
  }
  
  return { fbp, fbc };
}

/**
 * Armazena os cookies do Facebook no localStorage para uso futuro
 * @param fbp Valor do cookie _fbp
 * @param fbc Valor do cookie _fbc
 */
export function storeFacebookCookies(fbp: string | null, fbc: string | null): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Só armazenar se pelo menos um dos cookies existir
    if (fbp || fbc) {
      localStorage.setItem('_fb_cookies', JSON.stringify({ fbp, fbc }));
    }
  } catch (error) {
    console.error('Erro ao armazenar cookies do Facebook:', error);
  }
}

/**
 * Verifica e armazena os cookies do Facebook se existirem
 * Deve ser chamada regularmente para garantir que temos os cookies mais recentes
 */
export function checkAndStoreFacebookCookies(): void {
  const { fbp, fbc } = getFacebookCookies();
  storeFacebookCookies(fbp, fbc);
}
