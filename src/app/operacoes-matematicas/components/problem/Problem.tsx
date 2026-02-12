import Image from 'next/image';

export default function Problem() {
  return (
    <section className="pt-6 pb-16 px-3 md:py-16 bg-dl-bg-warm-cream">
      <div className="container mx-auto px-3 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-6 border-b-2 border-dl-primary-100 pb-3 text-center uppercase">
          A verdade que toda professora de matemática já sabe
        </h2>

        <div className="space-y-6 mt-8">
          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            Não adianta. Você pode explicar de novo, dar mais exemplos, mudar o tom de voz. Na hora de resolver as continhas, a reação é sempre a mesma: <span className="font-bold text-red-600 uppercase">caras fechadas, suspiros profundos e cadernos em branco.</span>
          </p>

          <div className="flex flex-col items-center my-8">
            <Image
              src="/images/products/missao-literaria/lp/prof.webp"
              alt="Professora frustrada com turma desatenta"
              width={600}
              height={600}
              className="max-w-full rounded-lg shadow-md"
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"
            />
          </div>

          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            O problema não é a criança. E não é você. <span className="font-bold text-dl-primary-800">O problema é o método.</span> Aquela folhinha com 30 continhas soltas, sem sentido, que transforma a matemática em castigo.
          </p>

          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            Estudos mostram que <span className="font-bold">30% das crianças</span> já sentem ansiedade só de ouvir a palavra "matemática". Esse bloqueio emocional reduz o desempenho em até 40%. Não é falta de capacidade — é o medo de errar que trava a criança.
          </p>

          <p className="text-gray-800 text-lg md:text-xl leading-relaxed bg-white p-4 rounded-lg border-l-4 border-dl-warning shadow-sm">
            Nós criamos um material que faz a criança resolver operações <span className="font-bold text-dl-primary-800">sem perceber que está praticando</span>. Ela só quer descobrir qual personagem vai aparecer.
          </p>
        </div>
      </div>
    </section>
  );
}
