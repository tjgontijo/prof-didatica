'use client';

import { FaChevronDown } from 'react-icons/fa';

interface FaqItemProps {
  question: string;
  answer: string;
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="border border-[#a8dadc] rounded-lg overflow-hidden">
      <details className="group">
        <summary className="flex items-center justify-between gap-3 p-4 bg-[#f8f9fa] cursor-pointer">
          <span className="font-medium text-[#1D3557] text-lg">{question}</span>
          <span className="transition-transform duration-300 group-open:rotate-180">
            <FaChevronDown className="h-5 w-5 text-[#457B9D]" />
          </span>
        </summary>
        <div className="p-4 bg-white">
          <p className="text-gray-800">{answer}</p>
        </div>
      </details>
    </div>
  );
}
