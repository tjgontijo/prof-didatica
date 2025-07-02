import { TrackingData } from '../types/tracking'
import { getUrlParams } from '../utils/urlParams'
import { getOrCreateExternalId } from '../utils/externalId'
import { getClientUserAgent } from '../utils/userAgent'
import { getGeoData } from '../utils/geoLocation'
import {
  getStoredUrlParams,
  setStoredUrlParams,
  getStoredGeoData,
  setStoredGeoData
} from '../utils/storage'

export async function buildTrackingData(): Promise<TrackingData> {
  console.log('[Meta Pixel] buildTrackingData - Iniciando construção dos dados de tracking')
  
  // Obter parâmetros de URL
  let urlParams = getStoredUrlParams()
  if (!urlParams) {
    console.log('[Meta Pixel] buildTrackingData - Parâmetros de URL não encontrados no armazenamento, obtendo novos')
    urlParams = getUrlParams()
    setStoredUrlParams(urlParams)
  } else {
    console.log('[Meta Pixel] buildTrackingData - Usando parâmetros de URL do armazenamento')
  }
  console.log('[Meta Pixel] buildTrackingData - Parâmetros de URL:', urlParams)

  // Obter dados de geolocalização
  let geoData = getStoredGeoData()
  if (!geoData) {
    console.log('[Meta Pixel] buildTrackingData - Dados de geolocalização não encontrados, buscando novos')
    try {
      const fetched = await getGeoData()
      geoData = fetched ?? {
        ct: '',
        st: '',
        zp: '',
        country: '',
        client_ip_address: '',
        timestamp: Date.now()
      }
      setStoredGeoData(geoData)
    } catch (error) {
      console.error('[Meta Pixel] buildTrackingData - Erro ao obter dados de geolocalização:', error)
      geoData = {
        ct: '',
        st: '',
        zp: '',
        country: '',
        client_ip_address: '',
        timestamp: Date.now()
      }
    }
  } else {
    console.log('[Meta Pixel] buildTrackingData - Usando dados de geolocalização do armazenamento')
  }
  console.log('[Meta Pixel] buildTrackingData - Dados de geolocalização:', geoData)

  // Obter ID externo e user agent
  const externalId = getOrCreateExternalId()
  console.log('[Meta Pixel] buildTrackingData - ID externo:', externalId)
  
  const clientUserAgent = getClientUserAgent()
  console.log('[Meta Pixel] buildTrackingData - User agent:', clientUserAgent)

  const trackingData = {
    urlParams,
    geoData,
    clientUserAgent,
    externalId,
    timestamp: new Date().toISOString()
  }
  
  console.log('[Meta Pixel] buildTrackingData - Dados de tracking construídos com sucesso')
  return trackingData
}
