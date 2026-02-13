import Hero from './components/hero/Hero';
import Problem from './components/problem/Problem';
import WhatsIncluded from './components/whats-included/WhatsIncluded';
import Solution from './components/solution/Solution';
import Demo from './components/demo/Demo';
import Bonuses from './components/bonuses/Bonuses';
import PlanBasic from './components/plans/PlanBasic';
import PlanFull from './components/plans/PlanFull';
import Results from './components/results/Results';
import Faq from './components/faq/Faq';
import Footer from './components/footer/Footer';

// Tipos centralizados
type PlanType = {
  originalPrice: number;
  promotionalPrice: number;
  discount: string;
  paymentLink: string;
};

type PlansDataType = {
  basic: PlanType;
  full: PlanType;
};

type Bonus = {
  title: string;
  description: string;
  value: number;
  imagePath: string;
};

// Links de pagamento (TODO: atualizar com links reais)
const PAYMENT_LINK_BASIC = 'https://seguro.profdidatica.com.br/r/9CVUCYXCWB';
const PAYMENT_LINK_FULL = 'https://seguro.profdidatica.com.br/r/SG7QX68CHY';

// Dados dos planos
const plansData: PlansDataType = {
  basic: {
    originalPrice: 18,
    promotionalPrice: 12,
    discount: '33% OFF',
    paymentLink: PAYMENT_LINK_BASIC
  },
  full: {
    originalPrice: 73, // Soma dos bônus (18 + 18 + 37 = 73)
    promotionalPrice: 17,
    discount: '77% OFF',
    paymentLink: PAYMENT_LINK_FULL
  }
};

// Dados dos bônus (Exclusivos para o Plano Completo)
const bonusData: Bonus[] = [
  {
    title: 'Versão Editável do Pixel Art',
    description: 'Personalize todas as continhas e adapte o material para o Fundamental II em segundos. Você no controle total da dificuldade.',
    value: 18,
    imagePath: '/images/products/operacoes-matematicas/lp/versao_editavel_demo_opt.mp4'
  },
  {
    title: 'Acesso à Fábrica de Continhas',
    description: 'Plataforma exclusiva que gera flashcards personalizados das 4 operações, por nível de dificuldade. Você escolhe, a plataforma gera, você imprime e aplica.',
    value: 37,
    imagePath: '/images/fabrica-de-continhas/fabrica_de_continhas_demo.mp4'
  }
];

export default function OperacoesMatematicasPage() {
  const bonusTotalValue = bonusData.reduce((acc, bonus) => acc + bonus.value, 0);
  const upsellAmount = plansData.full.promotionalPrice - plansData.basic.promotionalPrice;

  return (
    <main className="operacoes-matematicas-page bg-[#f1faee] min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <Hero />
        <Problem />
        <WhatsIncluded />
        <Solution />
        <Demo />
        <Bonuses bonusData={bonusData} />
        <PlanBasic planData={plansData.basic} bonusValue={bonusTotalValue} upsellAmount={upsellAmount} />
        <PlanFull planData={plansData.full} bonusData={bonusData} bonusValue={bonusTotalValue} />
        <Results />
        <Faq
          fullPlanPrice={plansData.full.promotionalPrice}
          paymentLink={plansData.full.paymentLink}
          bonusValue={bonusTotalValue}
        />
      </div>
      <Footer />
    </main>
  );
}
