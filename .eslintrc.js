module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    }
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],

  rules: {
    'no-redeclare': 0,
    'no-unused-vars': 0,
    'react/display-name': 0,
    'no-inner-declarations': 0,
    'no-constant-condition': 0,
    'semi': ['error', 'never'],
    'react/no-direct-mutation-state': 2,
    'react/jsx-no-undef': [2, {allowGlobals: true}],
    '@typescript-eslint/no-redeclare': [2],
    '@typescript-eslint/no-unused-vars': [0, {args: 'none'}]
  },

  globals: {
    JSX: true,
    ENV: true,
    React: true,
    IUser: true,
    IRoute: true,
    ReactDOM: true,
    CacheDict: true,
    ResponseData: true,
    RecursivePartial: true,
  }
}
