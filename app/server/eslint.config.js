const js = require('@eslint/js')
const globals = require('globals')
const tseslint = require('typescript-eslint')
const { globalIgnores } = require('eslint/config')

module.exports = tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {},
  },
])
