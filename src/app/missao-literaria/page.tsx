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

const PAYMENT_LINK = 'https://seguro.profdidatica.com.br/r/HDJYH7SZJ6?promocode=ML30OFF';
const CHECKOUT_DOMAIN = 'seguro.profdidatica.com.br';

const offerData: Offer = {
  originalPrice: 17,
  promotionalPrice: 12,
  discount: '30% OFF',
  paymentLink: PAYMENT_LINK
};

export default function MissaoLiterariaPage() {
  return (
    <main className="bg-[#f1faee]">
      <CheckoutPreload checkoutDomain={CHECKOUT_DOMAIN} paymentLink={PAYMENT_LINK} />
      <Header />
      <div className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <Hero />
        <Proof />
        <Solution />
        <Offer offerData={offerData} />
        <Results paymentLink={PAYMENT_LINK} />        
        <Faq />
      </div>
      <Footer />
      <FloatingCta paymentLink={PAYMENT_LINK} />
    </main>
  );
}
