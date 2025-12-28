/**
 * Generate & print modernized versions of each airbnb subconfig
 * - Moves compatible rules to typescript-eslint
 * - Comments rules that moved to stylistic plugin
 *   - new section holds all of the migrated rules
 * - Comments out rules that already come from js.configs.recommended
 * - Comments rules that are set to “off”
 * - Comments rules that are deprecated
 */
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { styleText } from 'node:util';
import eslintUnsafe from 'eslint/use-at-your-own-risk';

import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint, { type FlatConfig } from 'typescript-eslint';

// Load airbnb config as FlatConfig
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});
const airbnbFlat = compat.extends('eslint-config-airbnb');

// console.log(airbnbFlat);

function isOff(setting: typeof js.configs.recommended.rules[string] | undefined) {
  return setting === undefined || setting === 'off' || setting === 0 || (Array.isArray(setting) && (setting[0] === 'off' || setting[0] === 0));
}
const tseslintRecommendedRules = tseslint.configs.recommended.reduce<
  typeof js.configs.recommended.rules
>((acc, cfg) => {
  if (cfg.rules) return { ...acc, ...cfg.rules };
  return acc;
}, {});

airbnbFlat.forEach((cfg, i) => {
  if (!cfg.rules) return;
  console.log(styleText('cyan', `\n\nConfig #${i + 1} from airbnb:`));
  const entries = Object.entries(cfg.rules);
  entries.forEach(([rule, setting]) => {
    const tail = rule.split('/').at(-1);

    const hasTypescriptVersion = rule in ((tseslint.plugin as FlatConfig.Plugin).rules ?? {});
    const ruleNameToPrint = hasTypescriptVersion ? `@typescript-eslint/${rule}` : rule;

    const hasStylisticVersion = !!tail && tail in stylisticPlugin.rules;
    const ruleIsOff = isOff(setting);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isDeprecated = eslintUnsafe.builtinRules.get(rule)?.meta?.deprecated ?? false;
    const recommendedSetting = hasTypescriptVersion
      ? tseslintRecommendedRules[ruleNameToPrint]
      : js.configs.recommended.rules[rule];
    const inRecommended = !isOff(recommendedSetting);
    const divergesFromRecommended = inRecommended
      && JSON.stringify(setting) !== JSON.stringify(recommendedSetting);

    const problems = [
      hasStylisticVersion && '[stylistic]',
      ruleIsOff && !divergesFromRecommended && '[off]',
      isDeprecated && !hasStylisticVersion && '[deprecated]',
      inRecommended && !divergesFromRecommended && '[in recommended]',
    ].filter(Boolean).join(' ');

    if (divergesFromRecommended) {
      console.log(styleText(
        'blue',
        [
          `    // Different settings for rule ${rule} in airbnb vs recommended:`,
          `    //   Airbnb => ${JSON.stringify(setting)}`,
          `    //   Recommended => ${JSON.stringify(recommendedSetting)}`,
        ].join('\n'),
      ));
    }

    console.log(
      '  ',
      problems ? styleText('red', ` // ${problems}`) : '',
      `'${ruleNameToPrint}': ${JSON.stringify(setting)},`,
    );
  });
});


console.log(styleText('yellow', '\n\nrules moved to stylistic:'));
const allRuleEntries = airbnbFlat.flatMap((cfg) => (cfg.rules ? Object.entries(cfg.rules) : []));

const stylisticRules = allRuleEntries.flatMap(([rule, setting]) => {
  const tail = rule.split('/').at(-1);
  if (tail && tail in stylisticPlugin.rules) return [[`@stylistic/${tail}`, setting] satisfies [string, unknown]];
  return [];
});

stylisticRules.forEach(([rule, setting]) => {
  console.log(`    '${rule}': ${JSON.stringify(setting)},`);
});
