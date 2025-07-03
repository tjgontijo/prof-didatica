import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
  }

  try {
    const prisma = new PrismaClient();
    const checkout = await prisma.checkout.findUnique({
      where: {
        id: id,
        isActive: true,
        deletedAt: null,
      },
      include: {
        product: {
          include: {
            mainProductBumps: {
              where: {
                isActive: true,
                deletedAt: null,
              },
              include: {
                bumpProduct: true,
              },
              orderBy: {
                displayOrder: 'asc',
              },
            },
          },
        },
      },
    });
    if (!checkout) {
      return NextResponse.json({ error: 'Checkout não encontrado' }, { status: 404 });
    }
    return NextResponse.json(checkout);
  } catch  {
    return NextResponse.json({ error: 'Erro ao buscar checkout' }, { status: 500 });
  }
}
