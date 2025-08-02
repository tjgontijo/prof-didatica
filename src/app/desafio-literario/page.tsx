import Header from './components/header/Header';
import Hero from './components/hero/Hero';
import Proof from './components/proof/Proof';
import Solution from './components/solution/Solution';
import Results from './components/results/Results';
import Offer from './components/offer/Offer';
import Faq from './components/faq/Faq';
import Footer from './components/footer/Footer';
import FloatingCta from './components/buttons/FloatingCta';
import CheckoutPreload from './components/CheckoutPreload';

// Tipos centralizados
type Offer = {
  originalPrice: number;
  promotionalPrice: number;
  discount: string;
  paymentLink: string;
};

type Bonus = {
  title: string;
  description: string;
  value: number;
  imagePath: string;
};

const PAYMENT_LINK = 'https://seguro.profdidatica.com.br/r/NZL4JLXAYJ';
const CHECKOUT_DOMAIN = 'seguro.profdidatica.com.br';

const offerData: Offer = {
  originalPrice: 37,
  promotionalPrice: 17,
  discount: 'R$20 OFF',
  paymentLink: PAYMENT_LINK
};

const bonusData: Bonus[] = [
  {
    title: 'Produção de Frases e Texto',
    description: 'Apostila com 50 páginas para produção textual, perfeita para complementar suas aulas e desenvolver a escrita criativa dos alunos.',
    value: 27,
    imagePath: '/images/products/producao_frases_texto/Producao_frases_texto.webp'
  },
  {
    title: 'Textos para Missão Literária',
    description: '40 Textos com fonte Irineu desenvolvidos exclusivamente para utilizar com o desafio',
    value: 17,
    imagePath: '/images/products/textos-para-missao-literaria/cover/textos_missao_literaria_cover.webp'
  }
];

export default function MissaoLiterariaPage() {
  return (
    <main className="bg-[#f1faee]">
      <CheckoutPreload checkoutDomain={CHECKOUT_DOMAIN} />
      <Header />
      <div className="px-4 md:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        <Hero />
        <Proof />        
        <Solution />
        <Offer offerData={offerData} bonusData={bonusData} />
        <Results paymentLink={PAYMENT_LINK} />        
        <Faq />
      </div>
      <Footer />
      <FloatingCta paymentLink={PAYMENT_LINK} />
    </main>
  );
}
