export default function Solution() {
  return (
    <section className="bg-white rounded-lg shadow-lg p-8 mb-20">
      <div className="relative mb-10">
        <div className="absolute -top-3 left-4 bg-[#a8dadc] text-[#1D3557] px-4 py-1 rounded-full text-sm font-medium">
          Imagine só...
        </div>
        <h2 className="text-2xl md:text-3xl  text-[#1D3557] p-6 bg-[#f8f9fa] rounded-lg shadow-md border-2 border-dashed border-[#a8dadc]">
          <span className="italic">
            Seus alunos pedindo pra contar o que leram, disputando pra ser o próximo a apresentar, e
            você apenas acompanhando tudo com gratidão e leveza.
          </span>
          <span className="absolute -right-2 -bottom-2 text-3xl">💭</span>
        </h2>
      </div>
      <div className="flex flex-col gap-8 items-center mb-6">
        <p className="text-gray-800 text-xl mb-4 leading-relaxed">
          Aquele aluno que dizia que ler é chato, agora chega animado pra mostrar a ficha toda
          preenchida.
        </p>
        <p className="text-gray-800 text-xl mb-4 leading-relaxed">
          A turma inteira acompanhando a estante de leitura, comemorando cada livro colorido como
          uma pequena conquista.
        </p>
        <p className="text-gray-800 text-xl mb-4 leading-relaxed">
          E você, sem precisar montar tudo do zero, vendo a leitura acontecer com envolvimento real,
          e sentindo orgulho por ter feito isso acontecer.
        </p>
      </div>
      <div className="flex flex-col gap-8 items-center mb-6">
        <p className="text-gray-800 text-xl mb-4 leading-relaxed">
          Enquanto isso, seus alunos vão desenvolvendo habilidades que vão além do conteúdo:
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">📖</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Criam naturalmente o gosto e o hábito pela leitura
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">🔍</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Ampliam vocabulário, interpretação e pensamento crítico
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        {' '}
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">✨</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Estimulam criatividade e imaginação com histórias envolventes
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">✏️</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Aprimoram a escrita de forma natural e conectada com o que leram
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">🏆</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Participam de uma competição saudável que os motiva a continuar
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-5 rounded-lg border-l-4 border-[#6bbbed] shadow-md mb-4">
        <div className="flex flex-rol items-center space-y-3">
          <div className="text-3xl text-[#457B9D] mr-2">🔥</div>
          <p className="font-bold text-lg text-[#1D3557] text-left">
            Engajam mais nas aulas, com mais autonomia e interesse
          </p>
        </div>
      </div>
    </section>
  );
}
