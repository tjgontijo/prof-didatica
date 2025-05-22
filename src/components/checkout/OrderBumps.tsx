'use client';

import React from 'react';
import Image from 'next/image';
import { OrderBump } from './types';

type OrderBumpsProps = {
  orderBumps: OrderBump[];
  onToggleOrderBump: (id: string) => void;
};

const OrderBumps: React.FC<OrderBumpsProps> = ({ orderBumps, onToggleOrderBump }) => {
  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-gray-900 mb-3">Aproveite e compre junto:</h2>

      <div className="space-y-3">
        {orderBumps.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 transition-all duration-200 ${
              item.selecionado ? 'border-green-500 bg-[#F8FCF8]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex gap-3">
              <div className="w-[50px] h-[50px] relative flex-shrink-0">
                <Image src={item.imagemUrl} alt={item.nome} fill className="object-cover rounded" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{item.nome}</h4>
                <p className="text-xs text-gray-600 mb-1">{item.descricao}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-xs line-through text-gray-500">
                      R$ {item.initialPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      R$ {item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">-50%</div>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.selecionado}
                  onChange={() => onToggleOrderBump(item.id)}
                  className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-xs text-gray-600">Adicionar produto</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBumps;
