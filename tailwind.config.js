/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fecdd9',
          300: '#fda4ba',
          400: '#fb7094',
          500: '#f43f6b',
          600: '#e11d55',
          700: '#be0a42',
          800: '#970a39',
          900: '#7a0c33'
        }
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0,0,0,0.08)'
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: [],
}
