import { NextRequest, NextResponse } from 'next/server';
import { WhatsappService } from '@/services/whatsapp/whatsapp.service';
import logger from '@/lib/logger';

// Cache para evitar chamadas repetidas à API
const phoneValidationCache: Record<string, { isValid: boolean; timestamp: number }> = {};

// Tempo de expiração do cache em milissegundos (1 hora)
const CACHE_EXPIRATION = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Extrair o número do corpo da requisição
    const body = await request.json();
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Número de telefone não fornecido' },
        { status: 400 }
      );
    }
    
    // Instanciar o serviço WhatsApp
    const whatsappService = new WhatsappService();

    const normalizedPhone = whatsappService.normalizePhoneNumber(phone);
    
    // Verificar cache
    const now = Date.now();
    const cachedResult = phoneValidationCache[normalizedPhone];
    
    if (cachedResult && now - cachedResult.timestamp < CACHE_EXPIRATION) {
      logger.info(`[WhatsApp API Usando resultado em cache para ${normalizedPhone}`);
      return NextResponse.json({
        number: normalizedPhone,
        isWhatsapp: cachedResult.isValid
      });
    }
    
    // Chamar o serviço para validar o número já normalizado
    const result = await whatsappService.checkWhatsappNumber(normalizedPhone);
    
    // Atualizar o cache
    phoneValidationCache[normalizedPhone] = {
      isValid: result.isWhatsapp,
      timestamp: now
    };
    
    // Retornar o resultado
    return NextResponse.json(result);
  } catch (error) {
    logger.error('[WhatsApp API] Erro ao validar número:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erro ao validar número: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno ao validar número' },
      { status: 500 }
    );
  }
}
