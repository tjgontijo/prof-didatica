'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { DadosCliente } from './types';

type FormularioClienteProps = {
  dadosCliente: DadosCliente;
  onChangeDados: (campo: keyof DadosCliente, valor: string) => void;
  erros?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
};

const FormularioCliente: React.FC<FormularioClienteProps> = ({ 
  dadosCliente, 
  onChangeDados,
  erros = {}
}) => {
  // Função para formatar o telefone
  const formatarTelefone = (valor: string): string => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    }
    if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-semibold text-[#1D3557] mb-4 border-b pb-2">
        Seus Dados
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-gray-700 mb-1 font-medium">
            Nome Completo *
          </label>
          <input
            type="text"
            id="nome"
            value={dadosCliente.nome}
            onChange={(e) => onChangeDados('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
            required
            placeholder="Digite seu nome completo"
          />
          {erros.nome && (
            <p className="text-red-500 text-sm mt-1">{erros.nome}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
            E-mail *
          </label>
          <input
            type="email"
            id="email"
            value={dadosCliente.email}
            onChange={(e) => onChangeDados('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
            required
            placeholder="exemplo@email.com"
          />
          {erros.email && (
            <p className="text-red-500 text-sm mt-1">{erros.email}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="telefone" className="block text-gray-700 mb-1 font-medium">
            WhatsApp *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaWhatsapp className="text-green-500" />
            </div>
            <input
              type="text"
              id="telefone"
              value={dadosCliente.telefone}
              onChange={(e) => onChangeDados('telefone', formatarTelefone(e.target.value))}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#457B9D] text-gray-800 bg-white"
              required
              placeholder="(00) 00000-0000"
            />
          </div>
          {erros.telefone ? (
            <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Você receberá o acesso pelo WhatsApp
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioCliente;
