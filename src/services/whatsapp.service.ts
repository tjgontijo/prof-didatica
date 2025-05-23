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
    this.apiKey = process.env.APIKEY_EVOLUTION || 'B37B2EA91D67-4F2C-8F69-4EC2A35A5D4E';
    this.baseUrl = process.env.EVOLUTION_BASE_URL || 'https://evolution.elev8.com.br/';
    this.instance = process.env.INSTANCE_EVOLUTION || 'Thiago';
  }

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/+$/, '') + '/';
  }

  private normalizePhoneNumber(phone: string): string {
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
    timeout = 10000
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

      const options = {
        method: 'POST',
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numbers: [normalizedPhone] }),
      };

      const response = await this.fetchWithTimeout(url, options);

      if (!response.ok) {
        throw new Error('Erro ao verificar número de WhatsApp');
      }

      const data: Array<{
        exists: boolean;
        jid: string;
        name?: string;
        number: string;
      }> = await response.json();

      const result = data.find((item) => item.number === normalizedPhone);

      if (!result) {
        return {
          number: normalizedPhone,
          isWhatsapp: false,
        };
      }

      return {
        number: result.number,
        isWhatsapp: result.exists,
        name: result.name,
      };
    } catch (error) {
      logger.error('Erro na verificação de WhatsApp:', error);
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
    } = {}
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
