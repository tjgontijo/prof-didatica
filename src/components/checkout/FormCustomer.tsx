'use client';

import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { FaWhatsapp } from 'react-icons/fa';
import { cleanPhone, formatBrazilianPhone } from '@/lib/phone';
import { WhatsappService } from '@/services/whatsapp/whatsapp.service';

// Schema de validação
const clienteSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Informe o nome completo (nome e sobrenome)',
    }),
  customerEmail: z.string().email('E-mail inválido'),
  customerPhone: z.string().refine((val) => val.replace(/\D/g, '').length >= 11, {
    message: 'WhatsApp deve ter pelo menos 11 dígitos',
  }),
});

interface FormCustomerProps {
  initialData?: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSave: (data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    phoneNormalized: string;
  }) => void;
  onValidationChange?: (isValid: boolean) => void;
  requiredFields: Array<'customerName' | 'customerEmail' | 'customerPhone'>;
}

const FormCustomer: React.FC<FormCustomerProps> = ({
  initialData = { customerName: '', customerEmail: '', customerPhone: '' },
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

  // Ref para armazenar os valores atuais e evitar dependências cíclicas no useEffect
  const dadosClienteRef = useRef(dadosCliente);
  dadosClienteRef.current = dadosCliente;

  // Efeito para atualizar os dados do cliente apenas quando initialData mudar significativamente
  // Isso evita que os dados digitados sejam perdidos durante a digitação
  useEffect(() => {
    // Só atualiza campos vazios quando initialData tiver valores não vazios
    const current = dadosClienteRef.current;

    if (
      (current.customerName === '' && initialData.customerName !== '') ||
      (current.customerEmail === '' && initialData.customerEmail !== '') ||
      (current.customerPhone === '' && initialData.customerPhone !== '')
    ) {
      setDadosCliente((prev) => {
        const newData = { ...prev };

        // Atualiza apenas campos vazios
        if (prev.customerName === '' && initialData.customerName !== '') {
          newData.customerName = initialData.customerName;
        }

        if (prev.customerEmail === '' && initialData.customerEmail !== '') {
          newData.customerEmail = initialData.customerEmail;
        }

        if (prev.customerPhone === '' && initialData.customerPhone !== '') {
          newData.customerPhone = initialData.customerPhone;
        }

        return newData;
      });
    }
  }, [initialData]); // Usamos apenas initialData como dependência
  const [errosForm, setErrosForm] = useState<{
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }>({});
  const [whatsappValidado, setWhatsappValidado] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Instância do serviço de WhatsApp
  const whatsappService = React.useMemo(() => new WhatsappService(), []);

  // Efeito apenas para notificar o componente pai sobre a validade do formulário
  useEffect(() => {
    if (formTouched && onValidationChange) {
      const isValid = requiredFields.every(
        (field) => !errosForm[field] && dadosCliente[field]?.trim().length > 0,
      );
      onValidationChange(isValid);
    }
  }, [dadosCliente, errosForm, formTouched, onValidationChange, requiredFields]);

  // Função para verificar se todos os campos obrigatórios estão válidos
  const verificarFormularioValido = () => {
    return requiredFields.every(
      (field) => !errosForm[field] && dadosCliente[field]?.trim().length > 0,
    );
  };

  // Função para validar um campo individual
  const validarCampo = async (campo: 'customerName' | 'customerEmail' | 'customerPhone') => {
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
    if (campo === 'customerPhone' && !whatsappValidado) {
      const cleaned = cleanPhone(dadosCliente.customerPhone);
      const whatsappResult = await whatsappService.checkWhatsappNumber(cleaned);

      if (!whatsappResult.isWhatsapp) {
        setErrosForm((prev) => ({
          ...prev,
          customerPhone: 'Este número não possui WhatsApp ativo',
        }));
        return false;
      }

      // Marca como validado para evitar validações repetidas
      setWhatsappValidado(true);
    }

    setErrosForm((prev) => ({ ...prev, [campo]: undefined }));
    return true;
  };

  // Função para validar um campo quando ele perde o foco e salvar se todos os campos estiverem válidos
  const handleBlur = async (campo: 'customerName' | 'customerEmail' | 'customerPhone') => {
    // Validar o campo atual
    const campoValido = await validarCampo(campo);
    console.log(`[FormCustomer] handleBlur para campo: ${campo}, valido?`, campoValido, dadosCliente);

    // Verificar se todos os campos obrigatórios estão válidos
    if (campoValido && verificarFormularioValido()) {
      console.log('[FormCustomer] Todos os campos obrigatórios válidos! Chamando onSave com:', dadosCliente);
      // Se todos os campos obrigatórios estiverem válidos, salvar os dados
      const normalizedPhone = cleanPhone(dadosCliente.customerPhone);
      onSave({
        ...dadosCliente,
        phoneNormalized: normalizedPhone,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg mb-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-gray-800 mb-1 text-sm">
            Nome Completo *
          </label>
          <input
            ref={nomeRef}
            type="text"
            id="customerName"
            value={dadosCliente.customerName}
            onChange={(e) => setDadosCliente((prev) => ({ ...prev, customerName: e.target.value }))}
            onBlur={() => handleBlur('customerName')}
            className={`w-full h-12 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.customerName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Seu nome completo"
          />
          {errosForm.customerName && (
            <p className="text-red-500 text-xs mt-1">{errosForm.customerName}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-gray-800 mb-1 text-sm">
            E-mail *
          </label>
          <input
            ref={emailRef}
            type="email"
            id="customerEmail"
            value={dadosCliente.customerEmail}
            onChange={(e) =>
              setDadosCliente((prev) => ({ ...prev, customerEmail: e.target.value }))
            }
            onBlur={() => handleBlur('customerEmail')}
            className={`w-full h-12 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="seu@email.com"
          />
          {errosForm.customerEmail && (
            <p className="text-red-500 text-xs mt-1">{errosForm.customerEmail}</p>
          )}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-gray-800 mb-1 text-sm">
            WhatsApp *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaWhatsapp className={whatsappValidado ? 'text-green-600' : 'text-gray-400'} />
            </div>
            <input
              ref={telefoneRef}
              type="tel"
              id="customerPhone"
              value={dadosCliente.customerPhone}
              onChange={(e) => {
                if (whatsappValidado && e.target.value !== dadosCliente.customerPhone)
                  setWhatsappValidado(false);
                const valorFormatado = formatBrazilianPhone(e.target.value);
                setDadosCliente((prev) => ({ ...prev, customerPhone: valorFormatado }));
              }}
              onBlur={() => handleBlur('customerPhone')}
              className={`w-full h-12 pl-10 p-3 border text-base rounded-md text-gray-800 placeholder:text-gray-500 ${errosForm.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="(99) 99999-9999"
            />
          </div>
          {errosForm.customerPhone && (
            <p className="text-red-500 text-xs mt-1">{errosForm.customerPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormCustomer;
