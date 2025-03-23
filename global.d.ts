type RuleModule = import('eslint').Rule.RuleModule;
type RulesRecord = import('@typescript-eslint/utils/ts-eslint').FlatConfig.Rules;

declare module '@next/eslint-plugin-next' {
  const rules: Record<string, RuleModule>;
  const configs: {
    recommended: { rules: RulesRecord };
    'core-web-vitals': { rules: RulesRecord };
  };
  export { rules, configs };
}

declare module 'eslint-plugin-jsx-a11y' {
  const rules: Record<string, import('eslint').Rule.RuleModule>;
  const flatConfigs: {
    recommended: { rules: RulesRecord };
  };
  export { rules, flatConfigs };
}
