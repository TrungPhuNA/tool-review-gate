/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        paper: '#f7f5f3',
        surface: '#ffffff',
        surfaceSoft: '#fbfaf9',
        line: 'rgba(15,23,42,0.08)',
        accent: '#ef4444',
        accentSoft: '#fb7185',
        electric: '#4f46e5',
        muted: '#6b7280',
        softRose: '#fff1ef',
        softBlue: '#eef2ff',
        softMint: '#eefaf4',
        softGold: '#fff7e8',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'card': '1.5rem', // rounded-[1.5rem]
        'card-lg': '2rem', // rounded-[2rem]
        'panel': '2.2rem', // rounded-[2.2rem]
      },
      letterSpacing: {
        h1: '-0.07em',
        h2: '-0.045em',
        h3: '-0.03em',
      },
    },
  },
  plugins: [],
}
