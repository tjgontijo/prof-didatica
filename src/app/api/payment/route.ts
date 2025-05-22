import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Tipos para validar os dados recebidos
type Item = {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
  picture_url: string;
};

type Cliente = {
  nome: string;
  email: string;
  telefone: string;
};

type DadosPedido = {
  items: Item[];
  cliente: Cliente;
  valorTotal: number;
  external_reference: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Obter os dados brutos da requisição
    const dados = await request.json() as DadosPedido;
    
    // Exibir os dados recebidos no console para debug
    console.log('Dados brutos recebidos do checkout:', dados);
    
    // Validar se temos todos os dados necessários
    if (!dados.items || dados.items.length === 0) {
      throw new Error('Nenhum item encontrado no pedido');
    }
    
    if (!dados.cliente || !dados.cliente.nome || !dados.cliente.email || !dados.cliente.telefone) {
      throw new Error('Dados do cliente incompletos');
    }
    
    if (!dados.valorTotal || dados.valorTotal <= 0) {
      throw new Error('Valor total inválido');
    }
    
    // Configurar o Mercado Pago com o token de acesso
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Token de acesso do Mercado Pago não configurado');
    }
    
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    
    // Criar o pagamento PIX
    const resultado = await payment.create({
      body: {
        transaction_amount: dados.valorTotal,
        description: `Pedido ${dados.external_reference}`,
        payment_method_id: 'pix',
        payer: {
          email: dados.cliente.email,
          first_name: dados.cliente.nome.split(' ')[0],
          last_name: dados.cliente.nome.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: '12345678909' // Em produção, deve ser o CPF real do cliente
          },
          phone: {
            area_code: dados.cliente.telefone.substring(0, 2),
            number: dados.cliente.telefone.substring(2)
          }
        },
        additional_info: {
          items: dados.items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.title,
            picture_url: item.picture_url,
            category_id: 'books',
            quantity: item.quantity,
            unit_price: item.unit_price
          })),
          payer: {
            phone: {
              area_code: dados.cliente.telefone.substring(0, 2),
              number: dados.cliente.telefone.substring(2)
            }
          }
        },
        external_reference: dados.external_reference
      }
    });
    
    console.log('Resposta do Mercado Pago:', resultado);
    
    // Extrair os dados do PIX da resposta
    if (resultado.status !== 'pending') {
      throw new Error(`Status inesperado do pagamento: ${resultado.status}`);
    }
    
    // Obter os dados do PIX
    const pixData = resultado.point_of_interaction?.transaction_data;
    if (!pixData) {
      throw new Error('Dados do PIX não encontrados na resposta');
    }
    
    // Retornar os dados do PIX para o cliente
    return NextResponse.json({
      id: resultado.id,
      status: resultado.status,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      ticket_url: pixData.ticket_url,
      expiration_date: resultado.date_of_expiration
    });
    
  } catch (error) {
    // Exibir erro no console
    console.error('Erro ao processar pagamento:', error);
    
    // Retornar erro detalhado
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}