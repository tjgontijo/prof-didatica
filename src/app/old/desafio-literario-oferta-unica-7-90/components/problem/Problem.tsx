import Image from 'next/image';

export default function Problem() {
  return (
    <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
      <h2 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-6 border-b-2 border-[#a8dadc] pb-3 text-center uppercase">
        Você já passou por isso?
      </h2>

      <div className="max-w-2xl mx-auto text-left space-y-6">
        <p className="text-gray-800 text-xl mt-12 mb-6 leading-relaxed">
          Você entra na sala com tudo pronto. O livro foi escolhido com carinho, a atividade pensada
          nos mínimos detalhes. Há uma expectativa silenciosa de que, dessa vez, seus alunos se
          envolvam com a leitura.
        </p>

        <p className="text-gray-800 text-xl leading-relaxed">
          Mas assim que a aula começa, a realidade bate. Metade da turma nem abriu o livro. A outra
          metade finge que leu. E só dois ou três tentam participar.
        </p>

        <p className="text-gray-800 text-xl leading-relaxed">
          Você respira fundo, disfarça a frustração e tenta seguir com a aula. Mas lá dentro, vem a
          mesma sensação de sempre: <strong>o esforço não valeu.</strong>
        </p>

        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/products/missao-literaria/lp/prof.webp"
            alt="Professora cansada com turma agitada ao fundo"
            width={600}
            height={600}
            className="max-w-full rounded-lg shadow-md"
            style={{ width: '100%', height: 'auto' }}
          />
          <p className="text-gray-600 italic mt-2 text-center">
            Às vezes, o que pesa não é a aula. É a sensação de estar sozinha.
          </p>
        </div>

        <p className="text-gray-800 text-xl leading-relaxed">
          Porque não é a primeira vez. Você já tentou de tudo:{' '}
          <span className="font-semibold">leituras em grupo</span>,{' '}
          <span className="font-semibold">resumos</span>,{' '}
          <span className="font-semibold">dinâmicas criativas</span>. Mas no fim, a conexão
          simplesmente não acontece.
        </p>
        <p className="text-gray-800 text-xl leading-relaxed">
          E o que dói de verdade não é a aula que não funcionou. É a dúvida que vem depois:
        </p>
        <blockquote className="border-l-4 border-[#457B9D] text-xl pl-4 font-semibold mb-8 text-gray-800">
          &quot;Será que eu ainda estou fazendo diferença?&quot;
        </blockquote>

        <p className="text-gray-800 text-xl leading-relaxed">
          Porque você ama ensinar. Mas às vezes, no fundo, começa a duvidar se está sendo ouvida. Se
          vale a pena todo o esforço. Se algum aluno vai, de fato, lembrar do que você tentou fazer
          com tanto carinho e cuidado.
        </p>

        <p className="text-gray-800 text-xl leading-relaxed">
          A verdade é que o problema <span className="font-bold">não está em você</span>.
        </p>
        <blockquote className="border-l-4 border-[#457B9D] text-xl pl-4 font-semibold mb-8 text-gray-800">
          O que te faltava não era mais esforço. Era a ferramenta correta!
        </blockquote>

        <p className="text-xl text-[#457B9D] font-bold bg-[#f8f9fa] p-4 rounded-lg text-center">
          Um projeto capaz de transformar a leitura em diversão para seus alunos. Onde eles
          participam porque querem, não porque precisam. E você volta a enxergar o brilho nos olhos
          das crianças, e a sentir, no fundo, que está fazendo a diferença.
        </p>
      </div>
    </section>
  );
}
