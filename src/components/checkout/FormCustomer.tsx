'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormTrigger, FormState } from 'react-hook-form';
import { FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { FiUser, FiMail } from 'react-icons/fi';
import { formatBrazilianPhone, cleanPhone, validateBrazilianPhone } from '@/lib/phone';
import { z } from 'zod';
import { WhatsappService } from '@/services/whatsapp/whatsapp.service';

const whatsappService = new WhatsappService();

// Cache para evitar chamadas repetidas ao serviço de WhatsApp
const phoneValidationCache: Record<string, boolean> = {};

// Schema para validação dos dados do cliente sem a validação de WhatsApp
// A validação de WhatsApp será feita apenas no evento onBlur para evitar chamadas duplicadas
export const customerFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(11, 'Telefone deve ter pelo menos 11 dígitos')
    .refine((val) => val.length === 0 || validateBrazilianPhone(val), {
      message: 'Telefone inválido',
    })
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface FormCustomerProps {
  register: UseFormRegister<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  isSubmitting: boolean;
  trigger: UseFormTrigger<CustomerFormValues>;
  formState: FormState<CustomerFormValues>;
  onProceedToPayment: () => void;
}

const FormCustomer: React.FC<FormCustomerProps> = ({ register, errors, isSubmitting, trigger, onProceedToPayment }) => {
  const [isWhatsappValid, setIsWhatsappValid] = useState(false);
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  // Usamos o cache global e o estado local para evitar chamadas repetidas
  const [lastValidatedPhone, setLastValidatedPhone] = useState<string>('');
  const [lastValidationResult, setLastValidationResult] = useState<boolean>(false);
  
  const { onChange: onPhoneChange, onBlur: onPhoneBlur, ...phoneRegister } = register('phone');
  const { onBlur: onNameBlur } = register('name');
  const { onBlur: onEmailBlur } = register('email');
  
  // Não precisamos mais verificar a validade do formulário via useEffect

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = formatBrazilianPhone(e.target.value);
    onPhoneChange(e);
    
    // Quando o usuário altera o número, invalidamos o estado de WhatsApp válido
    // para forçar uma nova validação quando o campo perder o foco
    setIsWhatsappValid(false);
  };

  // Função para validar apenas no evento onBlur e não durante a digitação
  const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    onNameBlur(e);
    // Valida apenas se o campo não estiver vazio
    if (e.target.value.trim().length > 0) {
      const isValid = await trigger('name');
      setIsNameValid(isValid && !errors.name);
    } else {
      setIsNameValid(false);
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    onEmailBlur(e);
    // Valida apenas se o campo não estiver vazio
    if (e.target.value.trim().length > 0) {
      const isValid = await trigger('email');
      setIsEmailValid(isValid && !errors.email);
    } else {
      setIsEmailValid(false);
    }
  };

  // Função para validar o WhatsApp com cache
  const validateWhatsApp = async (phoneNumber: string): Promise<boolean> => {
    if (!phoneNumber || phoneNumber.trim().length === 0) return false;
    
    const cleanedPhone = cleanPhone(phoneNumber);
    
    // Verifica o cache local primeiro (mais rápido)
    if (cleanedPhone === lastValidatedPhone) {
      return lastValidationResult;
    }
    
    // Verifica o cache global em seguida
    if (phoneValidationCache.hasOwnProperty(cleanedPhone)) {
      const isValid = phoneValidationCache[cleanedPhone];
      // Atualiza o cache local
      setLastValidatedPhone(cleanedPhone);
      setLastValidationResult(isValid);
      return isValid;
    }
    
    // Se não está em nenhum cache, faz a chamada ao serviço
    try {
      const response = await whatsappService.checkWhatsappNumber(cleanedPhone);
      const isValid = response.isWhatsapp === true;
      
      // Atualiza ambos os caches
      phoneValidationCache[cleanedPhone] = isValid;
      setLastValidatedPhone(cleanedPhone);
      setLastValidationResult(isValid);
      
      return isValid;
    } catch (error) {
      console.error('Erro ao validar WhatsApp:', error);
      return false;
    }
  };
  
  // Estado para controlar a mensagem de erro do WhatsApp
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  
  const handlePhoneBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    onPhoneBlur(e);
    const currentPhone = e.target.value.trim();
    
    // Limpa o erro de WhatsApp
    setWhatsappError(null);
    
    // Valida apenas se o campo não estiver vazio
    if (currentPhone.length > 0) {
      // Primeiro verifica se o formato do telefone é válido
      const result = await trigger('phone');
      
      // Se o formato do telefone é válido, verifica se é um WhatsApp
      if (result === true && !errors.phone) {
        // Valida o WhatsApp usando nossa função com cache
        const isValid = await validateWhatsApp(currentPhone);
        setIsWhatsappValid(isValid);
        
        // Se não for um WhatsApp válido, define um erro personalizado
        if (!isValid) {
          setWhatsappError('Informe um WhatsApp válido');
        }
      } else {
        setIsWhatsappValid(false);
      }
    } else {
      setIsWhatsappValid(false);
    }
  };

  return (
    <div id="formCustomer" >
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Informações Pessoais</h2>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome Completo
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiUser className={`h-4 w-4 ${isNameValid ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="text"
              id="name"
              {...register('name')}
              onBlur={handleNameBlur}
              className={`block w-full px-3 py-2 pl-10 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              disabled={isSubmitting}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
          </div>
          {errors.name && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            WhatsApp
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaWhatsapp className={`h-4 w-4 ${isWhatsappValid ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="tel"
              id="phone"
              {...phoneRegister}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}              
              className={`block w-full px-3 py-2 pl-10 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              disabled={isSubmitting}
              aria-invalid={errors.phone ? 'true' : 'false'}
            />
          </div>
          {errors.phone && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.phone.message}
            </p>
          )}
          {!errors.phone && whatsappError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {whatsappError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Seu melhor e-mail
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiMail className={`h-4 w-4 ${isEmailValid ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            <input
              type="email"
              id="email"
              {...register('email')}
              onBlur={handleEmailBlur}
              className={`block w-full px-3 py-2 pl-10 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              disabled={isSubmitting}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
          </div>
          {errors.email && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>
        
        {/* Botão para prosseguir para pagamento */}
        <div className="mt-6">
          <button
            type="button"
            onClick={async () => {
              // Validar todos os campos antes de prosseguir
              const nameValid = await trigger('name');
              const emailValid = await trigger('email');
              const phoneValid = await trigger('phone');
              
              // Só prossegue se todos os campos forem válidos e o WhatsApp também
              if (nameValid && emailValid && phoneValid && isWhatsappValid) {
                onProceedToPayment();
              }
            }}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              <>
                Continuar para pagamento <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormCustomer;
