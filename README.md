This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



arte 1: Rastrear 
InitiateCheckout
 (Frontend e Novo Endpoint)
Objetivo: Quando o 
InitiateCheckout
 é disparado no navegador, também criamos um registro TrackingEvent no banco de dados para marcar o início do funil.

Passo 1.1: Criar um Novo Endpoint da API para Registrar Eventos do Cliente

Precisamos de um endpoint que o frontend possa chamar para notificar o backend sobre eventos que acontecem no navegador, como o 
InitiateCheckout
.

Ação: Criar o arquivo src/app/api/tracking/event/route.ts.
Este endpoint receberá o trackingSessionId, eventName, o eventId (gerado no cliente para ser usado no Pixel) e o payload.
Ele criará uma nova entrada na sua tabela TrackingEvent.
Passo 1.2: Modificar o Hook 
useInitiateCheckout

Vamos atualizar o hook para que ele, além de disparar o evento do Pixel, também chame nosso novo endpoint.

Ação: Modificar o arquivo 
src/modules/tracking/hooks/useInitiateCheckout.ts
.
Ele continuará gerando um eventId único com cuid().
Ele usará este eventId tanto na chamada window.fbq quanto na chamada para o nosso novo endpoint /api/tracking/event.
A chamada para a nossa API será "fire-and-forget" para não bloquear a experiência do usuário.
Parte 2: Rastrear Purchase (Backend via Webhook)
Esta parte permanece como no plano anterior, mas agora ela se torna o segundo evento na trilha, solidificando a conversão.

Objetivo: Quando o webhook recebe a confirmação de pagamento, ele cria o TrackingEvent para a compra com dados de alta qualidade para o EMQ.

Ação: Modificar 
src/app/api/payment/webhook/route.ts
.
Dentro da transação do Prisma, após a confirmação do pagamento, vamos:
Gerar um novo eventId para o evento Purchase.
Montar aquele payload extremamente rico com todos os dados do cliente e da sessão (fbp, fbc, email, telefone, etc., todos hasheados).
Enviar o evento para a CAPI do Meta.
Criar o registro TrackingEvent no seu banco de dados com eventName: 'Purchase', o eventId da compra e o status SENT_TO_CAPI.
Parte 3: Conectar o Purchase do Pixel (Frontend Oportunista)
Esta parte final fecha o ciclo, garantindo a deduplicação.

Objetivo: Na página de "Obrigado", disparar o evento Purchase do Pixel usando o eventId correto.

Ação (API): Modificar seu endpoint que busca dados do pedido (ex: /api/orders/[orderId]) para que ele faça um include do TrackingEvent onde eventName seja Purchase.
Ação (Frontend): Modificar sua página de "Obrigado" (/payment/[paymentId]/page.tsx ou similar).
Ela buscará os dados do pedido.
Se o pedido estiver pago, ela encontrará o eventId do evento de compra retornado pela API.
Ela usará o hook usePurchase para disparar o evento do Pixel com o eventId da compra, garantindo que o Meta o deduplique com o evento da CAPI.
Resumo da Jornada do Evento
Com este plano, a jornada fica assim:

Checkout: 
InitiateCheckout
 é disparado (Pixel + DB) com event_id_1.
Pagamento Confirmado: Purchase é disparado (CAPI + DB) com event_id_2.
Página de Obrigado: Purchase é disparado (Pixel) com event_id_2.
O resultado é um funil completo e rastreável no seu banco de dados e um rastreamento de conversão otimizado e deduplicado no Meta.

O que acha deste plano completo? Se estiver de acordo, posso começar a gerar o código para o Passo 1.1 (o novo endpoint /api/tracking/event) e o Passo 1.2 (a modificação no hook 
useInitiateCheckout
).