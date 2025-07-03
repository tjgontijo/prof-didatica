import cuid from 'cuid'
import { getStoredExternalId, setStoredExternalId, getStoredSessionId, setStoredSessionId, hasSessionExpired, updateSessionTimestamp } from './storage'

/**
 * Obtém ou cria um ID externo (ID de usuário) persistente
 * Este ID permanece o mesmo para o usuário em todas as sessões
 */
export function getOrCreateExternalId(): string {
  if (typeof window === 'undefined') return ''

  try {
    // Verifica se já existe um ID externo armazenado
    const existing = getStoredExternalId()
    if (existing) return existing

    // Cria um novo ID externo se não existir
    const newId = cuid()
    setStoredExternalId(newId)
    return newId
  } catch {
    // Em caso de erro, retorna um novo ID sem armazenar
    return cuid()
  }
}

/**
 * Obtém ou cria um ID de sessão
 * Uma nova sessão é criada se a anterior expirou (30 minutos de inatividade)
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''

  try {
    // Se a sessão não expirou, retorna o ID existente
    if (!hasSessionExpired()) {
      const existingId = getStoredSessionId()
      if (existingId) {
        updateSessionTimestamp()
        return existingId
      }
    }

    // Cria uma nova sessão
    const newSessionId = cuid()
    setStoredSessionId(newSessionId)
    updateSessionTimestamp()
    
    return newSessionId
  } catch {
    // Em caso de erro, retorna um novo ID sem armazenar
    return cuid()
  }
}
