import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Dados de exemplo para localização
const locations = [
  { country: 'Brasil', state: 'São Paulo', city: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { country: 'Brasil', state: 'Rio de Janeiro', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { country: 'Brasil', state: 'Minas Gerais', city: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
  { country: 'Brasil', state: 'Bahia', city: 'Salvador', lat: -12.9714, lng: -38.5014 },
  { country: 'Brasil', state: 'Rio Grande do Sul', city: 'Porto Alegre', lat: -30.0346, lng: -51.2177 },
  { country: 'Estados Unidos', state: 'Califórnia', city: 'São Francisco', lat: 37.7749, lng: -122.4194 },
  { country: 'Portugal', state: 'Lisboa', city: 'Lisboa', lat: 38.7223, lng: -9.1393 },
];

// Dados de exemplo para UTM do Meta Ads
const metaAdsCampaigns = [
  { name: '[PL] AD0021 - 20250314-01', id: '120216697447390370' },
  { name: '[PL] AD0021 - 20250314-02', id: '120216697447390377' },
  { name: '[PL] AD0022 - 20250315-01', id: '120216697447390380' },
  { name: '[PL] PROMO - 20250316-01', id: '120216697447390390' },
];

const metaAdsAdsets = [
  { name: '[PL] AD0021 - 20250314-01', id: '120216697447400370' },
  { name: '[PL] AD0021 - 20250314-02', id: '120216697447400377' },
  { name: '[PL] AD0022 - 20250315-01', id: '120216697447400380' },
  { name: '[PL] PROMO - 20250316-01', id: '120216697447400390' },
];

const metaAdsAds = [
  { name: '[PL] AD0021 - 20250314-01', id: '120216697447360370' },
  { name: '[PL] AD0021 - 20250314-02', id: '120216697447360377' },
  { name: '[PL] AD0022 - 20250315-01', id: '120216697447360380' },
  { name: '[PL] PROMO - 20250316-01', id: '120216697447360390' },
];

const metaPlacements = [
  'Facebook_Feed',
  'Facebook_Stories',
  'Instagram_Feed',
  'Instagram_Stories',
  'Instagram_Reels',
  'Audience_Network',
];

// Função para gerar UTM do Meta Ads
const generateMetaUtm = (includeOrganic = false) => {
  // 20% de chance de ser tráfego orgânico
  if (includeOrganic && Math.random() < 0.2) {
    return {
      source: 'google',
      medium: 'organic',
      campaign: null,
      content: null,
      term: null,
    };
  }

  const campaign = metaAdsCampaigns[Math.floor(Math.random() * metaAdsCampaigns.length)];
  const adset = metaAdsAdsets[Math.floor(Math.random() * metaAdsAdsets.length)];
  const ad = metaAdsAds[Math.floor(Math.random() * metaAdsAds.length)];
  const placement = metaPlacements[Math.floor(Math.random() * metaPlacements.length)];

  return {
    source: 'FB',
    campaign: `${campaign.name}|${campaign.id}`,
    medium: `${adset.name}|${adset.id}`,
    content: `${ad.name}|${ad.id}`,
    term: placement,
  };
};

// Rota para criar dados de teste no banco de dados
export async function GET() {
  try {
    // Verificar se já existem testes
    const existingTests = await prisma.abTest.count();
    
    if (existingTests > 0) {
      return NextResponse.json({
        message: 'Dados de teste já existem no banco de dados',
        count: existingTests
      });
    }
    
    // Criar teste A/B para projeto literário
    const test = await prisma.abTest.create({
      data: {
        testId: 'projeto-literario',
        name: 'Projeto Literário',
        description: 'Teste A/B para a página do projeto literário',
        variants: {
          create: [
            {
              variantId: 'A',
              name: 'Variante A',
              weight: 0.5,
            },
            {
              variantId: 'B',
              name: 'Variante B',
              weight: 0.5,
            }
          ]
        }
      },
      include: {
        variants: true
      }
    });
    
    // Criar eventos de exemplo com dados de localização e UTM
    const events = [];
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Função para gerar uma data aleatória entre duas datas
    const getRandomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    // Criar 100 eventos aleatórios
    for (let i = 0; i < 100; i++) {
      const sessionId = uuidv4();
      const variant = test.variants[Math.floor(Math.random() * test.variants.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const eventDate = getRandomDate(oneWeekAgo, now);
      
      // Gerar dados de UTM no formato do Meta Ads
      const utm = generateMetaUtm(true);
      
      // Criar pageview
      events.push({
        testId: test.id,
        variantId: variant.id,
        eventType: 'pageview',
        sessionId,
        eventTime: eventDate,
        url: `/projeto-literario-${variant.variantId.toLowerCase()}`,
        // Dados de localização
        country: location.country,
        state: location.state,
        city: location.city,
        latitude: location.lat,
        longitude: location.lng,
        // Dados de UTM
        utmSource: utm.source,
        utmMedium: utm.medium,
        utmCampaign: utm.campaign,
        utmContent: utm.content,
        utmTerm: utm.term,
      });
      
      // Adicionar conversão com 30% de chance
      if (Math.random() < 0.3) {
        const conversionDate = new Date(eventDate);
        conversionDate.setMinutes(conversionDate.getMinutes() + Math.floor(Math.random() * 30));
        
        events.push({
          testId: test.id,
          variantId: variant.id,
          eventType: 'initiateCheckout',
          sessionId,
          eventTime: conversionDate,
          url: `/projeto-literario-${variant.variantId.toLowerCase()}/checkout`,
          // Dados de localização (mesmos do pageview)
          country: location.country,
          state: location.state,
          city: location.city,
          latitude: location.lat,
          longitude: location.lng,
          // Dados de UTM (mesmos do pageview)
          utmSource: utm.source,
          utmMedium: utm.medium,
          utmCampaign: utm.campaign,
          utmContent: utm.content,
          utmTerm: utm.term,
        });
      }
    }
    
    // Criar eventos em lote
    await prisma.abEvent.createMany({
      data: events
    });
    
    return NextResponse.json({
      message: 'Dados de teste criados com sucesso',
      test,
      eventsCreated: events.length
    });
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
}
