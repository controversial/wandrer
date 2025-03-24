import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

import path from 'path';


export default {
  reactStrictMode: true,
  sassOptions: {
    implementation: 'sass-embedded',
    loadPaths: [
      path.join(__dirname, 'src/'),
      path.join(__dirname, 'node_modules/'),
    ],
  },

  webpack: (config: Configuration) => {
    config.node = { __dirname: true };
    return config;
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackMemoryOptimizations: true,
  },
} satisfies NextConfig;
