module.exports = {
  extends: [
    'prettier',
    'prettier/standard',
    'prettier/react',
    'plugin:react/recommended',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  parser: 'babel-eslint',
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
};
