import { defineConfig } from 'eslint/config';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';

import nextPlugin from '@next/eslint-plugin-next';


export default defineConfig({
  name: 'eslint-config-next (recreated)',

  plugins: {
    '@next/next': fixupPluginRules({ rules: nextPlugin.rules }),
  },

  rules: {
    'import/no-anonymous-default-export': 'warn',
    'react/no-unknown-property': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'react/jsx-no-target-blank': 'off',

    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
    },
  },
});
