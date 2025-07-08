import Image from 'next/image';

export default function Results() {
  return (
    <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-8 border-b-2 border-[#a8dadc] pb-3 uppercase text-center">
        Resultados comprovados
      </h2>
      <div className="bg-[#f8f9fa] p-6 rounded-lg mb-8">
        <div className="space-y-5">
          <div className="flex gap-3 items-center">
            <div className="text-xl min-w-[30px]">✅</div>
            <p className="text-xl text-gray-800 mb-4">
              <strong>94,57%</strong> dos professores que aplicaram o Projeto Missão Literária relatam que seus alunos passaram a ler mais, inclusive aqueles que diziam não gostar de ler.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-xl min-w-[30px]">📈</div>
            <p className="text-xl text-gray-800 mb-4">
              O número médio de livros lidos por turma <strong>mais do que triplicou</strong> em apenas um mês após a aplicação do Projeto Missão Literária.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="text-xl min-w-[30px]">🏆</div>
            <p className="text-xl text-gray-800 mb-4">
              Uma metodologia prática e testada com sucesso por mais de <strong>8 mil professores</strong>.
            </p>
          </div>
        </div>
      </div>
      
      <h3 className="font-bold text-xl text-gray-800 mb-6 text-center border-b border-[#a8dadc] pb-3">
        💬 Veja o que estão dizendo:
      </h3>
      
      <div className="flex flex-col gap-6 items-center">
        {/* Prints de WhatsApp e comentários do Instagram em formato vertical */}
        {[...Array(14)].map((_, index) => {
          const imageNumber = (index + 1).toString().padStart(2, '0');
          return (
            <div key={imageNumber} className="w-full max-w-md">
              <Image 
                src={`/images/products/missao-literaria/depoimentos/${imageNumber}.webp`}
                alt={`Depoimento ${index + 1} de professor(a) sobre o Missão Literária`}
                width={400}
                height={0}
                sizes="(max-width: 768px) 100vw, 400px"
                style={{ width: '100%', height: 'auto' }}
                className="rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
      
      {/* Frase instigante para antecipar a seção de oferta */}
      <p className="mt-10 text-center text-xl md:text-2xl font-bold text-[#1D3557]">
        Chegou a hora de ter acesso ao <span className="text-[#e63946]">mesmo material</span> e transformar seus alunos em <span className="text-[#e63946]">leitores apaixonados!</span>
      </p>
    </section>
  );
}
