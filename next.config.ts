import type { NextConfig } from 'next';
import path from 'node:path';


export default {
  reactStrictMode: true,
  sassOptions: {
    implementation: 'sass-embedded',
    loadPaths: [
      path.join(__dirname, 'src/'),
      path.join(__dirname, 'node_modules/'),
    ],
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackMemoryOptimizations: true,
  },
} satisfies NextConfig;
