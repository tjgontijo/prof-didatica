import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Rota para criar dados de teste no banco de dados
export async function GET() {
  try {
    // Verificar se já existem testes
    const existingTests = await prisma.abTest.count();
    
    if (existingTests > 0) {
      return NextResponse.json({
        message: 'Dados de teste já existem no banco de dados',
        count: existingTests
      });
    }
    
    // Criar teste A/B para projeto literário
    const test = await prisma.abTest.create({
      data: {
        testId: 'projeto-literario',
        name: 'Projeto Literário',
        description: 'Teste A/B para a página do projeto literário',
        variants: {
          create: [
            {
              variantId: 'A',
              name: 'Variante A',
              weight: 0.5,
            },
            {
              variantId: 'B',
              name: 'Variante B',
              weight: 0.5,
            }
          ]
        }
      },
      include: {
        variants: true
      }
    });
    
    return NextResponse.json({
      message: 'Dados de teste criados com sucesso',
      test
    });
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
}
