'use client';

import React from 'react';
import { ProdutoInfo, OrderBump } from './types';

type OrderDetailsProps = {
  produto: ProdutoInfo;
  orderBumpsSelecionados: OrderBump[];
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ produto, orderBumpsSelecionados }) => {
  // Calcula o valor total somando o produto principal + order bumps selecionados
  const valorTotal = React.useMemo(() => {
    const valorProdutoPrincipal = produto.price;
    const valorOrderBumps = orderBumpsSelecionados.reduce((total, bump) => {
      return total + bump.specialPrice;
    }, 0);
    return valorProdutoPrincipal + valorOrderBumps;
  }, [produto.price, orderBumpsSelecionados]);

  return (
    <div className="mb-6">
      <h2 className="text-[16px] font-bold text-[#333] mb-3">Resumo da compra</h2>

      <div className="space-y-3 bg-[#F8F9FA] rounded-[6px] p-4">
        {/* Produto Principal */}
        <div className="flex justify-between items-center py-1">
          <span className="text-[14px] text-[#333] font-bold">{produto.nome}</span>
          <span className="text-[14px] font-bold text-[#333]">R$ {produto.price.toFixed(2)}</span>
        </div>

        {/* Order Bumps Selecionados */}
        {orderBumpsSelecionados.map((bump) => {
          const precoEspecial = bump.specialPrice;

          return (
            <div key={bump.id} className="flex justify-between items-center py-1">
              <div className="flex flex-col">
                <span className="text-[14px] text-[#333]">
                  {bump.nome.length > 35 ? `${bump.nome.substring(0, 35).trim()}...` : bump.nome}
                </span>
                {bump.initialPrice > precoEspecial && (
                  <span className="text-[10px] text-[#00A859]">
                    Economia de R$ {(bump.initialPrice - precoEspecial).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {bump.initialPrice > precoEspecial && (
                  <span className="text-[11px] line-through text-[#999]">
                    R$ {bump.initialPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-[14px] text-[#333]">R$ {precoEspecial.toFixed(2)}</span>
              </div>
            </div>
          );
        })}

        {/* Valor Total */}
        <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB] mt-2">
          <span className="text-[14px] font-bold text-[#333]">Total</span>
          <span className="text-[16px] font-bold text-[#00A859]">R$ {valorTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
