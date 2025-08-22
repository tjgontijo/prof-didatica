"use client";

import Script from 'next/script';

export default function ProjetoMissaoLiterariaPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-[#f1faee] pt-16 md:pt-24">
      {/* Scripts de performance para o player de vídeo */}
      <Script
        id="vturb-preload-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);`
        }}
      />

      {/* VTurb Player */}
      <section className="w-full max-w-2xl mx-auto px-4 mb-8 flex flex-col items-center">
        <div className="w-full">
          {/* Container do player VTurb */}
          <div
            className="rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: `<vturb-smartplayer id="vid-68a8ddd5bebeb7dd804da09b" style="display: block; margin: 0 auto; width: 100%; max-width: 720px; border-radius: 8px; overflow: hidden;"></vturb-smartplayer>`
            }}
          />
          
          {/* Script do VTurb */}
          <Script
            id="vturb-player-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var s=document.createElement("script"); s.src="https://scripts.converteai.net/1eb34a82-3ae7-47c1-aa35-02f2cc9b474e/players/68a8ddd5bebeb7dd804da09b/v4/player.js", s.async=!0,document.head.appendChild(s);`
            }}
          /> 
        </div>
      </section>      
     
      {/* Footer */}
      <footer className="w-full py-2 bg-gray-100 text-center text-[10px] text-gray-500 border-t">
        &copy; {new Date().getFullYear()} Prof Didática. Todos os direitos reservados.
      </footer>
    </main>
  );
}
