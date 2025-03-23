import tseslint from 'typescript-eslint';

import pluginImportX from 'eslint-plugin-import-x';


const extensions = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'];

export default tseslint.config(
  {
    name: 'import-x/recommended (recreated)',
    plugins: { import: pluginImportX },
    rules: {
      // recommended
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/namespace': 'error',
      'import/default': 'error',
      'import/export': 'error',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-duplicates': 'warn',
    },
  },

  {
    name: 'import-x settings (global)',
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
      },
      'import-x/extensions': extensions,
      'import-x/resolver': { typescript: true },
    },
  },
);
