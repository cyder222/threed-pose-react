module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['react', 'jsx-a11y', 'import', 'prettier', '@typescript-eslint'],
  globals: {},
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    // v4 changes
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // React
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/prop-types': ['off', {}],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    // import
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    // prettier
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
      },
    },
    'import/extensions': ['.js', '.ts', '.mjs', '.jsx', '.tsx'],
  },
};
