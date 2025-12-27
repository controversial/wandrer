import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

import { defineConfig } from 'eslint/config';
import tseslint, { type FlatConfig } from 'typescript-eslint';
import stylisticPlugin from '@stylistic/eslint-plugin';


// Load airbnb config as FlatConfig
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});
const airbnbFlat = compat.extends('eslint-config-airbnb');


// Process airbnb rules
const baseRuleEntries = airbnbFlat.flatMap((cfg) => (cfg.rules ? Object.entries(cfg.rules) : []));

// 1. Replace deprecated stylistic rules with rules from stylistic plugin
const ruleEntriesWithStylisticVersion = baseRuleEntries
  .map(([rule, setting]) => [rule.split('/').at(-1) ?? '', setting] as const)
  .filter(([rule]) => rule in stylisticPlugin.rules);

const stylisticPatchedRules = {
  ...Object.fromEntries(baseRuleEntries),
  ...stylisticPlugin.configs['disable-legacy'].rules,
  ...Object.fromEntries(ruleEntriesWithStylisticVersion.map(([rule, setting]) => [`@stylistic/${rule}`, setting])),
};

// 2. For typescript config, replace rules that have a typescript-eslint version
const ruleEntriesWithTsEslintVersion = baseRuleEntries
  .filter(([rule]) => rule in ((tseslint.plugin as FlatConfig.Plugin).rules ?? {}));
const typescriptPatchedRules = Object.fromEntries([
  ...ruleEntriesWithTsEslintVersion.map(([rule]) => [rule, 'off'] as const),
  ...ruleEntriesWithTsEslintVersion.map(([rule, setting]) => [`@typescript-eslint/${rule}`, setting] as const),
]);


export default defineConfig(
  // Base rules - patched to use stylistic plugin
  {
    plugins: { '@stylistic': stylisticPlugin },
    rules: stylisticPatchedRules,
  },

  // Use the @typescript-eslint version of any rule we can
  {
    rules: typescriptPatchedRules,
  },
);


// 3. Log deprecated rules
// import eslintUnsafe from 'eslint/use-at-your-own-risk';
// const deprecatedRules = Object.entries(stylisticPatchedRules).filter(([rule, setting]) => {
//   const isDisabled = (
//     setting === 'off' || setting === 0
//     || (Array.isArray(setting) && (setting[0] === 'off' || setting[0] === 0))
//   );
//   const isDeprecated = !!eslintUnsafe.builtinRules.get(rule)?.meta?.deprecated;

//   return !isDisabled && isDeprecated;
// });
