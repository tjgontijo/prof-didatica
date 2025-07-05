import logger from '@/lib/logger';

export interface WhatsappNumberResponse {
  number: string;
  isWhatsapp: boolean;
  name?: string;
}

interface MessageSendResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName: string;
  status: string;
  message: {
    conversation: string;
  };
  contextInfo: {
    forwardingScore?: number;
    isForwarded?: boolean;
    participant?: string;
    quotedMessage?: {
      conversation: string;
    };
    quotedParticipant?: string;
    quotedStatus?: string;
  };
  messageType: string;
  messageTimestamp: number;
  instanceId: string;
  source: string;
}

export class WhatsappService {
  private apiKey: string;
  private baseUrl: string;
  private instance: string;

  constructor() {
    this.apiKey = process.env.APIKEY_EVOLUTION as string;
    this.baseUrl = process.env.EVOLUTION_BASE_URL as string;
    this.instance = process.env.INSTANCE_EVOLUTION as string;
    
    // Verificar se as variáveis de ambiente estão definidas
    if (!this.apiKey) {
      logger.error('[WhatsApp] APIKEY_EVOLUTION não está definida no .env');
    }
    
    if (!this.baseUrl) {
      logger.error('[WhatsApp] EVOLUTION_BASE_URL não está definida no .env');
    }
    
    if (!this.instance) {
      logger.error('[WhatsApp] INSTANCE_EVOLUTION não está definida no .env');
    }
  }

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, '') + '/';
  }

  // Método público para normalizar números de telefone
  normalizePhoneNumber(phone: string): string {
    const cleanedPhone = phone.replace(/\D/g, '');

    if (/^55\d{10,11}$/.test(cleanedPhone)) {
      return cleanedPhone;
    }

    const phoneWithoutLeadingZero = cleanedPhone.replace(/^0/, '');

    if (/^\d{10,11}$/.test(phoneWithoutLeadingZero)) {
      return `55${phoneWithoutLeadingZero}`;
    }

    return cleanedPhone;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000,
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async checkWhatsappNumber(phone: string): Promise<WhatsappNumberResponse> {
    const normalizedPhone = this.normalizePhoneNumber(phone);

    try {
      const url = `${this.normalizeBaseUrl(this.baseUrl)}chat/whatsappNumbers/${this.instance}`;
      
      // Log das credenciais (parcialmente ocultas para segurança)
      const maskedApiKey = this.apiKey ? 
        `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 
        'não definida';
      
      logger.info(`[WhatsApp] Verificando número: ${normalizedPhone}`);
      logger.info(`[WhatsApp] URL: ${url}`);
      logger.info(`[WhatsApp] Instance: ${this.instance}`);
      logger.info(`[WhatsApp] API Key: ${maskedApiKey}`);

      const options = {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numbers: [normalizedPhone] }),
      };

      const response = await this.fetchWithTimeout(url, options);
      
      // Log da resposta HTTP
      logger.info(`[WhatsApp] Status da resposta: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Não foi possível ler o corpo da resposta');
        logger.error(`[WhatsApp] Erro na resposta: ${errorText}`);
        throw new Error(`Erro ao verificar número de WhatsApp: ${response.status} ${response.statusText}`);
      }

      const data: Array<{
        exists: boolean;
        jid: string;
        name?: string;
        number: string;
      }> = await response.json();
      
      logger.info(`[WhatsApp] Resposta recebida para ${normalizedPhone}: ${JSON.stringify(data)}`);

      const result = data.find((item) => item.number === normalizedPhone);

      if (!result) {
        logger.warn(`[WhatsApp] Número não encontrado na resposta: ${normalizedPhone}`);
        return {
          number: normalizedPhone,
          isWhatsapp: false,
        };
      }

      logger.info(`[WhatsApp] Número ${normalizedPhone} é WhatsApp: ${result.exists}`);
      return {
        number: result.number,
        isWhatsapp: result.exists,
        name: result.name,
      };
    } catch (error) {
      // Log detalhado do erro
      if (error instanceof Error) {
        logger.error(`[WhatsApp] Erro na verificação: ${error.message}`);
        logger.error(`[WhatsApp] Stack: ${error.stack}`);
      } else {
        logger.error(`[WhatsApp] Erro desconhecido na verificação: ${String(error)}`);
      }
      
      // Verifica problemas comuns de configuração
      if (!this.apiKey) {
        logger.error('[WhatsApp] API Key não está definida');
      }
      
      if (!this.baseUrl) {
        logger.error('[WhatsApp] URL base não está definida');
      }
      
      if (!this.instance) {
        logger.error('[WhatsApp] Instância não está definida');
      }
      
      return {
        number: normalizedPhone,
        isWhatsapp: false,
      };
    }
  }

  async sendTextMessage(
    phone: string,
    text: string,
    options: {
      delay?: number;
      quoted?: {
        key: {
          remoteJid: string;
          fromMe: boolean;
          id: string;
          participant?: string;
        };
        message: {
          conversation: string;
        };
      };
      linkPreview?: boolean;
      mentionsEveryOne?: boolean;
      mentioned?: string[];
    } = {},
  ): Promise<MessageSendResponse | null> {
    const normalizedPhone = this.normalizePhoneNumber(phone);

    try {
      const url = `${this.normalizeBaseUrl(this.baseUrl)}message/sendText/${this.instance}`;

      const requestOptions = {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: normalizedPhone,
          text: text,
          delay: options.delay,
          quoted: options.quoted,
          linkPreview: options.linkPreview,
          mentionsEveryOne: options.mentionsEveryOne,
          mentioned: options.mentioned,
        }),
      };

      const response = await this.fetchWithTimeout(url, requestOptions);

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem. Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      return null;
    }
  }
}

// Exportar uma instância singleton
export const whatsappService = new WhatsappService();
