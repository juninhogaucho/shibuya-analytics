/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        foreground: 'var(--color-text)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        muted: 'var(--color-text-muted)',
        border: 'var(--color-border)',
      }
    },
  },
  plugins: [],
}
