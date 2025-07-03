import { UrlParams, GeoData } from '../types/tracking'

// Chaves para armazenamento no localStorage
const URL_PARAMS_KEY    = 'tracking_urlParams'
const GEO_DATA_KEY      = 'tracking_geoData'
const EXTERNAL_ID_KEY   = 'tracking_externalId'
const SESSION_ID_KEY    = 'tracking_sessionId'
const SESSION_TIMESTAMP_KEY = 'tracking_sessionTimestamp'

// Tempos de expiração em milissegundos
const URL_PARAMS_EXP_MS = 7 * 24 * 60 * 60 * 1000  // 7 dias
const GEO_DATA_EXP_MS   = 24 * 60 * 60 * 1000      // 24 horas
const SESSION_EXP_MS    = 30 * 60 * 1000           // 30 minutos

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

/**
 * Armazena o ID externo (ID de usuário) no localStorage
 */
export function setStoredExternalId(id: string): void {
  localStorage.setItem(EXTERNAL_ID_KEY, id)
}

/**
 * Verifica se a sessão atual expirou
 * Uma sessão expira após 30 minutos de inatividade
 */
export function hasSessionExpired(): boolean {
  if (typeof window === 'undefined') return true

  try {
    const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY)
    if (!timestamp) return true

    const lastActivity = parseInt(timestamp, 10)
    const now = Date.now()
    
    return now - lastActivity > SESSION_EXP_MS
  } catch {
    return true
  }
}

/**
 * Obtém o ID da sessão atual armazenado no localStorage
 */
export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY)
}

/**
 * Armazena o ID da sessão no localStorage
 */
export function setStoredSessionId(id: string): void {
  localStorage.setItem(SESSION_ID_KEY, id)
}

/**
 * Atualiza o timestamp da sessão atual
 */
export function updateSessionTimestamp(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // Falha silenciosa em caso de erro
  }
}
