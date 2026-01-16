import Image from 'next/image';

export default function Problem() {
  return (
    <section className="pt-6 pb-16 px-3 md:py-16 bg-dl-bg-warm-cream">
      <div className="container mx-auto px-3 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-6 border-b-2 border-dl-primary-100 pb-3 text-center uppercase">
          Está difícil fazer seus alunos se interessarem pela leitura?
        </h2>

        <div className="space-y-6 mt-8">
          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            Com tanta tela, vídeo curto e estímulo o tempo todo, é comum ver alunos com pouca paciência
            para ler. A leitura acaba virando "tarefa", e não um momento prazeroso.
          </p>

          <div className="flex flex-col items-center my-8">
            <Image
              src="/images/products/missao-literaria/lp/prof.webp"
              alt="Professora cansada com turma agitada ao fundo"
              width={600}
              height={600}
              className="max-w-full rounded-lg shadow-md"
              style={{ width: '100%', height: 'auto' }}
              loading="lazy"
            />
          </div>

          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            Para ajudar professores do Fundamental I e II a mudar isso de um jeito leve, nós criamos o
            Kit Desafio Literário.
          </p>
          <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
            O material foi pensado para transformar a leitura em uma dinâmica gostosa de acompanhar,
            com recursos visuais e participação da turma. Você imprime e aplica na próxima aula, sem
            precisar criar nada do zero.
          </p>
        </div>
      </div>
    </section>
  );
}
