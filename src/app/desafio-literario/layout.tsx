import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Desafio Literário | Prof Didática',
  description: 'Sistema completo de gamificação que transforma alunos desinteressados em leitores apaixonados. Já aplicável na próxima aula.',
};

export default function DesafioLiterarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Preconnect ao checkout para navegação mais rápida */}
      <link rel="preconnect" href="https://seguro.profdidatica.com.br" />
      <link rel="dns-prefetch" href="https://seguro.profdidatica.com.br" />
      {children}
    </>
  );
}
