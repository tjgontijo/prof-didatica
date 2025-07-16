import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Componente de cabeçalho para o dashboard
 */
export function DashboardHeader({ title, subtitle }: DashboardHeaderProps): JSX.Element {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
        <p className="text-indigo-100">{subtitle}</p>
      </div>
    </div>
  );
}
