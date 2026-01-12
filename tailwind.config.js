/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		colors: {
		  primary: '#2563eb',      // Azul Tailwind padrão
		  secondary: '#6b7280',    // Cinza neutro
		  destructive: '#ef4444',  // Vermelho de erro
		  background: '#ffffff',   // Fundo branco
		  foreground: '#111827',   // Texto escuro
		  border: '#e5e7eb',       // Borda clara
		  input: '#f3f4f6',        // Fundo de input
		  ring: '#3b82f6',         // Azul de foco

		  // Sistema de cores unificado - Desafio Literário
		  'dl-primary': {
			50: '#f1faee',   // Background suave
			100: '#a8dadc',  // Border/accent suave
			200: '#88c5c8',  // Hover suave
			300: '#68b0b4',  // Estados intermediários
			400: '#569ba0',  //
			500: '#457B9D',  // Cor principal (botões secundários, títulos)
			600: '#3a6682',  // Hover escuro
			700: '#2f5167',  //
			800: '#1D3557',  // Azul escuro (títulos principais)
			900: '#162841',  // Fundo escuro
		  },
		  'dl-accent': {
			DEFAULT: '#10b981', // emerald-600 (CTAs principais)
			hover: '#059669',   // emerald-700
			dark: '#047857',    // emerald-800
		  },
		  'dl-warning': {
			DEFAULT: '#e63946', // Vermelho (badges urgentes)
		  },
		  'dl-success': {
			DEFAULT: '#16a34a', // green-600 (selos, garantia)
		  },
		},
		borderRadius: {
		  lg: '12px',
		  md: '10px',
		  sm: '8px'
		}
	  }
	},
	plugins: []
  }
  