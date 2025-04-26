import type { NextConfig } from 'next';
import path from 'node:path';
import type { Configuration } from 'webpack';

export default {
  reactStrictMode: true,
  sassOptions: {
    implementation: 'sass-embedded',
    loadPaths: [
      path.join(__dirname, 'src/'),
      path.join(__dirname, 'node_modules/'),
    ],
  },

  webpack(config: Configuration) {
    ((config.module ??= {}).rules ??= []).push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    return config;
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackMemoryOptimizations: true,
  },
} satisfies NextConfig;
