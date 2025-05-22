'use client';

import React from 'react';
import { FaLock } from 'react-icons/fa';

// Tipos para os dados do cartão de crédito
interface DadosCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
  parcelas: number;
}

interface FormularioCartaoProps {
  dadosCartao: DadosCartao;
  handleChangeCartao: (campo: keyof DadosCartao, valor: string | number) => void;
  valorTotal: number;
  formatarNumeroCartao: (valor: string) => string;
  formatarValidade: (valor: string) => string;
}

const FormularioCartao: React.FC<FormularioCartaoProps> = ({
  dadosCartao,
  handleChangeCartao,
  valorTotal,
  formatarNumeroCartao,
  formatarValidade,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="numero-cartao" className="block text-gray-700 mb-1 text-sm font-medium">
            Número do cartão
          </label>
          <input
            type="text"
            id="numero-cartao"
            value={dadosCartao.numero}
            onChange={(e) => handleChangeCartao('numero', formatarNumeroCartao(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
            placeholder="0000 0000 0000 0000"
            maxLength={19}
          />
        </div>

        <div>
          <label htmlFor="nome-cartao" className="block text-gray-700 mb-1 text-sm font-medium">
            Nome impresso no cartão
          </label>
          <input
            type="text"
            id="nome-cartao"
            value={dadosCartao.nome}
            onChange={(e) => handleChangeCartao('nome', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
            placeholder="NOME COMO ESTÁ NO CARTÃO"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="validade-cartao"
              className="block text-gray-700 mb-1 text-sm font-medium"
            >
              Validade (MM/AA)
            </label>
            <input
              type="text"
              id="validade-cartao"
              value={dadosCartao.validade}
              onChange={(e) => handleChangeCartao('validade', formatarValidade(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
              placeholder="MM/AA"
              maxLength={5}
            />
          </div>

          <div>
            <label htmlFor="cvv-cartao" className="block text-gray-700 mb-1 text-sm font-medium">
              Código de segurança (CVV)
            </label>
            <input
              type="text"
              id="cvv-cartao"
              value={dadosCartao.cvv}
              onChange={(e) => handleChangeCartao('cvv', e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <label htmlFor="parcelas" className="block text-gray-700 mb-1 text-sm font-medium">
            Parcelas
          </label>
          <select
            id="parcelas"
            value={dadosCartao.parcelas}
            onChange={(e) => handleChangeCartao('parcelas', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
          >
            <option value={1}>1x de R$ {valorTotal.toFixed(2)} sem juros</option>
            <option value={2}>2x de R$ {(valorTotal / 2).toFixed(2)} sem juros</option>
            <option value={3}>3x de R$ {(valorTotal / 3).toFixed(2)} sem juros</option>
            <option value={4}>4x de R$ {(valorTotal / 4).toFixed(2)} sem juros</option>
            <option value={5}>5x de R$ {(valorTotal / 5).toFixed(2)} sem juros</option>
            <option value={6}>6x de R$ {(valorTotal / 6).toFixed(2)} sem juros</option>
            <option value={7}>7x de R$ {(valorTotal / 7).toFixed(2)} sem juros</option>
            <option value={8}>8x de R$ {(valorTotal / 8).toFixed(2)} sem juros</option>
            <option value={9}>9x de R$ {(valorTotal / 9).toFixed(2)} sem juros</option>
            <option value={10}>10x de R$ {(valorTotal / 10).toFixed(2)} sem juros</option>
            <option value={11}>11x de R$ {(valorTotal / 11).toFixed(2)} sem juros</option>
            <option value={12}>12x de R$ {(valorTotal / 12).toFixed(2)} sem juros</option>
          </select>
        </div>

        <p className="text-xs text-gray-500 flex items-center mt-2">
          <FaLock className="mr-1" /> Seus dados estão seguros e criptografados
        </p>
      </div>
    </div>
  );
};

export default FormularioCartao;
