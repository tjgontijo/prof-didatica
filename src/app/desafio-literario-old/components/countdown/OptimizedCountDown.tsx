'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface OptimizedCountDownProps {
  estoqueInicial: number;
  estoqueTotal: number;
}

export default function OptimizedCountDown({
  estoqueInicial,
  estoqueTotal,
}: OptimizedCountDownProps) {
  // Memoize formato de tempo para evitar re-renders desnecessários
  const formatTempo = useMemo(() => {
    return (restante: number) => {
      const minutos = Math.floor(restante / 60);
      const segundos = restante % 60;
      return `${minutos.toString().padStart(2, '0')} : ${segundos.toString().padStart(2, '0')}`;
    };
  }, []);

  // Inicializa com valores
  const [state, setState] = useState({
    tempo: 20 * 60,
    estoque: estoqueInicial,
  });

  // Usar um único useEffect para todas as mudanças temporais
  useEffect(() => {
    // Timer para contagem regressiva
    const tempoInterval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        tempo: prev.tempo > 0 ? prev.tempo - 1 : 0,
      }));
    }, 1000);

    // Função para diminuir estoque (com throttling)
    let estoqueTimeout: NodeJS.Timeout;

    const diminuirEstoque = () => {
      if (state.estoque <= 2) return;

      setState((prev) => ({
        ...prev,
        estoque: Math.max(2, prev.estoque - 1),
      }));

      // Próxima redução em tempo aleatório
      const delay = Math.floor(Math.random() * 30000) + 15000; // Entre 15s e 45s
      estoqueTimeout = setTimeout(diminuirEstoque, delay);
    };

    // Iniciar timeout para estoque
    estoqueTimeout = setTimeout(diminuirEstoque, Math.floor(Math.random() * 30000) + 15000);

    // Cleanup
    return () => {
      clearInterval(tempoInterval);
      clearTimeout(estoqueTimeout);
    };
  }, [state.estoque]); // Dependência reduzida

  // Memoize progresso
  const progresso = useMemo(() => {
    return Math.max(0, Math.min(1, state.estoque / estoqueTotal)) * 100;
  }, [state.estoque, estoqueTotal]);

  return (
    <div className="rounded-lg bg-white p-4 mt-4 border border-[#a8dadc] w-full shadow-sm">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs text-[#1D3557]">Últimas</span>
        <span className="mx-1 bg-[#a8dadc]/60 text-[#1D3557] font-bold px-2 py-0.5 rounded-full text-base">
          {state.estoque}
        </span>
        <span className="text-xs text-[#1D3557]">unidades no valor promocional</span>
      </div>
      <div className="w-full h-2 bg-[#f1faee] rounded-full mb-4">
        <div
          className="h-2 rounded-full bg-[#457B9D] transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-[#457B9D] mb-1">Oferta acaba em</span>
        <span className="font-bold text-lg text-[#1D3557] tracking-widest">
          {formatTempo(state.tempo)}
        </span>
      </div>
    </div>
  );
}
