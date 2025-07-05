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
		  ring: '#3b82f6'          // Azul de foco
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
  