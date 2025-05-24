'use client';

import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { FaWhatsapp } from 'react-icons/fa';
import { cleanPhone, formatBrazilianPhone } from '@/lib/phone';
import { WhatsappService } from '@/services/whatsapp.service';

// Schema de validação
const clienteSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Informe o nome completo (nome e sobrenome)',
    }),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().refine((val) => val.replace(/\D/g, '').length >= 11, {
    message: 'WhatsApp deve ter pelo menos 11 dígitos',
  }),
});

interface FormCustomerProps {
  initialData?: {
    nome: string;
    email: string;
    telefone: string;
  };
  onSave: (data: {
    nome: string;
    email: string;
    telefone: string;
    telefoneNormalizado: string;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
  requiredFields: Array<'nome' | 'email' | 'telefone'>;
}

const FormCustomer: React.FC<FormCustomerProps> = ({
  initialData = { nome: '', email: '', telefone: '' },
  onSave,
  onValidationChange,
  requiredFields,
}) => {
  // Referências para os campos do formulário
  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);

  // Estados do formulário
  const [dadosCliente, setDadosCliente] = useState(initialData);
  const [errosForm, setErrosForm] = useState<{
    nome?: string;
    email?: string;
    telefone?: string;
  }>({});
  const [whatsappValidado, setWhatsappValidado] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Instância do serviço de WhatsApp
  const whatsappService = React.useMemo(() => new WhatsappService(), []);

  // Efeito para verificar se o formulário está válido
  useEffect(() => {
    if (formTouched && onValidationChange) {
      const isValid = requiredFields.every(
        (field) => !errosForm[field] && dadosCliente[field]?.trim().length > 0,
      );
      onValidationChange(isValid);
    }
  }, [dadosCliente, errosForm, formTouched, onValidationChange, requiredFields]);

  // Função para validar um campo individual
  const validarCampo = async (campo: 'nome' | 'email' | 'telefone') => {
    setFormTouched(true);
    const validacao = clienteSchema.shape[campo].safeParse(dadosCliente[campo]);

    if (!validacao.success) {
      setErrosForm((prev) => ({
        ...prev,
        [campo]: validacao.error.errors[0].message,
      }));
      return false;
    }

    // Validação adicional para telefone: verificar se é um WhatsApp válido
    if (campo === 'telefone' && !whatsappValidado) {
      const cleaned = cleanPhone(dadosCliente.telefone);
      const whatsappResult = await whatsappService.checkWhatsappNumber(cleaned);

      if (!whatsappResult.isWhatsapp) {
        setErrosForm((prev) => ({
          ...prev,
          telefone: 'Este número não possui WhatsApp ativo',
        }));
        return false;
      }

      // Marca como validado para evitar validações repetidas
      setWhatsappValidado(true);
    }

    setErrosForm((prev) => ({ ...prev, [campo]: undefined }));
    return true;
  };

  // Função para salvar os dados quando um campo perde o foco
  const handleBlur = async (campo: 'nome' | 'email' | 'telefone') => {
    const isValid = await validarCampo(campo);
    if (isValid) {
      const normalizedPhone = cleanPhone(dadosCliente.telefone);
      onSave({
        ...dadosCliente,
        telefoneNormalizado: normalizedPhone,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-gray-800 mb-1 text-sm">
            Nome Completo *
          </label>
          <input
            ref={nomeRef}
            type="text"
            id="nome"
            value={dadosCliente.nome}
            onChange={(e) => setDadosCliente((prev) => ({ ...prev, nome: e.target.value }))}
            onBlur={() => handleBlur('nome')}
            className={`w-full h-12 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.nome ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Seu nome completo"
          />
          {errosForm.nome && <p className="text-red-500 text-xs mt-1">{errosForm.nome}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-800 mb-1 text-sm">
            E-mail *
          </label>
          <input
            ref={emailRef}
            type="email"
            id="email"
            value={dadosCliente.email}
            onChange={(e) => setDadosCliente((prev) => ({ ...prev, email: e.target.value }))}
            onBlur={() => handleBlur('email')}
            className={`w-full h-12 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="seu@email.com"
          />
          {errosForm.email && <p className="text-red-500 text-xs mt-1">{errosForm.email}</p>}
        </div>

        <div>
          <label htmlFor="telefone" className="block text-gray-800 mb-1 text-sm">
            WhatsApp *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaWhatsapp className={whatsappValidado ? 'text-green-600' : 'text-gray-400'} />
            </div>
            <input
              ref={telefoneRef}
              type="tel"
              id="telefone"
              value={dadosCliente.telefone}
              onChange={(e) => {
                if (whatsappValidado && e.target.value !== dadosCliente.telefone)
                  setWhatsappValidado(false);
                const valorFormatado = formatBrazilianPhone(e.target.value);
                setDadosCliente((prev) => ({ ...prev, telefone: valorFormatado }));
              }}
              onBlur={() => handleBlur('telefone')}
              className={`w-full h-12 pl-10 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.telefone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="(99) 99999-9999"
            />
          </div>
          {errosForm.telefone && <p className="text-red-500 text-xs mt-1">{errosForm.telefone}</p>}
        </div>
      </div>
    </div>
  );
};

export default FormCustomer;
