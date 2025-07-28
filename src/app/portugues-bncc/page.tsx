import React from 'react';
import { Metadata } from 'next';
import VideoPlayer from './components/VideoPlayer';

export const metadata: Metadata = {
  title: 'ATIVIDADES português 1° AO 5° ANO (BNCC) | Material Completo',
  description: 'Material completo de atividades de português para alunos do 1° ao 5° ano alinhadas com a BNCC.',
};

export default function UpsellPortugues() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-1 flex flex-col items-center py-6 px-4 md:px-8 lg:px-16 bg-black text-white">
        <div className="w-full max-w-4xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              <span className="text-yellow-400">ATIVIDADES DE PORTUGUÊS</span> PARA ALUNOS DO 1° AO 5° ANO
              <br />
              <span className="text-red-500">ALINHADAS COM A BNCC</span> PRONTAS PARA IMPRIMIR!
            </h1>
          </div>

          {/* Video Container */}
          <VideoPlayer
            videoContainerId="video-container"
            buttonContainerId="player-button-container"
          />
          
          {/* Texto de uma linha */}
          <p className="text-center text-xl my-6">
            Material completo com mais de 150 atividades prontas para impressão!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black py-4 text-center text-sm text-gray-400">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <p className="mt-1 text-xs opacity-75">Material exclusivo para professores e educadores</p>
        </div>
      </footer>
    </div>
  );
}
