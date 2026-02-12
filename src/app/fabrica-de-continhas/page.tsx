'use client';

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { z } from 'zod';
import {
    Plus,
    Minus,
    X,
    Divide,
    Settings2,
    RotateCcw,
    Cpu,
    BrainCircuit,
    Zap,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    AlertCircle,
    Trash2,
    Download,
    Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

interface FlashcardData {
    id: string;
    num1: number;
    num2: number;
    operation: Operation;
    result: number;
    difficultyUsed: Difficulty;
}

const OPERATION_LABELS: Record<Operation, { label: string; icon: any; color: string; borderColor: string; symbol: string }> = {
    addition: { label: 'Adição', icon: Plus, color: 'bg-emerald-500', borderColor: 'border-emerald-500', symbol: '+' },
    subtraction: { label: 'Subtração', icon: Minus, color: 'bg-blue-500', borderColor: 'border-blue-500', symbol: '-' },
    multiplication: { label: 'Multiplicação', icon: X, color: 'bg-amber-500', borderColor: 'border-amber-500', symbol: '×' },
    division: { label: 'Divisão', icon: Divide, color: 'bg-rose-500', borderColor: 'border-rose-500', symbol: '÷' },
};

const DIFFICULTY_CONFIG: Record<Exclude<Difficulty, 'mixed'>, { label: string; range: [number, number]; icon: any }> = {
    easy: { label: 'Fácil (1-10)', range: [1, 10], icon: Zap },
    medium: { label: 'Médio (1-50)', range: [1, 50], icon: BrainCircuit },
    hard: { label: 'Difícil (1-100)', range: [10, 100], icon: Cpu },
};

const MIXED_DIFFICULTY_LABEL = { label: 'Misto (Aleatório)', icon: RotateCcw };

const configSchema = z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).nullable().refine(val => val !== null, {
        message: 'Selecione o nível de dificuldade'
    }),
    orientation: z.enum(['portrait']).nullable().refine(val => val !== null, {
        message: 'Orientação interna'
    }),
    showResults: z.boolean().nullable().refine(val => val !== null, {
        message: 'Selecione se deseja mostrar o gabarito'
    }),
    totalCards: z.number().min(1, 'Adicione pelo menos uma continha para gerar a folha')
});

