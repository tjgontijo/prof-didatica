import React from 'react';
import Image from 'next/image';

type BonusItemProps = {
  title: string;
  description: string;
  image: string;
  value: string;
};

type BonusesProps = {
  bonusData: Array<{
    title: string;
    description: string;
    value: number;
    imagePath: string;
  }>;
};

const Bonus: React.FC<BonusItemProps> = ({ title, description, image, value }) => {
  const isVideo = image.endsWith('.mp4') || image.endsWith('.webm');
  const baseVideoPath = isVideo ? image.substring(0, image.lastIndexOf('.')) : '';

  return (
    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="relative w-full aspect-video">
        {isVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover rounded-t-lg"
          >
            <source src={`${baseVideoPath}.webm`} type="video/webm" />
            <source src={`${baseVideoPath}.mp4`} type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
        ) : (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="rounded-t-lg"
            loading="lazy"
          />
        )}
        <div className="absolute top-0 right-0 bg-emerald-800 text-white font-bold py-1 px-3 rounded-bl-lg">
          BÔNUS
        </div>
      </div>
      <div className="p-6 w-full text-center">
        <h3 className="text-xl font-bold text-[#1D3557] mb-2">{title}</h3>
        <p className="text-[#457B9D] mb-4">{description}</p>
        <div className="text-emerald-800 font-bold">
          Valor: <span className="line-through decoration-red-600 decoration-2 mr-2">{value}</span>
          <span className="text-emerald-800 font-bold">GRÁTIS</span>
        </div>
      </div>
    </div>
  );
};

const Bonuses: React.FC<BonusesProps> = ({ bonusData }) => {
  const bonusItems = bonusData.map(bonus => ({
    title: bonus.title,
    description: bonus.description,
    image: bonus.imagePath,
    value: `R$ ${bonus.value},00`
  }));

  return (
    <section id="bonuses" className="py-12 px-3 md:py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dl-primary-800 mb-4 uppercase">
            Você ainda recebe 2 BÔNUS EXCLUSIVOS
          </h2>
          <p className="text-lg text-dl-primary-500 max-w-3xl mx-auto">
            Além das 18 folhinhas de Pixel Art, eu separei 2 presentes que vão resolver sua aula de matemática pelo <span className="font-bold">ano inteiro</span>. <br />Se fossem vendidos separadamente <span className="font-bold">custariam R$ 55,00</span>, mas <span className="font-bold">hoje saem de graça no plano completo</span>.
          </p>
        </div>
        <div className="space-y-8 max-w-3xl mx-auto">
          {bonusItems.map((item, index) => (
            <Bonus
              key={index}
              title={item.title}
              description={item.description}
              image={item.image}
              value={item.value}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
