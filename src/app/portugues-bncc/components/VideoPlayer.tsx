'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoContainerId?: string;
  buttonContainerId?: string;
  videoHtml?: string;
  buttonHtml?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoContainerId = 'video-container',
  buttonContainerId = 'player-button-container',
  videoHtml = '',
  buttonHtml = '',
}) => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Marcar o componente como montado para evitar problemas de hidratação
    setIsMounted(true);

    // Gerar um número aleatório de pessoas assistindo entre 15 e 45
    const randomViewers = Math.floor(Math.random() * 31) + 15;
    setViewerCount(randomViewers);
    
    // Criar um intervalo para alterar o número de pessoas assistindo
    const interval = setInterval(() => {
      // Gerar uma variação aleatória entre -2 e +2
      const variation = Math.floor(Math.random() * 5) - 2;
      
      // Atualizar o número de pessoas, mantendo entre 10 e 50
      setViewerCount(prevCount => {
        const newCount = prevCount + variation;
        return Math.max(10, Math.min(50, newCount));
      });
    }, 3000); // Atualiza a cada 3 segundos
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Só executar no cliente após a montagem do componente
    if (!isMounted) return;

    // Injetar o HTML do vídeo se fornecido
    if (videoHtml && videoContainerRef.current) {
      videoContainerRef.current.innerHTML = videoHtml;
    } else if (videoContainerRef.current) {
      // Inserir o iframe padrão se não for fornecido um HTML personalizado
      videoContainerRef.current.innerHTML = `
        <div style="position:relative;padding-top:56.25%;"><iframe id="vunel-fa2ef149-5378-4642-aa0b-d19d6eac2556" src="https://player-vz-3ca3f459-02f.tv.vunel.com.br/embed/?v=fa2ef149-5378-4642-aa0b-d19d6eac2556" style="border:none;position:absolute;top:0;left:0;" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture" allowfullscreen=true width="100%" height="100%" fetchpriority="high"></iframe></div>
      `;
    }

    // Injetar o HTML do botão se fornecido
    if (buttonHtml && buttonContainerRef.current) {
      buttonContainerRef.current.innerHTML = buttonHtml;
    }
  }, [videoHtml, buttonHtml, isMounted]);

  return (
    <>
      <div className="bg-yellow-400 text-black text-center py-2 px-4 mb-2 rounded-lg font-bold animate-pulse">
        <p className="text-sm md:text-base">ASSISTA ESTE VÍDEO AGORA, PODE SER REMOVIDO A QUALQUER MOMENTO!</p>
      </div>
      <div className="w-full aspect-video bg-black mb-6 rounded-lg overflow-hidden shadow-2xl border-4 border-yellow-500 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-lg blur-sm opacity-75 animate-pulse"></div>
        <div className="relative w-full h-full bg-black z-10">
          <div
            id={videoContainerId}
            ref={videoContainerRef}
            className="absolute inset-0"
          >
          </div>
        </div>
      </div>

      {/* Indicador de pessoas assistindo */}
      <div className="bg-gray-800 text-white text-center py-2 px-4 mb-6 rounded-lg flex items-center justify-center">
        <div className="flex -space-x-2 mr-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-red-500 border border-gray-800 flex items-center justify-center text-xs font-bold">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <div className="text-sm">
          <span className="text-green-400 font-bold">{viewerCount} pessoas</span> estão assistindo agora
        </div>
      </div>

      <div
        id={buttonContainerId}
        ref={buttonContainerRef}
        className="w-full flex justify-center mb-6"
      >
        {!buttonHtml && (
          <div className={`relative bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black text-md md:text-2xl font-black py-5 px-10 rounded-full shadow-2xl transform transition-all duration-300 cursor-pointer text-center`}>
            <div className="flex items-center justify-center">
              QUERO GARANTIR MEU ACESSO AGORA!
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VideoPlayer;
