import { defineConfig } from 'eslint/config';

import pluginReact from '@eslint-react/eslint-plugin';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReactHooks from 'eslint-plugin-react-hooks';


export default defineConfig(
  {
    name: 'Loading React plugins',

    plugins: {
      'jsx-a11y': pluginJsxA11y,
      'react-hooks': { rules: pluginReactHooks.rules },
    },
  },

  pluginReact.configs['strict-type-checked'],

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
