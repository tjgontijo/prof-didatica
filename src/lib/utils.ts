/**
 * Utilitários gerais para a aplicação
 */

/**
 * Gera um ID CUID simples
 * Baseado na implementação do CUID mas simplificado
 * @returns string CUID
 */
export function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const counter = (Math.floor(Math.random() * 1000)).toString(36);
  
  return `${timestamp}${random}${counter}`;
}

/**
 * Gera um ID de rastreamento usando CUID
 * @returns string ID de rastreamento
 */
export function generateTrackingId(): string {
  // Usar CUID puro para compatibilidade com o Prisma
  return generateCuid();
}
