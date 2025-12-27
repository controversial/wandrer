import config from '@luke/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['next-env.d.ts', '.next/**']),
  config,
);
