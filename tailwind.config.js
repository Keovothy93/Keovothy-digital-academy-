/**
 * Tailwind CSS v3 build configuration (production build replaces the old
 * `cdn.tailwindcss.com` runtime script). Colour palette and fonts are
 * identical to the original site — nothing was re-tinted.
 */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#D4AF37', light: '#F3E5AB', dark: '#AA8C2C' },
        dark: { bg: '#030303', card: '#080808', border: '#1a1a1a' },
      },
      fontFamily: {
        sans: ['Hanuman', 'Noto Sans Khmer', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
      },
    },
  },
  corePlugins: {
    // Custom cursor / scrollbar / grain styles live in src/site.css
    preflight: true,
  },
  plugins: [],
};
