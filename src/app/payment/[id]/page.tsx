// app/payment/[id]/page.tsx

import React from 'react'
import { notFound } from 'next/navigation'
import PaymentFlow from '@/components/checkout/PaymentFlow'
import { getPixData, PixData } from '@/components/checkout/getPixData'

type ParamsType = Promise<{ id: string }>

interface PageProps {
  params: ParamsType
}

export default async function Page({ params }: PageProps) {
  // extraímos o id da URL usando o padrão do Next.js 15
  const { id } = await params

  // buscamos os dados normalizados do PIX no banco
  const pixData: PixData | null = await getPixData(id)
  if (!pixData) {
    // se não existir, renderiza 404
    notFound()
  }

  // extraímos do objeto retornado o nome do cliente e número do pedido
  const { customerName, orderNumber } = pixData

  // renderizamos o client component que vai gerenciar o SSE e trocar as telas
  return (
    <PaymentFlow
      pixData={pixData}
      transactionId={id}
      customerName={customerName}
      orderNumber={orderNumber}
    />
  )
}
