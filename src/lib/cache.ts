interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxSize = 1000 // Máximo de entradas

  // Limpar cache expirado a cada 10 minutos
  constructor() {
    setInterval(() => {
      this.cleanup()
    }, 10 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    // Se cache está cheio, remover entradas mais antigas
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// Instância singleton do cache
export const cache = new MemoryCache()

// Função helper para cache com função de fetch
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Tentar buscar do cache primeiro
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Se não está no cache, buscar dados
  const data = await fetchFn()
  
  // Salvar no cache
  cache.set(key, data, ttlSeconds)
  
  return data
}

// Função para invalidar cache por padrão
export function invalidateCache(pattern: string): number {
  let count = 0
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      count++
    }
  }
  return count
}

// Cache específico para produtos (mais usado)
export async function getCachedProduct(productId: string) {
  return getCachedData(
    `product:${productId}`,
    async () => {
      const { prisma } = await import('@/lib/prisma')
      return prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          isActive: true,
          description: true
        }
      })
    },
    600 // 10 minutos para produtos
  )
}

// Cache para checkouts
export async function getCachedCheckout(checkoutId: string) {
  return getCachedData(
    `checkout:${checkoutId}`,
    async () => {
      const { prisma } = await import('@/lib/prisma')
      return prisma.checkout.findUnique({
        where: { id: checkoutId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              isActive: true
            }
          }
        }
      })
    },
    300 // 5 minutos para checkouts
  )
}
