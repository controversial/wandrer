/* eslint-disable @stylistic/no-multi-spaces */

import { defineConfig } from 'eslint/config';


export default defineConfig(
  {
    name: 'React stylistic',
    rules: {
      // enable extra rules
      '@stylistic/jsx-child-element-spacing': 'error',    // require clarifying spacing between text children and inline element children
      '@stylistic/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never', propElementValues: 'always' }], // wrap curly braces around expressions only where appropriate
      '@stylistic/jsx-function-call-newline': 'error',    // require newlines before/after jsx when used as an argument in a multiline function call
      // disable a couple
      '@stylistic/jsx-one-expression-per-line': 'off',    // Allow multiple JSX expressions on a line
      '@stylistic/jsx-props-no-multi-spaces': 'off',      // Allow 1–2 empty lines in between props. Note @stylistic/no-multi-spaces and @stylistic/no-multiple-empty-lines still catch the cases we care about
    },
  },
);
