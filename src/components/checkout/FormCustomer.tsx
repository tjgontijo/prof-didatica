'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormTrigger, FormState } from 'react-hook-form';
import { useTrackingSession } from '@/modules/tracking/hooks/useTrackingSession';
import { FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { FiUser, FiMail } from 'react-icons/fi';
import { formatBrazilianPhone, cleanPhone, validateBrazilianPhone } from '@/lib/phone';
import { z } from 'zod';

const phoneValidationCache: Record<string, boolean> = {};

export const customerFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(11, 'Telefone deve ter pelo menos 11 dígitos')
    .refine((val) => validateBrazilianPhone(cleanPhone(val)), {
      message: 'Telefone inválido',
    }),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface FormCustomerProps {
  register: UseFormRegister<CustomerFormValues>;
  errors: FieldErrors<CustomerFormValues>;
  isSubmitting: boolean;
  trigger: UseFormTrigger<CustomerFormValues>;
  formState: FormState<CustomerFormValues>; // Mantemos no tipo para compatibilidade
  onProceedToPayment: () => void;
  product?: Product;
  checkoutId?: string;
}

function FormCustomer({
  register,
  errors,
  isSubmitting,
  trigger,
  // formState não é utilizado, então removemos da desestruturação
  onProceedToPayment,
  product,
  checkoutId,
}: FormCustomerProps) {
  // Usar o hook useTrackingSession para obter a função trackEventBoth
  const { trackEventBoth } = useTrackingSession();
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isWhatsappValid, setIsWhatsappValid] = useState(false);
  const [lastValidatedPhone, setLastValidatedPhone] = useState('');
  const [lastValidationResult, setLastValidationResult] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const { onChange: onNameChange } = register('name');
  const { onChange: onEmailChange } = register('email');
  const { onChange: onPhoneChange, ...phoneRegister } = register('phone');

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(e);
    const valid = await trigger('name');
    setIsNameValid(valid && !errors.name);
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e);
    const valid = await trigger('email');
    setIsEmailValid(valid && !errors.email);
  };

  const handlePhoneChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatBrazilianPhone(e.target.value);
    e.target.value = value;
    onPhoneChange(e);

    setIsWhatsappValid(false);
    setWhatsappError(null);

    const cleaned = cleanPhone(value);
    const validFormat = await trigger('phone');

    if (cleaned.length === 11 && validFormat) {
      // Verificar cache local primeiro
      if (cleaned === lastValidatedPhone) {
        setIsWhatsappValid(lastValidationResult);
        if (!lastValidationResult) setWhatsappError('Informe um WhatsApp válido');
        return;
      }

      if (phoneValidationCache.hasOwnProperty(cleaned)) {
        const isValid = phoneValidationCache[cleaned];
        setIsWhatsappValid(isValid);
        setLastValidatedPhone(cleaned);
        setLastValidationResult(isValid);
        if (!isValid) setWhatsappError('Informe um WhatsApp válido');
        return;
      }

      try {
        // Chamar a API do servidor para validar o número
        const response = await fetch('/api/whatsapp/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: cleaned }),
        });

        if (!response.ok) {
          throw new Error('Falha ao validar número');
        }

        const data = await response.json();
        const isValid = data.isWhatsapp === true;
        
        // Atualizar cache local
        phoneValidationCache[cleaned] = isValid;
        setLastValidatedPhone(cleaned);
        setLastValidationResult(isValid);
        setIsWhatsappValid(isValid);
        
        if (!isValid) {
          setWhatsappError('Informe um WhatsApp válido');
        }
      } catch (error) {
        console.error('Erro ao validar WhatsApp:', error);
        setIsWhatsappValid(false);
        setWhatsappError('Erro ao validar número');
      }
    }
  };


  
  return (
    <div id="formCustomer">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Informações Pessoais</h2>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
          <div className="relative mt-1">
            <FiUser
              className={`absolute left-3 top-2.5 ${isNameValid ? 'text-green-500' : 'text-gray-400'}`}
            />
            <input
              type="text"
              {...register('name')}
              onChange={handleNameChange}
              id="name"
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm sm:text-sm`}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* E‑mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Seu melhor e-mail</label>
          <div className="relative mt-1">
            <FiMail
              className={`absolute left-3 top-2.5 ${isEmailValid ? 'text-green-500' : 'text-gray-400'}`}
            />
            <input
              type="email"
              {...register('email')}
              onChange={handleEmailChange}
              id="email"
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm sm:text-sm`}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
          <div className="relative mt-1">
            <FaWhatsapp
              className={`absolute left-3 top-2.5 ${isWhatsappValid ? 'text-green-500' : 'text-gray-400'}`}
            />
            <input
              type="tel"
              {...phoneRegister}
              onChange={handlePhoneChange}
              id="phone"
              disabled={isSubmitting}
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.phone || whatsappError ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm sm:text-sm`}
              aria-invalid={errors.phone ? 'true' : 'false'}
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
          )}
          {!errors.phone && whatsappError && (
            <p className="mt-2 text-sm text-red-600">{whatsappError}</p>
          )}
        </div>

        {/* Botão */}
        <div className="mt-6">
          <button
            type="button"
            onClick={async () => {
              const nameValid = await trigger('name');
              const emailValid = await trigger('email');
              const phoneValid = await trigger('phone');
              if (nameValid && emailValid && phoneValid && isWhatsappValid) {
                // Disparar o evento AddPaymentInfo com os dados do cliente para advanced matching
                const nameInput = document.getElementById('name') as HTMLInputElement;
                const emailInput = document.getElementById('email') as HTMLInputElement;
                const phoneInput = document.getElementById('phone') as HTMLInputElement;
                
                const formValues = {
                  name: nameInput?.value || '',
                  email: emailInput?.value || '',
                  phone: cleanPhone(phoneInput?.value || '')
                };
                
                // Verificar se já enviamos este evento para este formulário
                const paymentInfoEventKey = `payment_info_${formValues.email}`;
                const hasAddedPaymentInfo = localStorage.getItem(paymentInfoEventKey);
                
                if (!hasAddedPaymentInfo) {
                  // Extrair nome e sobrenome
                  const nameParts = formValues.name.split(' ');
                  const firstName = nameParts[0] || '';
                  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
                  
                  // Obter dados do produto e checkout do contexto
                  // Verificar se temos dados do produto
                  if (!product) {
                    console.error('Erro: Produto não disponível para o evento AddPaymentInfo');
                    // Não vamos disparar o evento se não tivermos dados do produto
                    return;
                  }
                  
                  // Usar os dados reais do produto
                  const productValue = product.price;
                  const productId = product.id;
                  const productName = product.name;
                  const productCategory = product.category || 'Curso';
                  
                  // Verificar se há eventref na URL para eventos oficiais do Meta
                  const url = new URL(window.location.href);
                  const eventRef = url.searchParams.get('eventref');
                  
                  // Preparar parâmetros do evento conforme documentação oficial
                  // https://developers.facebook.com/docs/meta-pixel/reference#standard-events
                  const eventParams = {
                    // Parâmetros padrão do evento
                    content_category: productCategory,
                    content_type: 'product',
                    content_ids: [productId],
                    content_name: productName,
                    value: productValue,
                    currency: 'BRL',
                    num_items: 1,
                    
                    // Adicionar eventref apenas se estiver presente na URL
                    eventref: eventRef === 'fb_oea' ? 'fb_oea' : undefined,
                    
                    // Parâmetros adicionais para melhorar o EMQ e segmentação
                    contents: [{
                      id: productId,
                      quantity: 1,
                      item_price: productValue,
                      title: productName,
                      category: productCategory
                    }],
                    predicted_ltv: productValue * 1.5, // Valor estimado de LTV baseado no preço do produto
                    
                    // Informações da página
                    page_title: document.title,
                    page_url: window.location.href,
                    page_referrer: document.referrer || undefined,
                    
                    // Informações do checkout
                    checkout_id: checkoutId,
                    
                    // Dados de dispositivo e plataforma
                    platform: 'website',
                    device_type: /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                  };
                  
                  // Obter dados de geolocalização armazenados
                  const storedGeoData = await import('@/modules/tracking/utils/ipAndLocation')
                    .then(module => module.getStoredGeoData())
                    .catch(() => null);
                  
                  // Obter dados do cliente existentes como tipo seguro
                  const storedCustomerData = await import('@/modules/tracking/utils/storage')
                    .then(module => module.getCustomerData())
                    .catch(() => ({}));
                  
                  // Definir tipos para evitar erros
                  type SafeCustomerData = {
                    city?: string;
                    state?: string;
                    zipCode?: string;
                    country?: string;
                    ip?: string;
                    fbp?: string;
                    fbc?: string;
                    [key: string]: string | undefined;
                  };
                  
                  // Converter para tipo seguro
                  const safeCustomerData = storedCustomerData as SafeCustomerData;
                  
                  // Preparar dados do cliente para advanced matching
                  const customerData = {
                    // Dados do cliente para advanced matching
                    firstName: firstName,
                    lastName: lastName,
                    email: formValues.email,
                    phone: formValues.phone,
                    externalId: formValues.email.split('@')[0], // ID externo baseado no email
                    
                    // Dados de geolocalização
                    city: storedGeoData?.city || safeCustomerData.city || '',
                    state: storedGeoData?.region || safeCustomerData.state || '',
                    zipCode: storedGeoData?.postal || safeCustomerData.zipCode || '',
                    country: storedGeoData?.country || safeCustomerData.country || 'br',
                    
                    // Dados técnicos
                    ip: safeCustomerData.ip || '',
                    userAgent: navigator.userAgent,
                    
                    // Cookies do Facebook
                    fbp: safeCustomerData.fbp,
                    fbc: safeCustomerData.fbc
                  };
                  
                  console.log('Disparando AddPaymentInfo com parâmetros:', eventParams);
                  console.log('Dados do cliente para advanced matching:', customerData);
                  
                  // Enviar evento com dados do cliente para advanced matching
                  trackEventBoth('AddPaymentInfo', eventParams, customerData);
                  
                  // Registrar que o evento foi enviado para este email
                  localStorage.setItem(paymentInfoEventKey, 'true');
                  
                  // Opcional: Definir um tempo de expiração (24 horas)
                  setTimeout(() => {
                    localStorage.removeItem(paymentInfoEventKey);
                  }, 24 * 60 * 60 * 1000);
                }
                
                onProceedToPayment();
              }
            }}
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
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
