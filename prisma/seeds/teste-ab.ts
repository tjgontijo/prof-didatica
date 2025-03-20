// Script para popular o banco de dados com dados de teste A/B
import prisma from '@/lib/prisma';

export const seedAbTests = async () => {
  try {
    // Verificar se já existem testes
    const existingTests = await prisma.abTest.count();
    
    if (existingTests > 0) {
      console.log('Dados de teste já existem no banco de dados');
      return;
    }
    
    // Criar teste A/B para projeto literário
    const test = await prisma.abTest.create({
      data: {        
        name: 'projeto-literario',
        description: 'Teste A/B para a página do projeto literário',
        variants: {
          create: [
            {
                name: 'projeto-literario-a',
                description: 'Variante A do projeto literario',
                weight: 0.5,
            },
            {
                name: 'projeto-literario-b',
                description: 'Variante B do projeto literario',
                weight: 0.5,
            }
          ]
        }
      },
      include: {
        variants: true
      }
    });
    
    console.log('Dados de teste criados com sucesso', test);
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
  }
};

export default seedAbTests;