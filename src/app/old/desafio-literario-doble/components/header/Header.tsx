"use client";

import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

export default function Header() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Função para alternar o estado do tooltip no mobile
  const toggleTooltip = () => {
    setIsTooltipOpen(prev => !prev);
  };

  return (
    <header className="w-full bg-[#2c4f71] h-[70px] md:h-auto flex items-center justify-center">
      <div className="container max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <Image
            src="/images/system/logo_transparent.webp"
            alt="Prof Didática"
            width={65}
            height={65}
            priority
            className="h-auto w-auto max-h-[65px] md:max-h-[65px]"
          />
        </div>

        <TooltipProvider>
          <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
            <TooltipTrigger asChild>
              <button
                className="flex items-center text-white hover:text-emerald-300 transition-colors"
                onClick={toggleTooltip}
              >
                <svg 
                  fill="#ffffff" 
                  height="20" 
                  width="20" 
                  version="1.1" 
                  viewBox="0 0 229.5 229.5" 
                  className="mr-1"
                  xmlns="http://www.w3.org/2000/svg" 
                  xmlnsXlink="http://www.w3.org/1999/xlink" 
                  stroke="#ffffff"
                >
                  <g>
                    <path d="M214.419,32.12c-0.412-2.959-2.541-5.393-5.419-6.193L116.76,0.275c-1.315-0.366-2.704-0.366-4.02,0L20.5,25.927 c-2.878,0.8-5.007,3.233-5.419,6.193c-0.535,3.847-12.74,94.743,18.565,139.961c31.268,45.164,77.395,56.738,79.343,57.209 c0.579,0.14,1.169,0.209,1.761,0.209s1.182-0.07,1.761-0.209c1.949-0.471,48.076-12.045,79.343-57.209 C227.159,126.864,214.954,35.968,214.419,32.12z M174.233,85.186l-62.917,62.917c-1.464,1.464-3.384,2.197-5.303,2.197 s-3.839-0.732-5.303-2.197l-38.901-38.901c-1.407-1.406-2.197-3.314-2.197-5.303s0.791-3.897,2.197-5.303l7.724-7.724 c2.929-2.928,7.678-2.929,10.606,0l25.874,25.874l49.89-49.891c1.406-1.407,3.314-2.197,5.303-2.197s3.897,0.79,5.303,2.197 l7.724,7.724C177.162,77.508,177.162,82.257,174.233,85.186z"></path>
                  </g>
                </svg>
                <span className="text-sm hidden md:inline">Site Seguro</span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-white text-[#1D3557] border border-[#457B9D] shadow-lg p-3 max-w-[250px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="font-medium">Seus dados estão protegidos</p>
              </div>
              <p className="text-xs">Navegação 100% segura com certificado SSL. Seus dados pessoais e pagamentos são criptografados.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
