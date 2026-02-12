'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import {
    Plus,
    Minus,
    X,
    Divide,
    Settings2,
    Printer,
    RotateCcw,
    Cpu,
    BrainCircuit,
    Zap,
    ArrowRight,
    Eye,
    EyeOff,
    Scissors,
    Lock,
    AlertCircle,
    Trash2,
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
    const [orientation, setOrientation] = useState<'portrait'>('portrait');
    const [showResults, setShowResults] = useState<boolean | null>(null);
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput.toLowerCase() === 'profdidatica') {
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
        setOrientation('portrait');
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
            orientation,
            showResults,
            totalCards
        });

        if (!result.success) {
            const msgs = result.error.issues.map(err => err.message);
            setErrorMessages(msgs);
            const fields = result.error.issues.map(err => err.path[0] as string);
            setValidationErrors(fields);

            // Scroll to first error section
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
                // Determine difficulty for this specific card
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

                let result = 0;
                switch (operation) {
                    case 'addition': result = n1 + n2; break;
                    case 'subtraction': result = n1 - n2; break;
                    case 'multiplication': result = n1 * n2; break;
                    case 'division': result = n1 / n2; break;
                }

                newCards.push({
                    id: Math.random().toString(36).substring(7),
                    num1: n1,
                    num2: n2,
                    operation,
                    result,
                    difficultyUsed: currentDiffKey
                });
            }
        });

        // Shuffle cards
        const shuffled = [...newCards].sort(() => Math.random() - 0.5);

        setTimeout(() => {
            setCards(shuffled);
            setIsGenerating(false);
        }, 600);
    };

    const handlePrint = () => {
        window.print();
    };

    // Helper to split cards into pages (10 for Portrait 2x5, 9 for Landscape 3x3)
    const cardsPerPage = orientation === 'portrait' ? 10 : 9;
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
            {/* Search/Header Area - Hidden on Print */}
            <div className="print:hidden no-print">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-center">
                        <div className="flex items-center">
                            <Image
                                src="/images/fabrica-de-continhas/logo.png"
                                alt="Fábrica de Continhas"
                                width={200}
                                height={80}
                                className="h-11 md:h-14 w-auto"
                            />
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-3 md:px-4 mt-6 md:mt-8">
                    <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                    <Settings2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
                            </div>
                        </div>

                        {/* Configuration Grid - 2 columns (Orientation removed) */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">

                            {/* Gabarito */}
                            <div id="config-showResults" className="flex flex-col scroll-mt-24">
                                <label className={cn(
                                    "block text-sm font-semibold uppercase tracking-wider mb-4 transition-colors",
                                    validationErrors.includes('showResults') ? "text-rose-500" : "text-slate-500"
                                )}>
                                    Gabarito
                                </label>
                                <div className={cn(
                                    "grid grid-cols-1 gap-3 p-1 rounded-2xl transition-all",
                                    validationErrors.includes('showResults') && "ring-2 ring-rose-300 bg-rose-50/30"
                                )}>
                                    <button
                                        onClick={() => {
                                            setShowResults(true);
                                            setValidationErrors(prev => prev.filter(e => e !== 'showResults'));
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left min-h-[80px]",
                                            showResults === true
                                                ? "border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50"
                                                : "border-slate-100 hover:border-slate-200 bg-white shadow-sm shadow-slate-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            showResults === true ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <Eye className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={cn("font-bold leading-tight", showResults === true ? "text-indigo-900" : "text-slate-700")}>
                                                Visível
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                Mostrar respostas
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowResults(false);
                                            setValidationErrors(prev => prev.filter(e => e !== 'showResults'));
                                        }}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left min-h-[80px]",
                                            showResults === false
                                                ? "border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50"
                                                : "border-slate-100 hover:border-slate-200 bg-white shadow-sm shadow-slate-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            showResults === false ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            <EyeOff className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className={cn("font-bold leading-tight", showResults === false ? "text-indigo-900" : "text-slate-700")}>
                                                Oculto
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                Esconder respostas
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div id="config-difficulty" className="flex flex-col scroll-mt-24">
                                <label className={cn(
                                    "block text-sm font-semibold uppercase tracking-wider mb-4 transition-colors",
                                    validationErrors.includes('difficulty') ? "text-rose-500" : "text-slate-500"
                                )}>
                                    Nível de Dificuldade
                                </label>
                                <div className={cn(
                                    "grid grid-cols-1 gap-3 p-1 rounded-2xl transition-all",
                                    validationErrors.includes('difficulty') && "ring-2 ring-rose-300 bg-rose-50/30"
                                )}>
                                    {(Object.keys(DIFFICULTY_CONFIG) as (Exclude<Difficulty, 'mixed'>)[]).concat(['mixed'] as any).map((d) => {
                                        const active = difficulty === d;
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
                                                    "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left min-h-[80px]",
                                                    active
                                                        ? "border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50"
                                                        : "border-slate-100 hover:border-slate-200 bg-white shadow-sm shadow-slate-100"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className={cn("font-bold leading-tight", active ? "text-indigo-900" : "text-slate-700")}>
                                                        {config.label.split(' ')[0]}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {config.label.includes(' ') ? config.label.split(' ')[1] : config.label.includes('(') ? config.label : (isMixed ? 'Fácil/Médio/Difícil' : '')}
                                                        {isMixed && '(Aleatório)'}
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Operations Count - Full width below */}
                        <div id="config-totalCards" className="mb-8 scroll-mt-24">
                            <label className={cn(
                                "block text-sm font-semibold uppercase tracking-wider mb-4 transition-colors",
                                validationErrors.includes('totalCards') ? "text-rose-500" : "text-slate-500"
                            )}>
                                Quantidade por Operação
                            </label>
                            <div className={cn(
                                "grid md:grid-cols-2 gap-3 p-1 rounded-2xl transition-all",
                                validationErrors.includes('totalCards') && "ring-2 ring-rose-300 bg-rose-50/30"
                            )}>
                                {(Object.keys(OPERATION_LABELS) as Operation[]).map((op) => {
                                    const count = opCounts[op];
                                    const Icon = OPERATION_LABELS[op].icon;
                                    return (
                                        <div key={op} className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-slate-200 transition-all min-h-[80px] shadow-sm shadow-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg text-white", OPERATION_LABELS[op].color)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-semibold text-slate-700">{OPERATION_LABELS[op].label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        updateCount(op, -1);
                                                        setValidationErrors(prev => prev.filter(e => e !== 'totalCards'));
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-bold text-lg w-6 text-center tabular-nums">{count}</span>
                                                <button
                                                    onClick={() => {
                                                        updateCount(op, 1);
                                                        setValidationErrors(prev => prev.filter(e => e !== 'totalCards'));
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Error Messages Display */}
                        {errorMessages.length > 0 && (
                            <div className="mt-8 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-rose-600 font-bold mb-1">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Ops! Faltam algumas informações:</span>
                                </div>
                                <ul className="list-disc list-inside text-sm text-rose-500 font-medium">
                                    {errorMessages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                            <button
                                onClick={generateCards}
                                disabled={isGenerating || Object.values(opCounts).every(v => v === 0)}
                                className={cn(
                                    "group relative flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-3xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200",
                                    isGenerating && "opacity-80 cursor-wait",
                                    Object.values(opCounts).every(v => v === 0) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isGenerating ? (
                                    <>
                                        <RotateCcw className="w-5 h-5 animate-spin" />
                                        Gerando Cards...
                                    </>
                                ) : (
                                    <>
                                        Gerar Folha de Continhas
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Preview & PDF Content Area */}
            <div id="flashcards-to-export" className="mx-auto transition-all duration-500 px-2 md:px-4 max-w-4xl">
                {cardPages.map((pageCards, pageIndex) => (
                    <div key={pageIndex} className="pdf-page mb-24 print:mb-0 flex flex-col items-center w-full max-w-[calc(100vw-16px)] md:max-w-none mx-auto">
                        <div className="print:hidden flex items-baseline justify-between mb-8 mt-16 pt-8 border-t border-slate-200 w-full px-4">
                            <h3 className="text-xl font-bold text-slate-800">Folha {pageIndex + 1} de {cardPages.length}</h3>
                            <p className="text-slate-500 text-sm">10 cards por folha</p>
                        </div>

                        <div className="bg-white shadow-2xl shadow-slate-300 ring-1 ring-slate-200 overflow-hidden print:shadow-none print:ring-0 w-full max-w-[210mm] print:w-[210mm] print:h-[297mm] aspect-[210/297]">
                            {/* A4 Sheet Grid */}
                            <div className="flashcard-grid grid w-full h-full border-t-2 border-l-2 border-dashed border-slate-300 print:border-slate-400 grid-cols-2 grid-rows-5">
                                {Array.from({ length: cardsPerPage }).map((_, idx) => {
                                    const card = pageCards[idx];
                                    if (!card) {
                                        return (
                                            <div
                                                key={`empty-${pageIndex}-${idx}`}
                                                className="flashcard-item border-dashed border-slate-300 border-r border-b bg-slate-50/10 print:bg-transparent"
                                            />
                                        );
                                    }
                                    return (
                                        <div
                                            key={card.id}
                                            className={cn(
                                                "flashcard-item relative border-dashed border-slate-300 flex flex-col justify-center items-center overflow-hidden",
                                                "border-r-2 border-b-2"
                                            )}
                                        >
                                            {/* Colored Inner Border */}
                                            <div className={cn(
                                                "absolute inset-0 border-[6px]",
                                                OPERATION_LABELS[card.operation].borderColor
                                            )} />

                                            {/* Card Content with Padding */}
                                            <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-2 md:p-8">
                                                {/* Operation Icon Badge */}
                                                <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-40">
                                                    <div className={cn("p-1 rounded text-white", OPERATION_LABELS[card.operation].color)}>
                                                        {(() => {
                                                            const Icon = OPERATION_LABELS[card.operation].icon;
                                                            return <Icon className="w-3 h-3" />;
                                                        })()}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{OPERATION_LABELS[card.operation].label}</span>
                                                </div>

                                                {/* Scissors icon to indicate cutting */}
                                                <div className="absolute -top-3 -left-3 text-slate-200 print:hidden">
                                                    <Scissors className="w-4 h-4 rotate-90" />
                                                </div>

                                                {/* Main Card Content: All Inline, No Wrap */}
                                                <div className="flex flex-1 items-center gap-1 md:gap-3 flex-nowrap whitespace-nowrap justify-center text-center max-w-full px-1">
                                                    <span className="text-lg md:text-3xl print:text-4xl font-bold tracking-tighter text-slate-800 tabular-nums">
                                                        {card.num1}
                                                    </span>
                                                    <span className="text-sm md:text-xl print:text-2xl text-slate-400 font-medium">
                                                        {OPERATION_LABELS[card.operation].symbol}
                                                    </span>
                                                    <span className="text-lg md:text-3xl print:text-4xl font-bold tracking-tighter text-slate-800 tabular-nums">
                                                        {card.num2}
                                                    </span>
                                                    <span className="text-sm md:text-xl print:text-2xl text-slate-300 font-light">
                                                        =
                                                    </span>
                                                    {showResults ? (
                                                        <span className="text-lg md:text-3xl print:text-4xl font-black tracking-tighter text-indigo-600 tabular-nums underline decoration-indigo-200 underline-offset-4 decoration-2">
                                                            {card.result}
                                                        </span>
                                                    ) : (
                                                        <div className="flex-shrink-0 w-8 md:w-12 h-6 md:h-8 border-2 border-dashed border-slate-200 rounded-md md:rounded-xl" />
                                                    )}
                                                </div>

                                                {/* Removed flipped answer for a cleaner look */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Bottom Action Bar - Full Width Fixed Footer */}
                {cards.length > 0 && (
                    <div className="print:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 flex items-center justify-center gap-3">
                            {/* Reset/Clear Button */}
                            <button
                                onClick={resetConfig}
                                className="flex items-center gap-2 bg-white text-slate-600 px-5 py-3 md:py-4 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm md:text-base border border-slate-200 shadow-sm"
                                title="Limpar tudo e voltar ao topo"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Limpar</span>
                            </button>

                            {/* Export Button */}
                            <button
                                onClick={handlePrint}
                                className="flex-1 max-w-sm flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-3 md:py-4 rounded-2xl hover:bg-indigo-700 transition-all font-bold text-base md:text-lg shadow-lg shadow-indigo-100"
                            >
                                <Printer className="w-5 h-5" />
                                Imprimir
                            </button>
                        </div>
                    </div>
                )}

                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    * {
                        box-sizing: border-box !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0 auto;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 210mm !important;
                        height: auto !important;
                    }
                    .print-hidden, .no-print, header, nav, button, .fixed {
                        display: none !important;
                        visibility: hidden !important;
                        height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #flashcards-to-export {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .pdf-page {
                        display: block !important;
                        position: relative !important;
                        width: 210mm !important;
                        height: 296mm !important; /* 1mm shorter to avoid iOS spill */
                        margin: 0 auto !important;
                        padding: 0 !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        background: white !important;
                        overflow: hidden !important;
                    }
                    .pdf-page:last-child {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                    .flashcard-grid {
                        display: grid !important;
                        width: 210mm !important;
                        height: 296mm !important;
                        grid-template-columns: 105mm 105mm !important;
                        grid-template-rows: repeat(5, 59.2mm) !important;
                        background: white !important;
                        border: none !important;
                    }
                    .flashcard-item {
                        width: 105mm !important;
                        height: 59.2mm !important;
                        border-right: 1px dashed #ccc !important;
                        border-bottom: 1px dashed #ccc !important;
                        position: relative !important;
                    }
                }
            `}} />
            </div>
        </div>
    );
}
