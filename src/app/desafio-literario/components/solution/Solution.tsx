import { BookOpen, Printer, MessageCircle } from 'lucide-react';

export default function Solution() {
  const steps = [
    {
      title: 'Chega no seu WhatsApp',
      description:
        'O Kit Desafio Literário é 100% digital. Logo após a compra, você recebe tudo no WhatsApp e pode baixar quantas vezes quiser.',
      icon: MessageCircle,
    },
    {
      title: 'Você imprime',
      description:
        'Imprima só o que for usar. Dá pra aplicar com a turma inteira e reutilizar o material sempre que precisar.',
      icon: Printer,
    },
    {
      title: 'Hora da Leitura',
      description:
        'Agora sim. Seus alunos entram na dinâmica e a leitura fica mais leve, participativa e gostosa de acompanhar.',
      icon: BookOpen,
    },
  ];

  return (
    <section className="py-12 px-3 md:py-16 bg-dl-bg-lavender">
      <div className="container mx-auto px-3 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-8 border-b-2 border-dl-primary-100 pb-3 text-center uppercase">
          Como funciona o Kit Desafio Literário?
        </h2>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-xl bg-white p-4 md:p-5 shadow-sm border border-dl-primary-100"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-dl-primary-50 border border-dl-primary-100 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 text-dl-primary-800" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-dl-primary-800">{step.title}</h3>
                  <p className="text-base md:text-lg text-dl-primary-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
