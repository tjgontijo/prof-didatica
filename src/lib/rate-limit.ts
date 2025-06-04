import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Janela de tempo em ms
  maxRequests: number // Máximo de requests por janela
  keyGenerator?: (request: NextRequest) => string // Função para gerar chave única
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store em memória (para produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpar entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<{
    success: boolean
    limit: number
    remaining: number
    resetTime: number
    error?: string
  }> => {
    const now = Date.now()
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getDefaultKey(request)
    
    let entry = rateLimitStore.get(key)
    
    // Se não existe ou expirou, criar nova entrada
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    // Incrementar contador
    entry.count++
    rateLimitStore.set(key, entry)
    
    const remaining = Math.max(0, config.maxRequests - entry.count)
    
    if (entry.count > config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        error: 'Rate limit exceeded'
      }
    }
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining,
      resetTime: entry.resetTime
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  // Usar IP + User-Agent como chave padrão
  const ip = request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}

// Rate limiters pré-configurados
export const orderRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10, // 10 pedidos por 15 min
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `order:${ip}`
  }
})

export const paymentRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  maxRequests: 5, // 5 pagamentos por 5 min
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `payment:${ip}`
  }
})

export const webhookRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 100, // 100 webhooks por minuto (Mercado Pago pode enviar muitos)
  keyGenerator: (req) => {
    // Para webhooks, usar header específico se disponível
    const signature = req.headers.get('x-signature') || 'unknown'
    return `webhook:${signature.slice(0, 10)}`
  }
})
