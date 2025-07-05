'use client';

import React from 'react';
import PixDisplay from './PixDisplay';
import { PixData } from './getPixData';

interface ThanksClientComponentProps {
  pixData: PixData;
  transactionId: string;
}

export default function ThanksClientComponent({ pixData }: ThanksClientComponentProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-[#333]">
      <main className="container mx-auto py-6 px-4 max-w-[600px]">
        <PixDisplay pixData={pixData} />
      </main>
    </div>
  );
}
