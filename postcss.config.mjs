/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Use the explicit plugin
    autoprefixer: {},
  },
};

export default config;