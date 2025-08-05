import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#2c4f71] py-2 flex justify-center items-center shadow-md">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Logo Prof Didática"
          width={100}
          height={40}
          className="py-1"
          style={{ height: 'auto' }}
        />
      </header>

      {/* Main Content */}
      <main className="bg-[#fffaf3] flex-1 flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-md flex flex-col gap-6">
          <Link
            href="https://profdidatica.com.br/operacoes-matematicas-em-pixel-art-divertidamente/p"
            className="w-full transform transition-transform duration-300 hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/link-bio/banner_pixel.webp"
                alt="Banner Pixel"
                width={540}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </Link>

          <Link
            href="/missao-literaria"
            className="w-full transform transition-transform duration-300 hover:scale-105"
          >
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/link-bio/banner_projeto.webp"
                alt="Banner Projeto"
                width={540}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </Link>

          <Link
            href="https://api.whatsapp.com/send?phone=551148635262&text=Ol%C3%A1,%20vim%20do%20instagram%20"
            className="w-full transform transition-transform duration-300 hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/link-bio/banner_suporte.webp"
                alt="Banner Suporte"
                width={540}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </Link>

          <Link
            href="https://profdidatica.com.br/?utm_source=instagram&utm_medium=link_bio&utm_campaign=nossa_loja"
            className="w-full transform transition-transform duration-300 hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Image
                src="/images/link-bio/banner_loja.webp"
                alt="Banner Loja"
                width={540}
                height={180}
                className="w-full h-auto"
              />
            </div>
          </Link>
        </div>
      </main>

      <footer className="bg-[#2c4f71] py-3 text-center text-sm text-gray-100">
        &copy; {new Date().getFullYear()} Prof Didática - Todos os direitos reservados
      </footer>
    </div>
  );
}
