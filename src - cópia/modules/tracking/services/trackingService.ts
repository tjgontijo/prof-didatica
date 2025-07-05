import { TrackingData } from '../types/tracking'
import { getUrlParams } from '../utils/urlParams'
import { getOrCreateSessionId } from '../utils/externalId'
import { getClientUserAgent } from '../utils/userAgent'
import { getGeoData } from '../utils/geoLocation'
import {
  getStoredUrlParams,
  setStoredUrlParams,
  getStoredGeoData,
  setStoredGeoData,
  updateSessionTimestamp
} from '../utils/storage'

export async function buildTrackingData(): Promise<TrackingData> {
  // Atualiza o timestamp da sessão sempre que construir dados de tracking
  updateSessionTimestamp()
  
  // Obter parâmetros de URL
  let urlParams = getStoredUrlParams()
  if (!urlParams) {
    urlParams = getUrlParams()
    setStoredUrlParams(urlParams)
  }

  // Obter dados de geolocalização
  let geoData = getStoredGeoData()
  if (!geoData) {
    try {
      const fetched = await getGeoData()
      geoData = fetched ?? {
        city: '',
        region: '',
        zip: '',
        country: '',
        clientIpAddress: '',
        timestamp: Date.now()
      }
      setStoredGeoData(geoData)
    } catch {
      geoData = {
        city: '',
        region: '',
        zip: '',
        country: '',
        clientIpAddress: '',
        timestamp: Date.now()
      }
    }
  }

  const sessionId = getOrCreateSessionId()
  const clientUserAgent = getClientUserAgent()

  let zip = geoData.zip
  if (zip && typeof zip === 'string') {
    zip = zip.replace(/[^0-9]/g, '').substring(0, 5)
  }

  const trackingData = {
    sessionId,
    userAgent: clientUserAgent,
    ...urlParams,
    ...geoData,
    zip,
    landingPage: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString()
  }

  return trackingData
}
