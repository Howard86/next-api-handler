const path = require('path');

/** @type{import('eslint').ESLint.ConfigData} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'packages/tsconfig/eslint.json',
    tsconfigRootDir: path.join(__dirname, '..', '..'),
  },
  env: { es6: true },
  ignorePatterns: ['node_modules', 'build', 'coverage'],
  plugins: ['import', 'eslint-comments', 'functional'],
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'next',
    'turbo',
    'prettier',
  ],
  globals: { BigInt: true, console: true, WebAssembly: true },
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
    'eslint-comments/no-unused-disable': 'error',
    'import/order': [
      'error',
      { 'newlines-between': 'always', alphabetize: { order: 'asc' } },
    ],
    'sort-imports': [
      'error',
      { ignoreDeclarationSort: true, ignoreCase: true },
    ],
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.tsx'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    },
    {
      files: ['**/*.js'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
};
