import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedData, invalidateCache } from '@/lib/cache';

// GET /api/checkouts/[id] - Busca checkout por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do checkout não fornecido' },
        { status: 400 }
      );
    }

    // Cache key baseado no ID
    const cacheKey = `checkout:${id}`;

    const checkout = await getCachedData(
      cacheKey,
      async () => {
        // Buscar checkout por ID
        const checkout = await prisma.checkout.findUnique({
          where: {
            id,
            deletedAt: null, // Não mostrar checkouts deletados
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        });

        if (!checkout) {
          return null;
        }

        return checkout;
      },
      60 * 5 // Cache por 5 minutos
    );

    if (!checkout) {
      return NextResponse.json(
        { error: 'Checkout não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(checkout);
  } catch (error) {
    console.error('Erro ao buscar checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar checkout' },
      { status: 500 }
    );
  }
}

// PATCH /api/checkouts/[id] - Atualiza checkout por ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do checkout não fornecido' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Atualizar checkout
    const updatedCheckout = await prisma.checkout.update({
      where: { id },
      data,
    });

    // Invalidar cache
    await invalidateCache(`checkout:${id}`);
    await invalidateCache('checkouts:*');

    return NextResponse.json(updatedCheckout);
  } catch (error) {
    console.error('Erro ao atualizar checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar checkout' },
      { status: 500 }
    );
  }
}

// DELETE /api/checkouts/[id] - Remove checkout por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do checkout não fornecido' },
        { status: 400 }
      );
    }

    // Soft delete (atualiza o campo deletedAt)
    const deletedCheckout = await prisma.checkout.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalidar cache
    await invalidateCache(`checkout:${id}`);
    await invalidateCache('checkouts:*');

    return NextResponse.json(deletedCheckout);
  } catch (error) {
    console.error('Erro ao remover checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao remover checkout' },
      { status: 500 }
    );
  }
}
