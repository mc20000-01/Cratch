module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['**/node_modules/**', '**/dist/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-useless-escape': 'off',
  },
};
