/**
 * Generate & print modernized versions of each airbnb subconfig
 * - Comments rules that moved to stylistic plugin
 * - Comments out rules that already come from js.configs.recommended
 * - Comments rules that are set to “off”
 * - Comments rules that are deprecated
 */
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { styleText } from 'node:util';
import eslintUnsafe from 'eslint/use-at-your-own-risk';

import stylisticPlugin from '@stylistic/eslint-plugin';

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

airbnbFlat.forEach((cfg, i) => {
  if (!cfg.rules) return;
  console.log(styleText('cyan', `\n\nConfig #${i} from airbnb:`));
  const entries = Object.entries(cfg.rules);
  entries.forEach(([rule, setting]) => {
    const tail = rule.split('/').at(-1);

    const hasStylisticVersion = !!tail && tail in stylisticPlugin.rules;
    const ruleIsOff = isOff(setting);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isDeprecated = eslintUnsafe.builtinRules.get(rule)?.meta?.deprecated ?? false;
    const inRecommended = !isOff(js.configs.recommended.rules[rule]);
    const divergesFromRecommended = inRecommended
      && JSON.stringify(setting) !== JSON.stringify(js.configs.recommended.rules[rule]);

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
          `    //   Recommended => ${JSON.stringify(js.configs.recommended.rules[rule])}`,
        ].join('\n'),
      ));
    }

    console.log(
      '  ',
      problems ? styleText('red', ` // ${problems}`) : '',
      `'${rule}': ${JSON.stringify(setting)},`,
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
