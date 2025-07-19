'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';

interface UtmItem {
  name: string;
  views: number;
  uniqueVisitors: number;
  conversions: number;
  rate: number;
}

interface UtmPerformanceCardProps {
  title: string;
  data: UtmItem[] | null;
  isLoading: boolean;
}

export function UtmPerformanceCard({ title, data, isLoading }: UtmPerformanceCardProps) {
  // Função para formatar números com separador de milhares
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Função para formatar a taxa de conversão
  const formatRate = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  // Função para obter a classe de cor com base na taxa
  const getRateColorClass = (rate: number) => {
    if (rate >= 10) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 5) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100 h-full">
        <CardHeader className="border-b border-gray-100 bg-gray-50 py-3 px-4">
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-4 w-[120px]" />
                <div className="flex space-x-6">
                  <Skeleton className="h-4 w-[40px]" />
                  <Skeleton className="h-4 w-[40px]" />
                  <Skeleton className="h-4 w-[40px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar estado vazio
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100 h-full">
        <CardHeader className="border-b border-gray-100 bg-gray-50 py-3 px-4">
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[150px] items-center justify-center text-center text-sm text-gray-500">
            Aguardando dados para análise
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100 h-full">
      <CardHeader className="border-b border-gray-100 bg-gray-50 py-3 px-4">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider w-[35%]">Nome</TableHead>
                <TableHead className="py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right w-[20%]">Visitantes Únicos</TableHead>
                <TableHead className="py-3 px-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right w-[20%]">Conversões</TableHead>
                <TableHead className="py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider text-right w-[25%]">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 5).map((item) => (
                <TableRow key={item.name} className="hover:bg-gray-50">
                  <TableCell className="py-3 px-4 text-sm font-medium text-gray-800 max-w-[150px] truncate">
                    {item.name || 'Não definido'}
                  </TableCell>
                  <TableCell className="py-3 px-2 text-sm text-gray-700 text-right">{formatNumber(item.uniqueVisitors)}</TableCell>
                  <TableCell className="py-3 px-2 text-sm text-gray-700 text-right">{formatNumber(item.conversions)}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-right">
                    <span 
                      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md ${getRateColorClass(item.rate)}`}
                    >
                      {formatRate(item.rate)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
