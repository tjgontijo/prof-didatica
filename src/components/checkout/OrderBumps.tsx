'use client';

import React, { useCallback, useMemo, memo } from 'react';
import Image from 'next/image';

type OrderBumpItemProps = {
  item: OrderBump;
  loadingId: string | null;
  onToggle: (id: string) => void;
};

type OrderBump = {
  id: string;
  specialPrice: number;
  initialPrice: number; // Preço original do produto
  imagemUrl: string;    // URL da imagem do produto
  selected: boolean;    // Estado de seleção no frontend
  percentDiscont?: number;
  displayOrder?: number | null;  
  name: string;         // Nome do produto associado
  description: string;  // Descrição do produto associado
};

// Componente de item individual memoizado para evitar re-renderizações desnecessárias
const OrderBumpItem = memo(({ item, loadingId, onToggle }: OrderBumpItemProps) => {
  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [onToggle, item.id]);

  // Validar dados obrigatórios
  if (item.initialPrice === undefined || item.specialPrice === undefined) {
    return null;
  }

  // Usar o preço especial do order bump
  const precoEspecial = item.specialPrice;

  // Calcular o percentual de desconto
  const desconto =
    item.percentDiscont ||
    Math.round(((item.initialPrice - precoEspecial) / item.initialPrice) * 100);

  // Calcular o valor economizado
  const economia = item.initialPrice - precoEspecial;

  return (
    <div
      className={`rounded-[6px] border transition-all duration-200 ${
        item.selected ? 'border-[#00A859] bg-[#F8FCF8]' : 'border-[#DDD] bg-white'
      }`}
    >
      <div className="p-5">
        <div className="flex gap-3">
          <div className="w-[90px] h-[90px] relative flex-shrink-0 flex items-center justify-center">
            <Image
              src={item.imagemUrl}
              alt={item.name}
              fill
              sizes="90px"
              className="object-contain rounded-[4px]"
            />
          </div>

          
          <div className="flex-1 text-left">  
            <h4 className="text-[14px] font-bold text-[#333] mb-1">{item.name}</h4>
            <span className="text-[10px] text-[#00A859] mt-1 text-right">
                  Economia de R$ {economia.toFixed(2)}
            </span>
            <p className="text-[12px] text-[#666] mb-2">{item.description}</p>
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
            checked={item.selected}
            onChange={handleToggle}
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
            ) : item.selected ? (
              'Remover do pedido'
            ) : (
              'Adicionar ao pedido'
            )}
          </span>
        </label>
      </div>
    </div>
  );
});

OrderBumpItem.displayName = 'OrderBumpItem';

type OrderBumpsProps = {
  orderBumps: OrderBump[];
  onToggleOrderBump: (id: string) => void;
};

const OrderBumps: React.FC<OrderBumpsProps> = ({ orderBumps, onToggleOrderBump }) => {
  // Estado para controlar qual item está sendo processado
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  // Função para lidar com o toggle do order bump
  const handleToggle = useCallback(
    async (id: string) => {
      try {
        setLoadingId(id);
        await onToggleOrderBump(id);
      } finally {
        setLoadingId(null);
      }
    },
    [onToggleOrderBump],
  );

  // Ordenar os order bumps pelo displayOrder (se existir)
  const sortedOrderBumps = useMemo(() => {
    return [...orderBumps].sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [orderBumps]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-3">Aproveite e Compre Junto</h3>
      <div className="mb-6">
        <div className="space-y-3">
          {sortedOrderBumps.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum item adicional disponível no momento.
            </p>
          ) : (
            sortedOrderBumps.map((item) => (
              <OrderBumpItem
                key={item.id}
                item={item}
                loadingId={loadingId}
                onToggle={handleToggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBumps;
