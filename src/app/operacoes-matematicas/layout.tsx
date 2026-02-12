import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Operações Matemáticas em Pixel Art — Divertidamente II | Prof Didática',
    description: '18 atividades de Pixel Art com personagens do Divertidamente II. A criança resolve as continhas e descobre os personagens. Material pronto para imprimir.',
};

export default function OperacoesMatematicasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <link rel="preconnect" href="https://seguro.profdidatica.com.br" />
            <link rel="dns-prefetch" href="https://seguro.profdidatica.com.br" />
            {children}
        </>
    );
}
