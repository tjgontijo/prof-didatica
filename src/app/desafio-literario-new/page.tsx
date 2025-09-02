import Header from './components/header/Header';
import Hero from './components/hero/Hero';
import Demo from './components/demo/Demo';
import Benefits from './components/benefits/Benefits';
import CtaUrgency from './components/cta-urgency/CtaUrgency';
import Fit from './components/fit/Fit';
import WhatsIncluded from './components/whats-included/WhatsIncluded';
import Bonuses from './components/bonuses/Bonuses';
import Results from './components/results/Results';
import Plans from './components/plans/Plans';
import Faq from './components/faq/Faq';
import Footer from './components/footer/Footer';

// Tipos centralizados
type PlansType = {
  originalPrice: number;
  promotionalPrice: number;
  discount: string;
  paymentLink: string;
  basicPaymentLink: string;
};

type Bonus = {
  title: string;
  description: string;
  value: number;
  imagePath: string;
};

const PAYMENT_LINK = 'https://seguro.profdidatica.com.br/r/NZL4JLXAYJ';

const offerData: PlansType = {
  originalPrice: 88,
  promotionalPrice: 20,
  discount: 'R$68 OFF',
  paymentLink: PAYMENT_LINK,
  basicPaymentLink: 'https://seguro.profdidatica.com.br/r/BASICO12'
};

const bonusData: Bonus[] = [
  {
    title: 'Produção de Frases e Texto',
    description: 'Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos.',
    value: 27,
    imagePath: '/images/products/producao_frases_texto/Producao_frases_texto.webp'
  },
  {
    title: 'Histórias para Desafio Literário',
    description: '40 Textos com fonte Irineu desenvolvidos exclusivamente para utilizar com o desafio',
    value: 17,
    imagePath: '/images/products/textos-para-missao-literaria/cover/textos_missao_literaria_cover.webp'
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
        <Bonuses />
        <Plans offerData={offerData} bonusData={bonusData} />
        <Results paymentLink={offerData.paymentLink} />
        <Faq />
      </div>
      <Footer />
    </main>
  );
}
