import { defineConfig } from 'eslint/config';

import bestPractices from './best-practices';
import errors from './errors';
import stylistic from './stylistic';
import variables from './variables';
import es6 from './es6';

export default defineConfig(
  bestPractices,
  errors,
  stylistic,
  variables,
  es6,
);
