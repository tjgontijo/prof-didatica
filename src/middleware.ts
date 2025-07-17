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
  ]
};
