import { prisma } from '@/lib/prisma';
import { FunnelData, FunnelFilters, FunnelStage } from '@/types/dashboard';
import dashboardCache from '@/lib/dashboardCache';

export class FunnelService {
  /**
   * Obtém os dados do funil de conversão
   */
  async getFunnelData(filters?: FunnelFilters): Promise<FunnelData> {
    // Verifica se há dados em cache
    const cachedData = dashboardCache.getCachedFunnel(filters);
    if (cachedData) {
      return cachedData;
    }

    // Define o período de análise
    const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

    // Parâmetros para as consultas SQL
    const queryParams = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      productId: filters?.productId || null,
      utmSource: filters?.utmSource || null,
      utmMedium: filters?.utmMedium || null,
      utmCampaign: filters?.utmCampaign || null
    };

    // Obtém os estágios do funil
    const stages = await this.getFunnelStages(queryParams);

    // Calcula a taxa de conversão geral (do primeiro ao último estágio)
    const firstStageValue = stages[0]?.value || 0;
    const lastStageValue = stages[stages.length - 1]?.value || 0;
    const overallConversionRate = firstStageValue > 0 ? (lastStageValue / firstStageValue) * 100 : 0;

    // Monta o objeto de resposta
    const funnelData: FunnelData = {
      stages,
      overallConversionRate
    };

    // Armazena em cache
    dashboardCache.cacheFunnel(funnelData, filters);

    return funnelData;
  }

  /**
   * Obtém os estágios do funil de conversão
   */
  private async getFunnelStages(params: {
    startDate: string;
    endDate: string;
    productId: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  }): Promise<FunnelStage[]> {
    // Construção das condições de filtro para as consultas SQL
    const productFilter = params.productId ? `AND o."productId" = '${params.productId}'` : '';
    const utmSourceFilter = params.utmSource ? `AND ts."utmSource" = '${params.utmSource}'` : '';
    const utmMediumFilter = params.utmMedium ? `AND ts."utmMedium" = '${params.utmMedium}'` : '';
    const utmCampaignFilter = params.utmCampaign ? `AND ts."utmCampaign" = '${params.utmCampaign}'` : '';
    
    // Consulta para contar visualizações de página (primeiro estágio)
    const pageViewsResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT ts."sessionId") as count
      FROM "TrackingSession" ts
      LEFT JOIN "TrackingEvent" te ON te."trackingSessionId" = ts.id
      WHERE ts."createdAt" >= ${params.startDate}::timestamp
        AND ts."createdAt" <= ${params.endDate}::timestamp
        AND te."eventName" = 'page_view'
        ${Prisma.raw(utmSourceFilter)}
        ${Prisma.raw(utmMediumFilter)}
        ${Prisma.raw(utmCampaignFilter)}
    `;
    const pageViews = parseInt(pageViewsResult[0]?.count.toString() || '0');

    // Consulta para contar interações com o checkout (segundo estágio)
    const checkoutInteractionsResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT ts."sessionId") as count
      FROM "TrackingSession" ts
      LEFT JOIN "TrackingEvent" te ON te."trackingSessionId" = ts.id
      WHERE ts."createdAt" >= ${params.startDate}::timestamp
        AND ts."createdAt" <= ${params.endDate}::timestamp
        AND te."eventName" = 'checkout_interaction'
        ${Prisma.raw(utmSourceFilter)}
        ${Prisma.raw(utmMediumFilter)}
        ${Prisma.raw(utmCampaignFilter)}
    `;
    const checkoutInteractions = parseInt(checkoutInteractionsResult[0]?.count.toString() || '0');

    // Consulta para contar adições de informações de pagamento (terceiro estágio)
    const paymentInfoResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT ts."sessionId") as count
      FROM "TrackingSession" ts
      LEFT JOIN "TrackingEvent" te ON te."trackingSessionId" = ts.id
      WHERE ts."createdAt" >= ${params.startDate}::timestamp
        AND ts."createdAt" <= ${params.endDate}::timestamp
        AND te."eventName" = 'add_payment_info'
        ${Prisma.raw(utmSourceFilter)}
        ${Prisma.raw(utmMediumFilter)}
        ${Prisma.raw(utmCampaignFilter)}
    `;
    const paymentInfo = parseInt(paymentInfoResult[0]?.count.toString() || '0');

    // Consulta para contar compras finalizadas (quarto estágio)
    const purchasesResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT o.id) as count
      FROM "Order" o
      LEFT JOIN "TrackingSession" ts ON o."trackingSessionId" = ts.id
      WHERE o."createdAt" >= ${params.startDate}::timestamp
        AND o."createdAt" <= ${params.endDate}::timestamp
        AND o."status" = 'PAID'
        AND o."deletedAt" IS NULL
        ${Prisma.raw(productFilter)}
        ${Prisma.raw(utmSourceFilter)}
        ${Prisma.raw(utmMediumFilter)}
        ${Prisma.raw(utmCampaignFilter)}
    `;
    const purchases = parseInt(purchasesResult[0]?.count.toString() || '0');

    // Calcula as taxas de conversão entre estágios
    const checkoutConversionRate = pageViews > 0 ? (checkoutInteractions / pageViews) * 100 : 0;
    const paymentInfoConversionRate = checkoutInteractions > 0 ? (paymentInfo / checkoutInteractions) * 100 : 0;
    const purchaseConversionRate = paymentInfo > 0 ? (purchases / paymentInfo) * 100 : 0;

    // Monta o array de estágios do funil
    return [
      {
        name: 'Visualização da Página',
        value: pageViews
      },
      {
        name: 'Interação com Checkout',
        value: checkoutInteractions,
        conversionRate: checkoutConversionRate
      },
      {
        name: 'Informações de Pagamento',
        value: paymentInfo,
        conversionRate: paymentInfoConversionRate
      },
      {
        name: 'Compra Finalizada',
        value: purchases,
        conversionRate: purchaseConversionRate
      }
    ];
  }

  /**
   * Obtém as taxas de conversão entre estágios
   */
  async getConversionRates(filters?: FunnelFilters): Promise<Record<string, number>> {
    const funnelData = await this.getFunnelData(filters);
    
    // Extrai as taxas de conversão de cada estágio
    const conversionRates: Record<string, number> = {};
    funnelData.stages.forEach((stage, index) => {
      if (index > 0) {
        conversionRates[`${funnelData.stages[index - 1].name} -> ${stage.name}`] = stage.conversionRate || 0;
      }
    });
    
    // Adiciona a taxa de conversão geral
    conversionRates['Geral'] = funnelData.overallConversionRate;
    
    return conversionRates;
  }

  /**
   * Obtém o funil filtrado por UTM ou produto/campanha
   */
  async getFunnelByUtm(utmSource: string, filters?: FunnelFilters): Promise<FunnelData> {
    return this.getFunnelData({
      ...filters,
      utmSource
    });
  }
}

// Exporta uma instância única do serviço
const funnelService = new FunnelService();
export default funnelService;