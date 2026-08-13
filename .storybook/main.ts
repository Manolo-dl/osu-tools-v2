import type { StorybookConfig } from '@storybook/angular-vite';
import path from 'path/posix';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": {
    "name": "@storybook/angular-vite",
    "options": {
      "compodoc": true,
      "compodocArgs": [
        "-e",
        "json",
        "-d",
        "."
      ]
    }
  },
  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(__dirname, '../src/shared'),
      '@entities': path.resolve(__dirname, '../src/entities'),
      '@features': path.resolve(__dirname, '../src/features'),
      '@widgets': path.resolve(__dirname, '../src/widgets'),
      '@pages': path.resolve(__dirname, '../src/pages'),
    };
    return config;
  },
};
export default config;