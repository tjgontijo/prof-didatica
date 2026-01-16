import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.yampi.me',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [100, 75],
    formats: ['image/avif', 'image/webp'],
  },

  // Otimizações de performance Next.js 15/16
  experimental: {
    // Controle de cache do Router Cache
    staleTimes: {
      dynamic: 30,  // Cache de rotas dinâmicas por 30s
      static: 180,  // Cache de rotas estáticas por 3min
    },

    // Tree shaking otimizado para bibliotecas grandes
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'framer-motion',
      '@heroicons/react',
    ],
  },

  // Compressão habilitada
  compress: true,

  // Headers de performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Preconnect ao checkout para navegação mais rápida
          {
            key: 'Link',
            value: '<https://seguro.profdidatica.com.br>; rel=preconnect',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
