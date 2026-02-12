import React, { useEffect, useState } from 'react';

interface EstoqueECountdownProps {
  estoqueInicial: number;
  estoqueTotal: number;
} // Removi ofertaTerminaEm, pois o tempo é sempre 10 minutos

function formatTempo(restante: number) {
  const horas = Math.floor(restante / 3600);
  const minutos = Math.floor((restante % 3600) / 60);
  const segundos = restante % 60;
  return [horas, minutos, segundos].map((n) => n.toString().padStart(2, '0')).join(' : ');
}

const EstoqueECountdown: React.FC<EstoqueECountdownProps> = ({ estoqueInicial, estoqueTotal }) => {
  // Tempo inicial em segundos (10 minutos)
  const TEMPO_INICIAL = 10 * 60;
  const [tempoRestante, setTempoRestante] = useState(TEMPO_INICIAL);

  // Estado para o estoque, independente do tempo
  const [estoque, setEstoque] = useState(estoqueInicial);

  // Diminui o tempo
  useEffect(() => {
    if (tempoRestante === 0) return;
    const timer = setInterval(() => {
      setTempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [tempoRestante]);

  // Diminui o estoque em intervalos aleatórios
  useEffect(() => {
    if (estoque <= 2) return; // Para em 2 unidades
    const minDelay = 15000; // 15 segundos
    const maxDelay = 45000; // 45 segundos
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;

    const timer = setTimeout(() => {
      setEstoque((prev) => Math.max(2, prev - 1)); // Nunca menor que 2
    }, delay);

    return () => clearTimeout(timer);
  }, [estoque]);

  const progresso = Math.max(0, Math.min(1, estoque / estoqueTotal));

  return (
    <div className="rounded-lg bg-white p-4 mt-4 border border-[#a8dadc] w-full shadow-sm">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs text-[#1D3557]">Últimas</span>
        <span className="mx-1 bg-[#a8dadc]/60 text-[#1D3557] font-bold px-2 py-0.5 rounded-full text-base">
          {typeof estoque === 'number' && !isNaN(estoque) ? estoque : estoqueInicial}
        </span>
        <span className="text-xs text-[#1D3557]">unidades no valor promocional</span>
      </div>
      <div className="w-full h-2 bg-[#f1faee] rounded-full mb-4">
        <div
          className="h-2 rounded-full bg-[#457B9D] transition-all duration-500"
          style={{ width: `${progresso * 100}%` }}
        ></div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-[#457B9D] mb-1">Oferta acaba em</span>
        <span className="font-bold text-lg text-[#1D3557] tracking-widest">
          {formatTempo(tempoRestante)}
        </span>
      </div>
    </div>
  );
};

export default EstoqueECountdown;
