import Image from 'next/image';

export default function Proof() {
  return (
    <section className="mb-20 text-center">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#1D3557] mb-4">
          Professores como você já estão transformando suas aulas
        </h2>
        
        <p className="text-lg text-gray-700 mb-6">
          <span className="font-semibold">Resultados reais:</span> Alunos lendo mais e se apaixonando pela leitura!
        </p>
        
        <div className="max-w-2xl mx-auto">
          <Image 
            src="/images/products/missao-literaria/depoimentos/15.webp"
            alt="Depoimentos reais de professores que aplicaram o Missão Literária"
            width={600}
            height={400}
            style={{ width: '100%', height: 'auto' }}
            className="rounded-lg shadow-sm"
            priority
          />
        </div>
        
        <p className="mt-6 text-lg text-[#457B9D] font-medium">
          Resultados comprovados por centenas de professores.
        </p>
      </div>
    </section>
  );
}
