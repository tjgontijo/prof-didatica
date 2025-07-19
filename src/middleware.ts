import { NextRequest, NextResponse } from 'next/server';
import { abTests } from './lib/abTest';
import { AbTestVariant } from './lib/abTest';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const activeTest = Object.values(abTests).find(
    test => pathname === `/${test.slug}`
  );
  
  if (!activeTest) return NextResponse.next();
  
  const variantCookie = request.cookies.get(activeTest.cookieName);
  
  if (variantCookie) {
    const variant = variantCookie.value as AbTestVariant;
    const variantPath = activeTest.variants[variant]?.path;
    
    if (variantPath) {
      // Criar nova URL para o redirecionamento
      const redirectUrl = new URL(variantPath, request.url);
      
      // Preservar todos os parâmetros de consulta (UTMs, etc)
      const searchParams = new URLSearchParams(request.nextUrl.search);
      searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });
      
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  const variant = assignVariant(activeTest.split);
  const visitorId = crypto.randomUUID();
  
  // Criar nova URL para o redirecionamento
  const redirectUrl = new URL(activeTest.variants[variant].path, request.url);
  
  // Preservar todos os parâmetros de consulta (UTMs, etc)
  const searchParams = new URLSearchParams(request.nextUrl.search);
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });
  
  const response = NextResponse.redirect(redirectUrl);
  
  // Capturar parâmetros UTM e fbclid da URL
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');
  const utmTerm = searchParams.get('utm_term');
  const fbclid = searchParams.get('fbclid');
  
  // Gerar sessionId único se não existir
  const sessionId = request.cookies.get('session_id')?.value || crypto.randomUUID();
  
  // Definir cookies para os parâmetros UTM (24 horas de expiração)
  if (utmSource) response.cookies.set('utm_source', utmSource, { maxAge: 60 * 60 * 24, path: '/' });
  if (utmMedium) response.cookies.set('utm_medium', utmMedium, { maxAge: 60 * 60 * 24, path: '/' });
  if (utmCampaign) response.cookies.set('utm_campaign', utmCampaign, { maxAge: 60 * 60 * 24, path: '/' });
  if (utmContent) response.cookies.set('utm_content', utmContent, { maxAge: 60 * 60 * 24, path: '/' });
  if (utmTerm) response.cookies.set('utm_term', utmTerm, { maxAge: 60 * 60 * 24, path: '/' });
  if (fbclid) response.cookies.set('fbclid', fbclid, { maxAge: 60 * 60 * 24, path: '/' });
  
  // Se tiver fbclid e não tiver utm_source, assume que veio do Facebook
  if (fbclid && !utmSource) {
    response.cookies.set('utm_source', 'facebook', { maxAge: 60 * 60 * 24, path: '/' });
    response.cookies.set('utm_medium', 'social', { maxAge: 60 * 60 * 24, path: '/' });
    response.cookies.set('utm_campaign', 'facebook_ads', { maxAge: 60 * 60 * 24, path: '/' });
  }
  
  // Definir cookie para sessionId
  response.cookies.set('session_id', sessionId, { maxAge: 60 * 60 * 24, path: '/' });
  
  response.cookies.set(activeTest.cookieName, variant, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  });
  
  response.cookies.set('visitor-id', visitorId, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/'
  });
  
  return response;
}

function assignVariant(split: Record<string, number>): AbTestVariant {
  const random = Math.random() * 100;
  let cumulativeProbability = 0;
  
  for (const [variant, probability] of Object.entries(split)) {
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      return variant as AbTestVariant;
    }
  }
  
  return Object.keys(split)[0] as AbTestVariant;
}

export const config = {
  matcher: [
    '/missao-literaria',
    '/desafio-literario',
  ]
};
