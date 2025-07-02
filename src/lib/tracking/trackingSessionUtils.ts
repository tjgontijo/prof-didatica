// src/lib/tracking/trackingSessionUtils.ts
import { prisma } from '@/lib/prisma';
import { TrackingSession } from '@prisma/client';

/**
 * Interface para os dados de uma sessão de rastreamento
 */
interface TrackingSessionData {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  landingPage?: string | null;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  zip?: string | null;
  lat?: number | null;
  lon?: number | null;
  userAgent?: string | null;
}

/**
 * Cria ou atualiza uma sessão de rastreamento de forma segura
 * @param trackingId ID da sessão (obrigatório para upsert)
 * @param data Dados da sessão a serem atualizados
 * @returns A sessão criada ou atualizada
 */
export async function upsertTrackingSession(
  trackingId: string,
  data: TrackingSessionData
): Promise<TrackingSession> {
  // Verificar se o ID foi fornecido
  if (!trackingId) {
    throw new Error('ID da sessão de rastreamento é obrigatório para upsert');
  }

  // Realizar o upsert com o campo ID definido corretamente
  return await prisma.trackingSession.upsert({
    where: {
      id: trackingId // Campo único obrigatório
    },
    update: data,
    create: {
      id: trackingId,
      ...data
    }
  });
}

/**
 * Busca uma sessão de rastreamento pelo ID
 * @param trackingId ID da sessão
 * @returns A sessão encontrada ou null
 */
export async function findTrackingSessionById(
  trackingId: string
): Promise<TrackingSession | null> {
  if (!trackingId) return null;
  
  return await prisma.trackingSession.findUnique({
    where: {
      id: trackingId
    }
  });
}

/**
 * Busca uma sessão de rastreamento por IP e User Agent
 * @param ip Endereço IP
 * @param userAgent User Agent do navegador
 * @returns A sessão mais recente encontrada ou null
 */
export async function findTrackingSessionByIpAndUserAgent(
  ip?: string | null,
  userAgent?: string | null
): Promise<TrackingSession | null> {
  if (!ip && !userAgent) return null;
  
  const whereClause: Record<string, unknown> = {};
  
  if (ip) whereClause.ip = ip;
  if (userAgent) whereClause.userAgent = userAgent;
  
  // Buscar sessões criadas nas últimas 24 horas
  whereClause.createdAt = {
    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
  };
  
  return await prisma.trackingSession.findFirst({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
}
