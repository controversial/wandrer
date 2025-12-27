import { defineConfig } from 'eslint/config';

import pluginReact from 'eslint-plugin-react';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReactHooks from 'eslint-plugin-react-hooks';


export default defineConfig(
  {
    name: 'Loading React plugins',

    plugins: {
      'jsx-a11y': pluginJsxA11y,
      react: pluginReact,
      'react-hooks': { rules: pluginReactHooks.rules },
    },
  },

  {
    ...(
      pluginReact.configs.flat.recommended ?? (() => { throw new Error('can’t find config `react/recommended`'); })()
    ),
    name: 'react/recommended',
  },

  {
    name: 'jsx-a11y/recommended',
    rules: { ...pluginJsxA11y.flatConfigs.recommended.rules },
  },

  {
    name: 'react-hooks/recommended',
    rules: {
      ...pluginReactHooks.configs['recommended-latest'].rules,
    },
  },
);
