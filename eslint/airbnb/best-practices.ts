import { defineConfig } from 'eslint/config';

/* eslint-disable @stylistic/max-len */
export default defineConfig({
  rules: {
    'array-callback-return': ['error', { allowImplicit: true }],
    'block-scoped-var': 'error',
    '@typescript-eslint/class-methods-use-this': ['error', { exceptMethods: [] }],
    '@typescript-eslint/consistent-return': 'error',
    curly: ['error', 'multi-line'],
    'default-case': ['error', { commentPattern: '^no default$' }],
    'default-case-last': 'error',
    '@typescript-eslint/default-param-last': 'error',
    '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'grouped-accessor-pairs': 'error',
    'guard-for-in': 'error',
    'max-classes-per-file': ['error', 1],
    'no-alert': 'warn',
    'no-caller': 'error',
    'no-constructor-return': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions', 'functions', 'methods'] }],
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    // Different settings for rule no-global-assign in airbnb vs recommended:
    //   Airbnb => ["error",{"exceptions":[]}]
    //   Recommended => "error"
    'no-global-assign': ['error', { exceptions: [] }],
    '@typescript-eslint/no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': 'error',
    '@typescript-eslint/no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['acc', 'accumulator', 'e', 'ctx', 'context', 'req', 'request', 'res', 'response', '$scope', 'staticContext'] }],
    'no-proto': 'error',
    '@typescript-eslint/no-redeclare': 'error',
    'no-restricted-properties': ['error', { object: 'arguments', property: 'callee', message: 'arguments.callee is deprecated' }, { object: 'global', property: 'isFinite', message: 'Please use Number.isFinite instead' }, { object: 'self', property: 'isFinite', message: 'Please use Number.isFinite instead' }, { object: 'window', property: 'isFinite', message: 'Please use Number.isFinite instead' }, { object: 'global', property: 'isNaN', message: 'Please use Number.isNaN instead' }, { object: 'self', property: 'isNaN', message: 'Please use Number.isNaN instead' }, { object: 'window', property: 'isNaN', message: 'Please use Number.isNaN instead' }, { property: '__defineGetter__', message: 'Please use Object.defineProperty instead.' }, { property: '__defineSetter__', message: 'Please use Object.defineProperty instead.' }, { object: 'Math', property: 'pow', message: 'Use the exponentiation operator (**) instead.' }],
    'no-return-assign': ['error', 'always'],
    'no-script-url': 'error',
    // Different settings for rule no-self-assign in airbnb vs recommended:
    //   Airbnb => ["error",{"props":true}]
    //   Recommended => "error"
    'no-self-assign': ['error', { props: true }],
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    // Different settings for rule no-unused-expressions in airbnb vs recommended:
    //   Airbnb => ["error",{"allowShortCircuit":false,"allowTernary":false,"allowTaggedTemplates":false}]
    //   Recommended => "error"
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: false, allowTernary: false, allowTaggedTemplates: false }],
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-void': 'error',
    '@typescript-eslint/prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
    'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
    radix: 'error',
    'vars-on-top': 'error',
    yoda: 'error',
  },
});
