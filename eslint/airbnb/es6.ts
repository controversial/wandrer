import { defineConfig } from 'eslint/config';


export default defineConfig({
  rules: {
    'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
    '@typescript-eslint/no-dupe-class-members': 'error',
    'no-restricted-exports': ['error', { restrictedNamedExports: ['default', 'then'] }],
    'no-useless-computed-key': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-useless-rename': ['error', { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }],
    'no-var': 'error',
    'object-shorthand': ['error', 'always', { ignoreConstructors: false, avoidQuotes: true }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
    'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: true }],
    '@typescript-eslint/prefer-destructuring': ['error', { VariableDeclarator: { array: false, object: true }, AssignmentExpression: { array: true, object: false } }, { enforceForRenamedProperties: false }],
    'prefer-numeric-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'symbol-description': 'error',
  },
});
