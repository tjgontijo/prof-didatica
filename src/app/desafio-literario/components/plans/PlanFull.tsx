'use client';

import { Check, Star, Gem, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CtaButton from '@/components/buttons/CtaButton';

// Usando os tipos definidos na página principal
interface PlanFullProps {
  planData: {
    originalPrice: number;
    promotionalPrice: number;
    discount: string;
    paymentLink: string;
  };
  bonusData: Array<{
    title: string;
    description: string;
    value: number;
    imagePath: string;
  }>;
  bonusValue: number;
}

// Componente de Countdown adaptado para a paleta de cores do Desafio Literário
function CountdownTimer() {
  // Tempo inicial em segundos (10 minutos)
  const TEMPO_INICIAL = 10 * 60;
  const [tempoRestante, setTempoRestante] = useState(TEMPO_INICIAL);

  // Estado para o estoque, independente do tempo
  const [estoque, setEstoque] = useState(5);
  const estoqueTotal = 10;

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

  // Formata o tempo restante em HH:MM:SS
  function formatTempo(restante: number) {
    const horas = Math.floor(restante / 3600);
    const minutos = Math.floor((restante % 3600) / 60);
    const segundos = restante % 60;
    return [horas, minutos, segundos].map((n) => n.toString().padStart(2, '0')).join(' : ');
  }

  return (
    <div className="rounded-lg bg-white p-4 mt-8 mb-8 border border-emerald-200 w-full shadow-sm">
      <div className="flex items-center justify-center mb-2">
        <span className="text-xs text-emerald-800">Últimas</span>
        <span className="mx-1 bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-base">
          {typeof estoque === 'number' && !isNaN(estoque) ? estoque : 5}
        </span>
        <span className="text-xs text-emerald-800">unidades no valor promocional</span>
      </div>
      <div className="w-full h-2 bg-emerald-50 rounded-full mb-4">
        <div
          className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${progresso * 100}%` }}
        ></div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-emerald-700 mb-1 flex items-center">
          <Clock className="mr-1" /> Oferta acaba em
        </span>
        <span className="font-bold text-lg text-emerald-800 tracking-widest">
          {formatTempo(tempoRestante)}
        </span>
      </div>
    </div>
  );
}

export default function PlanFull({ planData, bonusData, bonusValue }: PlanFullProps) {
  const savings = planData.originalPrice - planData.promotionalPrice;
  return (
    <section id="plan-full" className="py-16 bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-2 max-w-3xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-emerald-600 transform transition-all hover:shadow-2xl">

          {/* Cabeçalho com gradiente */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-white font-bold py-1 px-4 transform rotate-45 translate-x-8 translate-y-3 shadow-md">
              MAIS VENDIDO
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gem className="text-yellow-300" />
              <h3 className="text-2xl md:text-3xl font-bold text-center">Plano Completo</h3>
            </div>
            <p className="text-center opacity-90 mt-2">Acesso a todos os recursos + bônus que valem R$ {bonusValue}</p>
          </div>

          <div className="p-4">
            {/* Layout de coluna única */}
            <div className="flex flex-col items-center">
              {/* Imagem centralizada */}

              {/* Conteúdo em coluna única */}
              <div className="w-full text-center">
                {/* O que está incluído */}
                <div className="mb-8">

                  <h4 className="font-bold text-emerald-800 mb-3 flex items-center max-w-md mx-auto text-left">
                    <span className="inline-block w-2 h-6 bg-emerald-700 mr-2"></span>
                    O que está incluído:
                  </h4>
                  <ul className="space-y-3 max-w-md mx-auto text-left">
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>20 fichas literárias</strong> para estimular a leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>3 modelos de Leiturômetro</strong> para gamificação</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Tabela em PDF</strong> para controle de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Planilha do Google</strong> para controle de leitura</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Guia de aplicação em sala</strong> passo a passo</span>
                    </li>
                    <li className="flex items-start p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-600"><strong>Acesso vitalício</strong> e atualizações do material.</span>
                    </li>

                    {/* Bônus com destaque especial */}
                    <li className="mt-2 border-t border-emerald-100 pt-4">
                      <p className="font-bold text-emerald-800 mb-2 flex items-center">
                        <Gem className="text-yellow-500 mr-2" /> Bônus Exclusivos:
                      </p>
                      <ul className="space-y-3">
                        {bonusData.map((bonus, index) => (
                          <li key={index} className="flex items-start p-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                            <Check className="text-emerald-600 mt-1 mr-3 flex-shrink-0" />
                            <div className="flex flex-col w-full">
                              <span className="text-gray-600 text-md"><strong>{bonus.title}</strong></span>
                              <div className="flex items-center gap-2 mt-1 justify-end">
                                <span className="text-xs text-gray-500 line-through decoration-red-600 decoration-1">R$ {bonus.value}</span>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Grátis</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </div>

                {/* Preço com destaque - Design elegante */}
                <div className="mb-8 relative">
                  {/* Badge de desconto */}
                  <div className="absolute -top-3 right-0 bg-yellow-500 text-white font-bold py-1 px-3 rounded-full shadow-sm z-10">
                    <div className="flex items-center gap-1">
                      <Star className="text-white text-xs" />
                      <span className="text-sm">{planData.discount}</span>
                    </div>
                  </div>

                  {/* Container principal */}
                  <div className="bg-white p-6 rounded-lg border border-emerald-200 shadow-sm">
                    <div className="flex flex-col items-center">
                      {/* Preço original */}
                      <div className="mb-1">
                        <span className="text-lg font-medium text-gray-500 line-through decoration-red-500 decoration-2">De R$ {planData.originalPrice}</span>
                      </div>

                      {/* Preço promocional */}
                      <div className="flex items-start justify-center">
                        <span className="text-emerald-800 text-xl mt-1 mr-1">R$</span>
                        <span className="text-5xl font-bold text-emerald-800">{planData.promotionalPrice}</span>
                      </div>

                      {/* Texto adicional */}
                      <p className="text-emerald-700 font-bold text-sm mt-2 uppercase tracking-wide">Você economiza R$ {savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-gray-600 text-sm mt-1">Acesso imediato no E-mail</p>

                    </div>
                  </div>
                </div>

                {/* Botão de compra */}
                <CtaButton
                  paymentLink={planData.paymentLink}
                  text="QUERO O PLANO COMPLETO"
                  className="!bg-emerald-700 hover:!bg-emerald-800 !py-6"
                />

                {/* Countdown Timer */}
                <CountdownTimer />


                {/* Informações de segurança - imagem única */}
                <div className="mt-4 flex justify-center">
                  <Image
                    src="/images/system/compra-segura.png"
                    alt="Compra Segura"
                    width={250}
                    height={50}
                    style={{ width: '250px', height: 'auto', opacity: 0.6 }}
                    className="max-w-[250px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-8"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
