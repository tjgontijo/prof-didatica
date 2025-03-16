'use client';

import Script from 'next/script';

export default function OptimizedScripts() {
  return (
    <>
      {/* Scripts não essenciais carregados com estratégia de carregamento otimizada */}
      <Script
        id="analytics-script"
        strategy="lazyOnload"
        src="/scripts/analytics.js"
      />
      
      {/* Outros scripts não essenciais */}
      <Script
        id="third-party-widgets"
        strategy="lazyOnload"
        src="/scripts/widgets.js"
      />
    </>
  );
}
