'use client';

import React from 'react';
import Image from 'next/image';
import { ProdutoInfo } from './types';

type ProductHeaderProps = {
  produto: ProdutoInfo;
};

const ProductHeader: React.FC<ProductHeaderProps> = ({ produto }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[100px] h-[100px] relative flex-shrink-0 flex items-center justify-center">
        <Image
          src={produto.imagemUrl}
          alt={produto.name}
          fill
          sizes="100px"
          className="object-contain rounded-[4px]"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 gap-1">
        <span className="text-[14px] font-bold text-[#333] leading-tight">{produto.name}</span>
        {produto.description && (
          <span className="text-[12px] text-[#666]">{produto.description}</span>
        )}
        <span className="text-[16px] font-bold text-[#1D3557]">R$ {produto.price.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ProductHeader;
