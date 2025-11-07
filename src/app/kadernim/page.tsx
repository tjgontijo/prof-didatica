'use client';

import Script from 'next/script';
import { useState } from 'react';

import TimedUpsellPlayer from '@/components/player/TimedUpsellPlayer';

type UpsellAction = {
  label: string;
  url: string;
};

type UpsellVideo = {
  src: string;
  title: string;
  unlockAtSecond: number;
  poster?: string;
};

type UpsellContent = {
  headline: string;
  subheadline: string;
  video: UpsellVideo;
  accept: UpsellAction;
  decline: UpsellAction;
  highlights: string[];
};

const upsellContent: UpsellContent = {
  headline: 'Sua compra ainda não foi finalizada',
  subheadline:
    'Assista ao vídeo abaixo parasaber mais...',
  video: {
    src: '/videos/vsl_01_desfocada_hb.mp4',
    title: 'Assista e libere o upgrade completo do Kadernim',
    unlockAtSecond: 140
  },
  accept: {
    label: 'Quero aproveitar agora',
    url: 'https://profdidatica.mycartpanda.com/ex-ocu/next-offer/zbVPGz42m4?accepted=yes'
  },
  decline: {
    label: 'Prefiro continuar sem o upgrade',
    url: 'https://profdidatica.mycartpanda.com/ex-ocu/next-offer/zbVPGz42m4?accepted=no'
  },
  highlights: []
};

export default function KadernimUpsellPage() {
  const { headline, subheadline, video, accept, decline } = upsellContent;
  const [isOfferUnlocked, setIsOfferUnlocked] = useState(false);

  return (
    <>
      <Script
        src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/js/libs/ocu-external.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && typeof (window as typeof window & { OcuExternal?: new () => unknown }).OcuExternal === 'function') {
            // eslint-disable-next-line new-cap
            new (window as typeof window & { OcuExternal: new () => unknown }).OcuExternal();
          }
        }}
      />

      <Script id="cartpanda-ocu-init" strategy="afterInteractive">
        {`
          (function initOcuExternal(){
            if (typeof window === 'undefined') {
              return;
            }

            if (typeof window.OcuExternal === 'function') {
              // eslint-disable-next-line new-cap
              new window.OcuExternal();
            } else {
              setTimeout(initOcuExternal, 200);
            }
          })();
        `}
      </Script>

      <main className="min-h-screen bg-neutral-50 py-12">
        <section className="px-4 md:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                {headline}
              </h1>
              <p className="mt-4 text-lg text-neutral-600">{subheadline}</p>
            </header>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="overflow-hidden rounded-2xl bg-neutral-900 shadow-xl">
                  <TimedUpsellPlayer
                    className="bg-black"
                    src={video.src}
                    title={video.title}
                    unlockAtSecond={video.unlockAtSecond}
                    aspectRatio="9 / 16"
                    onUnlock={() => setIsOfferUnlocked(true)}
                  />
                </div>

                {isOfferUnlocked && (
                  <div className="relative z-50 mt-12 pointer-events-auto">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg md:p-8">
                      <h3 className="text-xl font-semibold text-neutral-900">
                        Oferta especial desbloqueada
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600">
                        Condições válidas apenas nesta página e por tempo limitado.
                      </p>

                      <div className="mt-6">
                        <div className="text-[13px] font-medium uppercase tracking-wide text-neutral-500">
                          Assinatura
                        </div>
                        <div className="mt-1 text-3xl font-bold text-neutral-900">
                          R$ 14,90 <span className="align-baseline text-base font-semibold text-neutral-500">/mês</span>
                        </div>
                        <div className="text-sm text-neutral-500">em 12 parcelas</div>

                        <div className="mt-4 border-t border-neutral-200 pt-4 text-neutral-700">
                          <span className="font-medium">Ou</span> R$ 147,00 à vista
                        </div>
                      </div>

                      <a
                        href={accept.url}
                        className="pointer-events-auto cursor-pointer mt-6 block w-full rounded-xl bg-emerald-500 px-6 py-4 text-center text-lg font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                      >
                        {accept.label}
                      </a>

                      <a
                        href={decline.url}
                        className="pointer-events-auto cursor-pointer mt-3 block text-center text-sm font-medium text-neutral-500 underline decoration-dashed underline-offset-4 transition hover:text-neutral-700"
                      >
                        {decline.label}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
