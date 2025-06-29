/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xsx': '870px',   
      },
      colors: {
        'custom-back-grey':'#6d5700e7', 
        'custom-blue': '#001433',
      },
      fontSize: {
        'custom-sz': '25px',
        'custom-size': '20px',
      },
      boxShadow: {
        'custom-light': '0px 0px 2px rgb(0, 30, 65)', 
        'custom-create': '0px 0px 5px rgb(0, 30, 65)',
        'custom-dark': '0px 0px 5px rgb(0, 30, 65, 0.488 )',
      },
    },
  },
  plugins: [],
}

