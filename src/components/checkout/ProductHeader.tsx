'use client';

import React from 'react';
import Image from 'next/image';
import { ProdutoInfo } from './types';

type ProductHeaderProps = {
  produto: ProdutoInfo;
};

const ProductHeader: React.FC<ProductHeaderProps> = ({ produto }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 mb-4 border border-gray-100">
      <div className="w-16 h-16 relative flex-shrink-0">
        <Image
          src={produto.imagemUrl}
          alt={produto.nome}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex flex-col justify-center flex-1">
        <span className="text-base font-bold text-gray-900 leading-tight mb-1">{produto.nome}</span>
        <span className="text-lg font-bold text-[#1D3557]">R$ {produto.price.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ProductHeader;