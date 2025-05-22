import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * Rota para receber notificações de pagamento do Mercado Pago
 * @param request Requisição com os dados da notificação
 * @returns Resposta de confirmação
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Verificar se é uma notificação de pagamento
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id;
      
      // Inicializar cliente do Mercado Pago
      const client = new MercadoPagoConfig({ 
        accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
      });
      
      // Buscar informações do pagamento
      const paymentClient = new Payment(client);
      const paymentInfo = await paymentClient.get({ id: paymentId });
      
      // Processar o status do pagamento
      const status = paymentInfo.status;
      const externalReference = paymentInfo.external_reference;
      
      // Aqui você pode atualizar o status do pedido no seu banco de dados
      // e enviar notificações para o cliente, se necessário
      console.log(`Pagamento ${paymentId} com status: ${status}`);
      console.log(`Referência externa: ${externalReference}`);
      
      // Implementar lógica para cada status de pagamento
      switch (status) {
        case 'approved':
          // Pagamento aprovado - liberar acesso ao produto
          break;
        case 'pending':
          // Pagamento pendente - aguardar confirmação
          break;
        case 'rejected':
          // Pagamento rejeitado - notificar cliente
          break;
        default:
          // Outros status
          break;
      }
    }
    
    // Sempre retornar 200 para o Mercado Pago
    return NextResponse.json({ success: true });
  } catch (erro) {
    console.error('Erro ao processar webhook:', erro);
    // Mesmo em caso de erro, retornar 200 para o Mercado Pago
    // para evitar reenvios desnecessários
    return NextResponse.json({ success: false });
  }
}
