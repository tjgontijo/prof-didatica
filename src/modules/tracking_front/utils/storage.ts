import { UrlParams, GeoData } from '../types/tracking'

const URL_PARAMS_KEY    = 'tracking_urlParams'
const GEO_DATA_KEY      = 'tracking_geoData'
const EXTERNAL_ID_KEY   = 'tracking_externalId'

const URL_PARAMS_EXP_MS = 7 * 24 * 60 * 60 * 1000
const GEO_DATA_EXP_MS   = 24 * 60 * 60 * 1000

export function getStoredUrlParams(): UrlParams | null {
  const raw = localStorage.getItem(URL_PARAMS_KEY)
  if (!raw) return null
  try {
    const { data, timestamp } = JSON.parse(raw) as { data: UrlParams; timestamp: number }
    if (Date.now() - timestamp > URL_PARAMS_EXP_MS) {
      localStorage.removeItem(URL_PARAMS_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setStoredUrlParams(data: UrlParams): void {
  localStorage.setItem(URL_PARAMS_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

export function getStoredGeoData(): GeoData | null {
  const raw = localStorage.getItem(GEO_DATA_KEY)
  if (!raw) return null
  try {
    const { data, timestamp } = JSON.parse(raw) as { data: GeoData; timestamp: number }
    if (Date.now() - timestamp > GEO_DATA_EXP_MS) {
      localStorage.removeItem(GEO_DATA_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setStoredGeoData(data: GeoData): void {
  localStorage.setItem(GEO_DATA_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

export function getStoredExternalId(): string | null {
  return localStorage.getItem(EXTERNAL_ID_KEY)
}

export function setStoredExternalId(id: string): void {
  localStorage.setItem(EXTERNAL_ID_KEY, id)
}
