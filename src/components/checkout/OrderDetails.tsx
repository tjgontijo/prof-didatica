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
    const valorOrderBumps = orderBumpsSelecionados.reduce((total, bump) => 
      total + bump.price, 0
    );
    return valorProdutoPrincipal + valorOrderBumps;
  }, [produto.price, orderBumpsSelecionados]);

  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-gray-900 mb-3">
        Detalhes da compra
      </h2>

      <div className="space-y-3">
        {/* Produto Principal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{produto.nome}</span>
          <span className="font-medium text-gray-900">R$ {produto.price.toFixed(2)}</span>
        </div>

        {/* Order Bumps Selecionados */}
        {orderBumpsSelecionados.map((bump) => (
          <div key={bump.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{bump.nome}</span>
            <span className="font-medium text-gray-900">R$ {bump.price.toFixed(2)}</span>
          </div>
        ))}

        {/* Valor Total */}
        <div className="flex justify-between items-center pt-3 border-t text-sm">
          <span className="font-medium text-gray-900">Total</span>
          <span className="font-bold text-gray-900">R$ {valorTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;