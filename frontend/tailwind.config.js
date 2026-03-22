/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#020617',
        panel: '#0f172a',
        panelSoft: '#172554',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.2), 0 24px 80px rgba(14, 165, 233, 0.18)',
        panel: '0 24px 80px rgba(2, 6, 23, 0.45)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top, rgba(34,211,238,0.22), transparent 32%), radial-gradient(circle at 85% 18%, rgba(59,130,246,0.18), transparent 26%), radial-gradient(circle at bottom left, rgba(14,165,233,0.14), transparent 28%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