export default function FabricaDeContinhasPage() {
    const [opCounts, setOpCounts] = useState<Record<Operation, number>>({
        addition: 2,
        subtraction: 2,
        multiplication: 2,
        division: 2
    });
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [orientation] = useState<'portrait'>('portrait');
    const [showResults, setShowResults] = useState<boolean | null>(null);
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        const sessionData = localStorage.getItem('fabrica-session');
        if (sessionData) {
            try {
                const { timestamp } = JSON.parse(sessionData);
                const now = Date.now();
                const fifteenMinutes = 15 * 60 * 1000;

                if (now - timestamp < fifteenMinutes) {
                    setIsUnlocked(true);
                } else {
                    localStorage.removeItem('fabrica-session');
                }
            } catch (e) {
                localStorage.removeItem('fabrica-session');
            }
        }
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput.toLowerCase() === 'profdidatica') {
            localStorage.setItem('fabrica-session', JSON.stringify({
                timestamp: Date.now()
            }));
            setIsUnlocked(true);
        } else {
            alert('Palavra-chave incorreta');
        }
    };

    const updateCount = (op: Operation, delta: number) => {
        setOpCounts(prev => ({
            ...prev,
            [op]: Math.max(0, Math.min(12, prev[op] + delta))
        }));
    };

    const resetConfig = () => {
        setOpCounts({
            addition: 2,
            subtraction: 2,
            multiplication: 2,
            division: 2
        });
        setDifficulty(null);
        setShowResults(null);
        setCards([]);
        setValidationErrors([]);
        setErrorMessages([]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const generateCards = () => {
        setValidationErrors([]);
        const totalCards = Object.values(opCounts).reduce((a, b) => a + b, 0);

        const result = configSchema.safeParse({
            difficulty,
            orientation: 'portrait',
            showResults,
            totalCards
        });

        if (!result.success) {
            const msgs = result.error.issues.map(err => err.message);
            setErrorMessages(msgs);
            const fields = result.error.issues.map(err => err.path[0] as string);
            setValidationErrors(fields);

            const firstField = fields[0];
            const element = document.getElementById(`config-${firstField}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setErrorMessages([]);
        setIsGenerating(true);
        const newCards: FlashcardData[] = [];

        (Object.keys(opCounts) as Operation[]).forEach(operation => {
            const count = opCounts[operation];
            for (let i = 0; i < count; i++) {
                const currentDiffKey = difficulty === 'mixed'
                    ? (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)]
                    : difficulty as Exclude<Difficulty, 'mixed'>;

                const config = DIFFICULTY_CONFIG[currentDiffKey];

                let n1 = Math.floor(Math.random() * (config.range[1] - config.range[0] + 1)) + config.range[0];
                let n2 = Math.floor(Math.random() * (config.range[1] - config.range[0] + 1)) + config.range[0];

                if (operation === 'division') {
                    const product = n1 * n2;
                    n1 = product;
                }

                if (operation === 'subtraction' && n1 < n2) {
                    [n1, n2] = [n2, n1];
                }

                let resultVal = 0;
                switch (operation) {
                    case 'addition': resultVal = n1 + n2; break;
                    case 'subtraction': resultVal = n1 - n2; break;
                    case 'multiplication': resultVal = n1 * n2; break;
                    case 'division': resultVal = n1 / n2; break;
                }

                newCards.push({
                    id: Math.random().toString(36).substring(7),
                    num1: n1,
                    num2: n2,
                    operation,
                    result: resultVal,
                    difficultyUsed: currentDiffKey
                });
            }
        });

        const shuffled = [...newCards].sort(() => Math.random() - 0.5);

        setTimeout(() => {
            setCards(shuffled);
            setIsGenerating(false);
            // Small timeout to allow render before scroll
            setTimeout(() => {
                const preview = document.getElementById('flashcards-to-export');
                if (preview) preview.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 600);
    };

    const downloadPDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const elements = document.getElementsByClassName('pdf-page-content');

            for (let i = 0; i < elements.length; i++) {
                const element = elements[i] as HTMLElement;

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: element.offsetWidth,
                    height: element.offsetHeight
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                if (i > 0) pdf.addPage();

                // Add margins if needed, but here we fill the page
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            }

            pdf.save('fabrica-de-continhas.pdf');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Não foi possível gerar o PDF. Tente usar a opção de impressão do navegador.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const cardsPerPage = 10;
    const cardPages = [];
    for (let i = 0; i < cards.length; i += cardsPerPage) {
        cardPages.push(cards.slice(i, i + cardsPerPage));
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="mb-6">
                            <Image
                                src="/images/fabrica-de-continhas/logo.png"
                                alt="Fábrica de Continhas"
                                width={200}
                                height={80}
                                className="h-auto w-auto max-w-[180px]"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Área Restrita</h1>
                        <p className="text-slate-500 mt-2">Insira a palavra-chave para acessar a Fábrica de Continhas</p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Palavra-chave..."
                            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-center text-lg tracking-widest font-medium text-slate-900 placeholder:text-slate-400"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                        >
                            Acessar Ferramenta
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] print:bg-white text-slate-900 pb-20 print:pb-0">
            <div className="print:hidden">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-center">
                        <Image
                            src="/images/fabrica-de-continhas/logo.png"
                            alt="Fábrica de Continhas"
                            width={200}
                            height={80}
                            className="h-11 md:h-14 w-auto"
                        />
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-3 md:px-4 mt-6 md:mt-8">
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                <Settings2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Gabarito */}
                            <div id="config-showResults">
                                <label className={cn(
                                    "block text-sm font-semibold uppercase tracking-wider mb-4 transition-colors",
                                    validationErrors.includes('showResults') ? "text-rose-500" : "text-slate-500"
                                )}>
                                    Gabarito
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => {
                                            setShowResults(true);
                                            setValidationErrors(prev => prev.filter(e => e !== 'showResults'));
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                            showResults === true ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <Eye className="w-5 h-5" />
                                        <div>
                                            <div className="font-bold">Visível</div>
                                            <div className="text-xs text-slate-500">Mostrar respostas</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowResults(false);
                                            setValidationErrors(prev => prev.filter(e => e !== 'showResults'));
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                            showResults === false ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white"
                                        )}
                                    >
                                        <EyeOff className="w-5 h-5" />
                                        <div>
                                            <div className="font-bold">Oculto</div>
                                            <div className="text-xs text-slate-500">Esconder respostas</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div id="config-difficulty">
                                <label className={cn(
                                    "block text-sm font-semibold uppercase tracking-wider mb-4 transition-colors",
                                    validationErrors.includes('difficulty') ? "text-rose-500" : "text-slate-500"
                                )}>
                                    Nível de Dificuldade
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {(Object.keys(DIFFICULTY_CONFIG) as (Exclude<Difficulty, 'mixed'>)[]).concat(['mixed'] as any).map((d) => {
                                        const isMixed = (d as any) === 'mixed';
                                        const config = isMixed ? MIXED_DIFFICULTY_LABEL : DIFFICULTY_CONFIG[d as Exclude<Difficulty, 'mixed'>];
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setDifficulty(d);
                                                    setValidationErrors(prev => prev.filter(e => e !== 'difficulty'));
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                                    difficulty === d ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white"
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <div>
                                                    <div className="font-bold">{config.label.split(' ')[0]}</div>
                                                    <div className="text-xs text-slate-500">{isMixed ? 'Fácil/Médio/Difícil' : config.label.split(' ')[1] || ''}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Operations */}
                        <div id="config-totalCards" className="mb-8">
                            <label className={cn(
                                "block text-sm font-semibold uppercase tracking-wider mb-4 text-slate-500"
                            )}>
                                Quantidade por Operação
                            </label>
                            <div className="grid md:grid-cols-2 gap-3">
                                {(Object.keys(OPERATION_LABELS) as Operation[]).map((op) => {
                                    const Icon = OPERATION_LABELS[op].icon;
                                    return (
                                        <div key={op} className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg text-white", OPERATION_LABELS[op].color)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold">{OPERATION_LABELS[op].label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateCount(op, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"><Minus className="w-4 h-4" /></button>
                                                <span className="font-bold text-lg w-6 text-center tabular-nums">{opCounts[op]}</span>
                                                <button onClick={() => updateCount(op, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {errorMessages.length > 0 && (
                            <div className="mb-8 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600">
                                <div className="flex items-center gap-2 font-bold mb-2"><AlertCircle className="w-5 h-5" /> Faltam informações:</div>
                                <ul className="list-disc list-inside text-sm font-medium">{errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}</ul>
                            </div>
                        )}

                        <div className="flex justify-center border-t border-slate-100 pt-8">
                            <button
                                onClick={generateCards}
                                disabled={isGenerating}
                                className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                            >
                                {isGenerating ? <RotateCcw className="w-5 h-5 animate-spin" /> : 'Gerar Folha de Continhas'}
                                {!isGenerating && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Preview Section */}
            <div id="flashcards-to-export" className="mx-auto px-2 md:px-4 max-w-4xl mt-12 pb-24">
                {cardPages.map((pageCards, pageIndex) => (
                    <div key={pageIndex} className="pdf-page mb-24 print:mb-0 flex flex-col items-center">
                        <div className="print:hidden w-full flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
                            <div>
                                <h3 className="text-xl font-bold">Folha {pageIndex + 1} de {cardPages.length}</h3>
                                <p className="text-slate-500 text-sm">Visualização programada para A4</p>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">210mm x 297mm</span>
                        </div>

                        {/* This is the container captured by html2canvas */}
                        <div className="pdf-page-content bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] aspect-[210/297] overflow-hidden">
                            <div className="flashcard-grid flex flex-wrap w-full h-full border-t border-l border-dashed border-slate-300">
                                {Array.from({ length: 10 }).map((_, idx) => {
                                    const card = pageCards[idx];
                                    if (!card) return <div key={idx} className="w-1/2 h-1/5 border-r border-b border-dashed border-slate-200" />;
                                    return (
                                        <div key={card.id} className="w-1/2 h-1/5 border-r border-b border-dashed border-slate-300 relative flex items-center justify-center p-6">
                                            {/* Colored Inner Border */}
                                            <div className={cn("absolute inset-0 border-[6px]", OPERATION_LABELS[card.operation].borderColor)} />

                                            {/* Header Badge - Fixed Position */}
                                            <div className="absolute top-5 left-6 flex items-center gap-2 opacity-40">
                                                <div className={cn("p-1.5 rounded text-white", OPERATION_LABELS[card.operation].color)}>
                                                    {React.createElement(OPERATION_LABELS[card.operation].icon, { className: 'w-3 h-3' })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                                                    {OPERATION_LABELS[card.operation].label}
                                                </span>
                                            </div>

                                            {/* Main Card Content */}
                                            <div className="relative z-10 flex items-center justify-center w-full gap-3 md:gap-5 px-4 overflow-hidden">
                                                <div className="flex items-center gap-3 md:gap-5 text-3xl md:text-5xl font-bold tabular-nums text-slate-800">
                                                    <span>{card.num1}</span>
                                                    <span className="text-slate-400 font-medium text-2xl md:text-4xl">
                                                        {OPERATION_LABELS[card.operation].symbol}
                                                    </span>
                                                    <span>{card.num2}</span>
                                                </div>

                                                <div className="text-2xl md:text-4xl text-slate-300 font-light">=</div>

                                                {showResults ? (
                                                    <div className="text-3xl md:text-5xl font-black text-indigo-600 underline underline-offset-8 decoration-indigo-200 decoration-4 tabular-nums">
                                                        {card.result}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-10 md:w-20 md:h-14 border-4 border-dashed border-slate-200 rounded-2xl bg-slate-50/50" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            {cards.length > 0 && (
                <div className="print:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={resetConfig}
                        className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
                        title="Limpar tudo"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={downloadPDF}
                        disabled={isGeneratingPdf}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Baixar PDF
                            </>
                        )}
                    </button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .print\\:hidden, header, nav, footer, .action-bar { display: none !important; }
                    body { background: white !important; margin: 0 !important; }
                    .pdf-page { page-break-after: always !important; break-after: page !important; height: 297mm !important; margin: 0 !important; padding: 0 !important; }
                    .pdf-page-content { box-shadow: none !important; width: 210mm !important; height: 297mm !important; }
                }
            `}} />
        </div>
    );
}
