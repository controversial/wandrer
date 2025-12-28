import { defineConfig } from 'eslint/config';


export default defineConfig({
  rules: {
    'no-label-var': 'error',
    'no-restricted-globals': ['error', { name: 'isFinite', message: 'Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite' }, { name: 'isNaN', message: 'Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan' }, 'addEventListener', 'blur', 'close', 'closed', 'confirm', 'defaultStatus', 'defaultstatus', 'event', 'external', 'find', 'focus', 'frameElement', 'frames', 'history', 'innerHeight', 'innerWidth', 'length', 'location', 'locationbar', 'menubar', 'moveBy', 'moveTo', 'name', 'onblur', 'onerror', 'onfocus', 'onload', 'onresize', 'onunload', 'open', 'opener', 'opera', 'outerHeight', 'outerWidth', 'pageXOffset', 'pageYOffset', 'parent', 'print', 'removeEventListener', 'resizeBy', 'resizeTo', 'screen', 'screenLeft', 'screenTop', 'screenX', 'screenY', 'scroll', 'scrollbars', 'scrollBy', 'scrollTo', 'scrollX', 'scrollY', 'self', 'status', 'statusbar', 'stop', 'toolbar', 'top'],
    '@typescript-eslint/no-shadow': 'error',
    'no-undef-init': 'error',
    // Different settings for rule no-unused-vars in airbnb vs recommended:
    //   Airbnb => ["error",{"vars":"all","args":"after-used","ignoreRestSiblings":true}]
    //   Recommended => "error"
    '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
    '@typescript-eslint/no-use-before-define': ['error', { functions: true, classes: true, variables: true }],
  },
});
