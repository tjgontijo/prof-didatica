'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Importação da função de prefetch
import { prefetchCheckoutData } from './actions';

// ID fixo do checkout que queremos pré-carregar
const CHECKOUT_ID = '6140324e-9e14-4980-96b3-42cacefaad73';

export default function TestePage() {
  const router = useRouter();

  const [prefetchRealizado, setPrefetchRealizado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Função para verificar se a página está completamente carregada
    const verificarCarregamento = () => {
      if (document.readyState === 'complete') {
        setCarregando(false);
      }
    };

    // Verificar o estado atual
    verificarCarregamento();

    // Adicionar listener para mudanças no estado de carregamento
    window.addEventListener('load', verificarCarregamento);

    return () => {
      window.removeEventListener('load', verificarCarregamento);
    };
  }, []);

  // Efeito separado para o prefetch, que só executa quando a página estiver carregada
  useEffect(() => {
    if (!carregando && !prefetchRealizado) {
      // Esperar um pouco após o carregamento completo
      const timeoutId = setTimeout(() => {
        // Realizar o prefetch
        prefetchCheckoutData(CHECKOUT_ID)
          .then((resultado) => {
            if (resultado) {
              setPrefetchRealizado(true);
              setErro(null);
            } else {
              // Se o resultado for null, significa que houve um erro
              setErro('Não foi possível carregar os dados do checkout');
              // Ainda permitimos navegar para o checkout mesmo com erro
              setPrefetchRealizado(true);
            }
          })
          .catch((erro) => {
            console.error('Erro no prefetch:', erro);
            setErro('Erro ao carregar dados: ' + (erro?.message || 'Erro desconhecido'));
            // Ainda permitimos navegar para o checkout mesmo com erro
            setPrefetchRealizado(true);
          });

        // Também prefetch da página de checkout
        router.prefetch(`/checkout/${CHECKOUT_ID}`);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [carregando, prefetchRealizado, router]);

  // Função para navegar para o checkout
  const irParaCheckout = () => {
    router.push(`/checkout/${CHECKOUT_ID}`);
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col p-4 items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">Página de Teste - Pré-carregamento</h1>

      <div className="mb-6 p-4 bg-slate-900 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Status do carregamento:</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span
              className={`w-4 h-4 rounded-full mr-2 ${!carregando ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></span>
            <span>Página: {!carregando ? 'Carregada' : 'Carregando...'}</span>
          </li>
          <li className="flex items-center">
            <span
              className={`w-4 h-4 rounded-full mr-2 ${prefetchRealizado ? (erro ? 'bg-orange-500' : 'bg-green-500') : 'bg-yellow-500'}`}
            ></span>
            <span>
              Dados do checkout:{' '}
              {prefetchRealizado
                ? erro
                  ? 'Carregados com aviso'
                  : 'Pré-carregados'
                : 'Aguardando...'}
            </span>
          </li>
        </ul>

        {erro && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <p className="font-semibold">Aviso:</p>
            <p>{erro}</p>
            <p className="mt-1 text-xs">
              O botão ainda está habilitado, mas a experiência pode não ser ideal.
            </p>
          </div>
        )}
      </div>

      <p className="mb-4 text-center max-w-md">
        Esta página está pré-carregando os dados do checkout para melhorar a performance. Quando
        você clicar no botão abaixo, a página de checkout já terá os dados carregados.
      </p>

      <button
        onClick={irParaCheckout}
        className={`
          w-full max-w-md py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform
          ${
            prefetchRealizado
              ? 'bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white hover:from-[#1D3557] hover:to-[#457B9D] hover:scale-[1.02] cursor-pointer'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }
        `}
        disabled={!prefetchRealizado}
      >
        {prefetchRealizado ? 'Comprar Agora' : 'Aguarde, carregando dados...'}
      </button>
    </div>
  );
}
