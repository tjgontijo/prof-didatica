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
      <div className="w-[60px] h-[60px] relative flex-shrink-0">
        <Image
          src={produto.imagemUrl}
          alt={produto.nome}
          fill
          className="object-cover rounded-[4px]"
        />
      </div>
      <div className="flex flex-col justify-center flex-1 gap-1">
        <span className="text-[14px] font-bold text-[#333] leading-tight">
          {produto.nome}
        </span>
        {produto.descricao && (
          <span className="text-[12px] text-[#666]">{produto.descricao}</span>
        )}
        <span className="text-[16px] font-bold text-[#1D3557]">
          R$ {produto.price.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ProductHeader;
