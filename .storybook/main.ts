import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: config => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      // maplibre-gl loads its tile parser in a Web Worker. Run through Vite's
      // dependency pre-bundler that worker is rewritten in a way that leaves it
      // unable to fetch, so the map renders its chrome and attribution and then
      // silently never requests a single tile. Excluding it makes the worker
      // load from source, where it behaves.
      //
      // Story-only: the published package does not touch maplibre.
      exclude: [...(config.optimizeDeps?.exclude ?? []), 'maplibre-gl'],
    },
  }),
  typescript: {
    // react-docgen reads the JSDoc above each prop, which is what fills the
    // controls table — the doc comments in the components are load-bearing.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: prop => !prop.parent?.fileName.includes('node_modules'),
    },
  },
}

export default config
