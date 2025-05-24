import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPixData, type PixData } from '@/components/checkout/getPixData';
import ThanksClientComponent from '@/components/checkout/ThanksClientComponent';

// Definindo o tipo para os parâmetros conforme Next.js 15
export type paramsType = Promise<{ id: string }>;

// Função para gerar metadados dinâmicos
export async function generateMetadata(props: { params: paramsType }): Promise<Metadata> {
  try {
    const { id } = await props.params;

    return {
      title: `Pagamento PIX - Pedido #${id}`,
      description: 'Finalize seu pagamento via PIX',
    };
  } catch {
    return {
      title: 'Pagamento',
    };
  }
}

// Componente server-side
export default async function ThanksPage(props: { params: paramsType }) {
  // Obter o ID da transação da URL de forma assíncrona
  const { id } = await props.params;

  // Buscar dados do PIX
  const pixData: PixData | null = await getPixData(id);

  // Se os dados do PIX não existirem, retornar not found
  if (!pixData) {
    notFound();
  }

  // Renderizar o componente client-side com os dados
  return <ThanksClientComponent pixData={pixData} transactionId={id} />;
}
