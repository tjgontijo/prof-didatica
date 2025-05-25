'use client';

import React from 'react';
import Image from 'next/image';
import { OrderBump } from './types';

type OrderBumpsProps = {
  orderBumps: OrderBump[];
  onToggleOrderBump: (id: string) => void;
};

const OrderBumps: React.FC<OrderBumpsProps> = ({ orderBumps, onToggleOrderBump }) => {
  // Estado para controlar qual item está sendo processado
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // Função para lidar com o toggle do order bump
  const handleToggle = async (id: string) => {
    try {
      setLoadingId(id);
      await onToggleOrderBump(id);
    } finally {
      setLoadingId(null);
    }
  };

  // Ordenar os order bumps pelo displayOrder (se existir)
  const sortedOrderBumps = React.useMemo(() => {
    return [...orderBumps].sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [orderBumps]);

  return (
    <div className="mb-6">
      <div className="space-y-3">
        {sortedOrderBumps.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum item adicional disponível no momento.
          </p>
        ) : (
          sortedOrderBumps.map((item) => {
            // Validar dados obrigatórios
            if (item.initialPrice === undefined || item.specialPrice === undefined) {
              console.warn(`OrderBump ${item.id} está com preços inválidos`, item);
              return null;
            }
            // Usar o preço especial do order bump
            const precoEspecial = item.specialPrice;

            // Calcular o percentual de desconto
            const desconto =
              item.percentDesconto ||
              Math.round(((item.initialPrice - precoEspecial) / item.initialPrice) * 100);

            // Calcular o valor economizado
            const economia = item.initialPrice - precoEspecial;

            return (
              <div
                key={item.id}
                className={`rounded-[6px] border transition-all duration-200 ${
                  item.selecionado ? 'border-[#00A859] bg-[#F8FCF8]' : 'border-[#DDD] bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className="w-[60px] h-[60px] relative flex-shrink-0">
                      <Image
                        src={item.imagemUrl}
                        alt={item.nome}
                        fill
                        sizes="60px"
                        className="object-cover rounded-[4px]"
                      />
                    </div>

                    <div className="flex-1 text-left">
                      <h4 className="text-[14px] font-bold text-[#333] mb-1">{item.nome}</h4>
                      <p className="text-[12px] text-[#666] mb-2">{item.descricao}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] line-through text-[#999]">
                              R$ {item.initialPrice.toFixed(2)}
                            </span>
                            <span className="text-[14px] font-bold text-[#1D3557]">
                              R$ {precoEspecial.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#00A859] mt-1">
                            Economia de R$ {economia.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-emerald-400 text-white text-[10px] font-bold px-2 py-1 rounded-[4px]">
                          {desconto}% OFF
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-[#EEE] bg-emerald-200 rounded-b-[6px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.selecionado}
                      onChange={() => handleToggle(item.id)}
                      disabled={loadingId === item.id}
                      className="h-4 w-4 text-[#00A859] border-[#DDD] rounded focus:ring-[#00A859]"
                    />
                    <span className="text-[14px] font-medium text-[#333] flex items-center gap-2">
                      {loadingId === item.id ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-[#00A859]"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processando...
                        </>
                      ) : item.selecionado ? (
                        'Remover do pedido'
                      ) : (
                        'Adicionar ao pedido'
                      )}
                    </span>
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderBumps;
