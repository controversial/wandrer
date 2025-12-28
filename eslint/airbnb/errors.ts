import { defineConfig } from 'eslint/config';

export default defineConfig({
  rules: {
    // Different settings for rule getter-return in airbnb vs recommended:
    //   Airbnb => ["error",{"allowImplicit":true}]
    //   Recommended => "error"
    'getter-return': ['error', { allowImplicit: true }],
    'no-await-in-loop': 'error',
    // Different settings for rule no-cond-assign in airbnb vs recommended:
    //   Airbnb => ["error","always"]
    //   Recommended => "error"
    'no-cond-assign': ['error', 'always'],
    'no-console': 'warn',
    // Different settings for rule no-constant-condition in airbnb vs recommended:
    //   Airbnb => "warn"
    //   Recommended => "error"
    'no-constant-condition': 'warn',
    'no-inner-declarations': 'error',
    'no-promise-executor-return': 'error',
    'no-template-curly-in-string': 'error',
    'no-unreachable-loop': ['error', { ignore: [] }],
    // Different settings for rule no-unsafe-optional-chaining in airbnb vs recommended:
    //   Airbnb => ["error",{"disallowArithmeticOperators":true}]
    //   Recommended => "error"
    'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: true }],
    // Different settings for rule no-unused-private-class-members in airbnb vs recommended:
    //   Airbnb => "off"
    //   Recommended => "error"
    'no-unused-private-class-members': 'off',
    // Different settings for rule valid-typeof in airbnb vs recommended:
    //   Airbnb => ["error",{"requireStringLiterals":true}]
    //   Recommended => "error"
    'valid-typeof': ['error', { requireStringLiterals: true }],
  },
});
