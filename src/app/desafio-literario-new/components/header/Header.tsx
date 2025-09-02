import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full bg-[#2c4f71] h-[70px] md:h-auto flex items-center justify-center">
      <div className="flex justify-center items-center">
        <Image
          src="/images/system/logo_transparent.webp"
          alt="Prof Didática"
          width={65}
          height={65}
          priority
          className="h-auto w-auto max-h-[65px] md:max-h-[65px]"
        />
      </div>
    </header>
  );
}
