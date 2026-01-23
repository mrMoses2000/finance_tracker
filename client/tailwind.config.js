/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'fill-[#0d9488]',
    'fill-[#16a34a]',
    'fill-[#e11d48]',
    'fill-[#f59e0b]',
    'fill-[#64748b]',
    'fill-[#ea580c]',
    'fill-[#7c3aed]',
    'fill-[#3b82f6]',
    'fill-[#db2777]',
    'fill-[#10b981]',
    'fill-[#22c55e]'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-sans)'],
        serif: ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
}
