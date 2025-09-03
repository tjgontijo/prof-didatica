import Header from './components/header/Header';
import Hero from './components/hero/Hero';
import Demo from './components/demo/Demo';
import Benefits from './components/benefits/Benefits';
import CtaUrgency from './components/cta-urgency/CtaUrgency';
import Fit from './components/fit/Fit';
import WhatsIncluded from './components/whats-included/WhatsIncluded';
import Bonuses from './components/bonuses/Bonuses';
import Results from './components/results/Results';
import PlanBasic from './components/plans/PlanBasic';
import PlanFull from './components/plans/PlanFull';
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

// Links de pagamento
const PAYMENT_LINK_FULL = 'https://seguro.profdidatica.com.br/r/D6B9TPX140';
const PAYMENT_LINK_BASIC = 'https://seguro.profdidatica.com.br/r/NZL4JLXAYJ';

// Dados dos planos separados por tipo
const plansData: PlansDataType = {
  basic: {
    originalPrice: 18,
    promotionalPrice: 12,
    discount: '33% OFF',
    paymentLink: PAYMENT_LINK_BASIC
  },
  full: {
    originalPrice: 76,
    promotionalPrice: 18,
    discount: '76% OFF',
    paymentLink: PAYMENT_LINK_FULL
  }
};

const bonusData: Bonus[] = [
  {
    title: '40 Historinhas Exclusivas para o Desafio Literário',
    description: 'Coletânea com 40 histórias curtas e envolventes, ideais para alunos em diferentes níveis de leitura.',
    value: 17,
    imagePath: '/images/products/historias-missao-literaria/bonus_cover.webp'
  },
  {
    title: 'Kit de Certificados Personalizáveis',
    description: '3 modelos de certificados coloridos e editáveis para celebrar as conquistas dos seus alunos.',
    value: 12,
    imagePath: '/images/products/certificado/bonus_cover.webp'
  },
  {
    title: 'Guia Prático de Motivação à Leitura',
    description: '25 estratégias testadas e aprovadas para despertar o interesse pela leitura em alunos do Fundamental I e II.',
    value: 17,
    imagePath: '/images/products/guia-pratico-de-motivacao-a-leitura/bonus_cover.webp'
  },
  {
    title: 'Apostila Completa para Produção Textual',
    description: '50 páginas estruturadas para desenvolver habilidades de escrita, desde frases simples até textos completos.',
    value: 12,
    imagePath: '/images/products/producao_frases_texto/bonus_cover.webp'
  }
];

export default function DesafioLiterarioPage() {
  return (
    <main className="bg-[#f1faee]">
      <Header />
      <div className="px-4 md:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <Hero />
        <Demo />
        <Benefits />
        <CtaUrgency />
        <Fit />
        <WhatsIncluded />
        <Bonuses bonusData={bonusData} />
        <PlanBasic planData={plansData.basic} />
        <PlanFull planData={plansData.full} bonusData={bonusData} />
        <Results />
        <Faq />
      </div>
      <Footer />
    </main>
  );
}
