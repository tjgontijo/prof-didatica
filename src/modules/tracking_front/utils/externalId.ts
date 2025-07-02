import cuid from 'cuid'

const EXTERNAL_ID_KEY = 'tracking_externalId'

export function getOrCreateExternalId(): string {
  if (typeof window === 'undefined') return ''

  try {
    const existing = localStorage.getItem(EXTERNAL_ID_KEY)
    if (existing) return existing

    const newId = cuid()
    localStorage.setItem(EXTERNAL_ID_KEY, newId)
    return newId
  } catch (e) {
    console.warn('Falha ao acessar localStorage para external_id:', e)
    return cuid()
  }
}
