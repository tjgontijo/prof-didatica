import React from 'react';

type PaymentSelectorProps = {
  selected: 'credit_card' | 'pix';
  onSelect: (method: 'credit_card' | 'pix') => void;
};

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ selected, onSelect }) => (
  <div className="flex gap-2 mb-4">
    {/* Cartão de crédito */}
    <button
      type="button"
      onClick={() => onSelect('credit_card')}
      className={`flex-1 flex items-center gap-2 px-4 py-3 border rounded-lg transition-all
        ${selected === 'credit_card'
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white'}
        hover:border-green-500`}
      aria-pressed={selected === 'credit_card'}
    >
      <svg width="22" height="16" viewBox="0 0 22 16" fill={selected === 'credit_card' ? '#22C55E' : '#6C757D'} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12.5C3 12.2239 3.22386 12 3.5 12H7.5C7.77614 12 8 12.2239 8 12.5C8 12.7761 7.77614 13 7.5 13H3.5C3.22386 13 3 12.7761 3 12.5Z" fillRule="evenodd" clipRule="evenodd"/>
        <path d="M0 2.5C0 1.11929 1.11929 0 2.5 0H17.5C18.8807 0 20 1.11929 20 2.5V13.5C20 14.8807 18.8807 16 17.5 16H2.5C1.11929 16 0 14.8807 0 13.5V2.5ZM1 7V13.5C1 14.3284 1.67157 15 2.5 15H17.5C18.3284 15 19 14.3284 19 13.5V7H1ZM19 4H1V2.5C1 1.67157 1.67157 1 2.5 1H17.5C18.3284 1 19 1.67157 19 2.5V4Z" fillRule="evenodd" clipRule="evenodd"/>
      </svg>
      <span className={`text-sm ${selected === 'credit_card' ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
        Cartão de crédito
      </span>
    </button>

    {/* PIX */}
    <button
      type="button"
      onClick={() => onSelect('pix')}
      className={`flex-1 flex items-center gap-2 px-4 py-3 border rounded-lg transition-all
        ${selected === 'pix'
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 bg-white'}
        hover:border-green-500`}
      aria-pressed={selected === 'pix'}
    >
      <svg width="23" height="22" viewBox="0 0 22 23" fill={selected === 'pix' ? '#22C55E' : '#32BCAD'} xmlns="http://www.w3.org/2000/svg">
        <path d="M5.19223 5.24323C6.06969 5.24323 6.89487 5.58498 7.51525 6.20516L10.8818 9.57225C11.1243 9.8147 11.5202 9.81575 11.7633 9.57193L15.1175 6.21736C15.738 5.59718 16.5632 5.25554 17.4407 5.25554H17.8447L13.5842 0.995107C12.2574 -0.331702 10.1063 -0.331702 8.77948 0.995107L4.53135 5.24323H5.19223ZM17.4406 17.108C16.5632 17.108 15.738 16.7664 15.1176 16.1462L11.7632 12.792C11.5278 12.5558 11.1173 12.5565 10.8819 12.792L7.51531 16.1585C6.89482 16.7786 6.06964 17.1202 5.19219 17.1202H4.5312L8.77943 21.3686C10.1062 22.6953 12.2574 22.6953 13.5842 21.3686L17.8447 17.108H17.4406ZM18.794 6.20484L21.3686 8.77947C22.6954 10.1062 22.6954 12.2573 21.3686 13.5842L18.7941 16.1587C18.7373 16.1359 18.6761 16.1218 18.6112 16.1218H17.4407C16.8354 16.1218 16.243 15.8764 15.8154 15.4484L12.4611 12.0945C11.8532 11.4859 10.7925 11.4862 10.184 12.0942L6.81744 15.4607C6.38976 15.8886 5.79746 16.134 5.19222 16.134H3.75286C3.69154 16.134 3.634 16.1486 3.57983 16.169L0.995108 13.5842C-0.331703 12.2573 -0.331703 10.1062 0.995108 8.77947L3.57994 6.19464C3.63411 6.21504 3.69154 6.22956 3.75286 6.22956H5.19222C5.79746 6.22956 6.38976 6.47496 6.81744 6.90285L10.1843 10.2697C10.4982 10.5833 10.9103 10.7404 11.3227 10.7404C11.7349 10.7404 12.1473 10.5833 12.4611 10.2694L15.8154 6.91505C16.243 6.48716 16.8354 6.24176 17.4407 6.24176H18.6112C18.676 6.24176 18.7373 6.22756 18.794 6.20484Z" fillRule="evenodd" clipRule="evenodd"/>
      </svg>
      <span className={`text-sm ${selected === 'pix' ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
        Pix
      </span>
    </button>
  </div>
);

export default PaymentSelector;