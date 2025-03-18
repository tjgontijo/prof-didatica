"use client";

import { AbTestProvider } from '@/contexts/AbTestContext';
import AbTestRenderer from '@/components/abTest/AbTestRenderer';
import { VariantA, VariantB } from '@/components/abTest/projeto-literario';

// Configuração do teste A/B para o Projeto Literário
const abTests = [
  {
    testId: 'projeto-literario',
    variants: [
      { id: 'A', component: VariantA, weight: 50 },
      { id: 'B', component: VariantB, weight: 50 }
    ]
  }
];

export default function ProjetoLiterarioPage() {
  return (
    <AbTestProvider tests={abTests}>
      <AbTestRenderer testId="projeto-literario" />
    </AbTestProvider>
  );
}
