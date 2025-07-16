import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';
import { DashboardHeader } from '@/components/dashboard/Header';
import { Suspense } from 'react';

export default async function AbTestsAdminPage() {
  await prisma.abResult.findMany({
    take: 1,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">      
      <DashboardHeader 
        title="Dashboard de Testes A/B" 
        subtitle="Análise de performance das variantes de landing pages" 
      />
      <div className="max-w-7xl mx-auto px-4 py-8">        
        <Suspense fallback={<div className="text-center py-10">Carregando dashboard...</div>}>
          <DashboardClient />
        </Suspense>
      </div>
    </div>
  );
}