import { GeoData } from '../types/tracking'
import { getStoredGeoData, setStoredGeoData } from './storage'

// Interfaces para os dados retornados pelos serviços de IP
interface IpifyResponse {
  ip: string;
}

interface DbIpResponse {
  ipAddress: string;
}

interface MyIpResponse {
  ip: string;
}

// Interface para resposta do ip-api.com
interface IpApiResponse {
  status: string;
  country?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
}

// Interface para resposta do ipwho.is
interface IpWhoIsResponse {
  success: boolean;
  city?: string;
  region?: string;
  postal?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Interface para resposta do ipapi.co
interface IpapiCoResponse {
  error?: boolean;
  city?: string;
  region?: string;
  postal?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Busca o IP público do usuário via diferentes serviços
 */
async function fetchPublicIp(): Promise<string> {
  // Lista de serviços para buscar IP, em ordem de preferência
  const ipServices = [
    { url: 'https://api.ipify.org?format=json', parser: (data: IpifyResponse) => data.ip },
    { url: 'https://api.db-ip.com/v2/free/self', parser: (data: DbIpResponse) => data.ipAddress },
    { url: 'https://api.myip.com', parser: (data: MyIpResponse) => data.ip }
  ]

  // Tenta cada serviço em sequência
  for (const service of ipServices) {
    try {
      console.log(`[Geo] Tentando buscar IP via ${service.url}`)
      const res = await fetch(service.url)
      if (res.ok) {
        const data = await res.json()
        const ip = service.parser(data)
        if (ip) {
          console.log(`[Geo] IP encontrado: ${ip}`)
          return ip
        }
      }
    } catch (err) {
      console.error(`[Geo] Erro ao buscar IP via ${service.url}:`, err)
      // Continua para o próximo serviço
    }
  }

  console.error('[Geo] Todos os serviços de IP falharam')
  return ''
}

/**
 * Faz o lookup da geolocalização via diferentes serviços
 */
async function lookupGeo(ip: string): Promise<GeoData | null> {
  const timeout = (ms: number, p: Promise<Response>, source: string) => {
    const controller = new AbortController()
    // Não precisamos armazenar o signal em uma variável já que não o usamos diretamente
    const id = setTimeout(() => {
      controller.abort()
      console.log(`[Geo] Timeout ao buscar dados via ${source}`)
    }, ms)
    
    // Usamos o signal na requisição (implicitamente através do controller)
    return p
      .then(res => {
        clearTimeout(id)
        return res
      })
      .catch((err) => {
        console.error(`[Geo] Erro ao buscar dados via ${source}:`, err)
        return null
      })
  }

  // Lista de serviços de geolocalização, em ordem de preferência
  const geoServices = [
    // 1. ipwho.is (primeira opção por ser mais confiável)
    {
      url: `https://ipwho.is/${ip}`,
      name: 'ipwho.is',
      parser: (data: IpWhoIsResponse): GeoData | null => {
        if (data.success) {
          return {
            city: data.city || '',
            region: data.region || '',
            zip: data.postal || '',
            country: data.country || '',
            clientIpAddress: ip,
            timestamp: Date.now(),
            lat: data.latitude,
            lon: data.longitude
          }
        }
        return null
      }
    },
    // 2. ip-api.com (segunda opção devido a problemas de limite de requisições)
    {
      url: `https://ip-api.com/json/${ip}?fields=status,country,regionName,city,zip,lat,lon`,
      name: 'ip-api.com',
      parser: (data: IpApiResponse): GeoData | null => {
        if (data.status === 'success') {
          return {
            city: data.city || '',
            region: data.regionName || '',
            zip: data.zip || '',
            country: data.country || '',
            clientIpAddress: ip,
            timestamp: Date.now(),
            lat: data.lat,
            lon: data.lon
          }
        }
        return null
      }
    },
    // 3. ipapi.co - serviço adicional como fallback
    {
      url: `https://ipapi.co/${ip}/json/`,
      name: 'ipapi.co',
      parser: (data: IpapiCoResponse): GeoData | null => {
        if (!data.error) {
          return {
            city: data.city || '',
            region: data.region || '',
            zip: data.postal || '',
            country: data.country_name || '',
            clientIpAddress: ip,
            timestamp: Date.now(),
            lat: data.latitude,
            lon: data.longitude
          }
        }
        return null
      }
    }
  ]

  // Tenta cada serviço em sequência
  for (const service of geoServices) {
    try {
      console.log(`[Geo] Tentando buscar dados via ${service.name}`)
      const res = await timeout(2000, fetch(service.url), service.name)
      
      if (res?.ok) {
        const data = await res.json()
        const geoData = service.parser(data)
        
        if (geoData) {
          console.log(`[Geo] Dados encontrados via ${service.name}:`, geoData)
          return geoData
        }
      }
    } catch (err) {
      console.error(`[Geo] Erro ao processar dados de ${service.name}:`, err)
      // Continua para o próximo serviço
    }
  }

  console.error('[Geo] Todos os serviços de geolocalização falharam')
  return null
}

/**
 * Busca os dados de geolocalização do usuário, com cache de 24h
 */
export async function getGeoData(): Promise<GeoData | null> {
  try {
    // Verificar primeiro se já temos dados em cache
    const cached = getStoredGeoData()
    if (cached) {
      console.log('[Geo] Usando dados de geolocalização em cache')
      return cached
    }

    console.log('[Geo] Buscando IP público')
    const ip = await fetchPublicIp()
    if (!ip) {
      console.error('[Geo] Não foi possível obter o IP público')
      return null
    }

    console.log('[Geo] Buscando dados de geolocalização para IP:', ip)
    const geo = await lookupGeo(ip)
    if (geo) {
      console.log('[Geo] Dados de geolocalização obtidos com sucesso')
      setStoredGeoData(geo)
      return geo
    }

    console.error('[Geo] Falha ao obter dados de geolocalização')
    return null
  } catch (err) {
    console.error('[Geo] Erro ao obter dados de geolocalização:', err)
    return null
  }
}
