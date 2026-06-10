export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        doma: {
          black: '#101214',
          charcoal: '#171B1D',
          gold: '#B99555',
          bronze: '#8E7144',
          cream: '#F7F3EA',
          ivory: '#FFFCF6',
          line: '#E7DFD2'
        }
      },
      boxShadow: {
        soft: '0 18px 40px rgba(16,18,20,0.08)'
      }
    }
  },
  plugins: []
};
