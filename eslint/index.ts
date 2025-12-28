/* eslint-disable @stylistic/no-multi-spaces, @stylistic/max-len */

// Core
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import js from '@eslint/js';

// Configs
import airbnbConfig from './airbnb/index.js';
import nextConfig from './next.js';
import reactConfig from './react.js';
import jsxStylisticConfig from './jsx-stylistic.js';
import importConfig from './import.js';

import path from 'node:path';


export default defineConfig(
  // base settings
  globalIgnores(['**/node_modules/**', '**/generated/**', '**/dist/**', '**/.next/**', '**/rendered/**', '**/.vercel/**']),

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        projectService: true,
        tsconfigRootDir: path.dirname(import.meta.dirname),
      },
    },
  },

  // recommended configs
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  // airbnb rules
  airbnbConfig,
  reactConfig,
  importConfig,
  nextConfig,
  jsxStylisticConfig,

  // Luke overrides rules
  {
    rules: {
      'no-underscore-dangle': 'off',                                               // Allow names like _a
      'no-empty': ['error', { allowEmptyCatch: true }],                            // Allow empty blocks when it's for a catch statement
      'prefer-const': ['error', { destructuring: 'all' }],                         // For destructured declarations where only some variables get reassigned, don’t require const for the others
      'no-continue': 'off',                                                        // Allow continue statements
      'no-restricted-exports': ['error', { restrictedNamedExports: ['then'] }],    // Allow `export { default }` syntax
      'max-classes-per-file': 'off',                                               // Allow more than one class per file
      'no-nested-ternary': 'off',                                                  // Allow nested ternary expressions

      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],   // Allow importing devDependencies
      'import/no-webpack-loader-syntax': 'off',                                    // Allow webpack loader syntax (with !)
      'import/newline-after-import': 'off',                                        // Allow code right after import statements
      'import/order': 'off',                                                       // Allow importing modules in any order
      'import/extensions': 'off',                                                  // Allow importing modules without specifying extensions
      'import/no-anonymous-default-export': ['error', { allowObject: true, allowArray: true }],
      'import/no-named-as-default': 'off',                                         // too many false positives for packages like react, zod, classNames - https://github.com/import-js/eslint-plugin-import/issues/1594
      'import/prefer-default-export': 'off',                                       // Allow modules to have a single named export

      '@stylistic/object-curly-newline': ['error', { consistent: true }],          // Either both braces have newlines or neither does
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 0 }], // Allow up to 2 empty lines in a row
      '@stylistic/lines-between-class-members': 'off',                             // Allow omitting an empty line between class members
      // '@stylistic/indent-binary-ops': ['error', 2],
      '@stylistic/type-generic-spacing': 'error',
      '@stylistic/type-named-tuple-spacing': 'error',
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        ignoredNodes: ['JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
        ignoreComments: false,
        tabLength: 4,
        // the following are overridden:
        offsetTernaryExpressions: true,
        flatTernaryExpressions: true,
      }],
    },
  },


  // typescript overrides
  {
    rules: {
      // Rules specific to typescript
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignorePrimitives: { string: true, boolean: true } }],
      '@typescript-eslint/no-unsafe-type-assertion': 'error', // type assertion can only be used to broaden types, not to (unsafely) narrow them
      '@typescript-eslint/no-non-null-assertion': 'error', // no non-null assertions
      'no-void': 'off',
      '@typescript-eslint/require-array-sort-compare': 'error',

      // Work around rules that have actual conflicts in typescript
      'no-undef': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',

      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
          // new entries:
          enums: 'always-multiline',
          generics: 'always-multiline',
          tuples: 'always-multiline',
        },
      ],

      // false positives in cases involving “void” or “never”
      // type system catches consistent-return issues
      '@typescript-eslint/consistent-return': 'off',

      // Allow implicit number -> string in template literals
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowAny: false, allowBoolean: true, allowNullish: false, allowNumber: true, allowRegExp: false, allowNever: false },
      ],

      '@typescript-eslint/no-deprecated': 'error',

      // naming conventions
      camelcase: 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },

        // functions can be PascalCase because they can be react components
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: ['variable', 'variableLike'],
          types: ['function'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },

        // types
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // T for type parameters
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          suffix: ['T'],
        },
        // be permissive of object properties, which sometimes come from outside our control
        {
          selector: ['property'],
          format: null,
        },
      ],
    },
  },

  // Allow unused variables in definition files
  {
    files: ['**/*.d.ts'],

    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
);
