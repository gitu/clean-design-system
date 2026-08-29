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
  // The shadcn-compatible registry is served from the root of the docs site, so
  // `https://<host>/r/button.json` is a real URL that the shadcn CLI can install
  // from. It is generated from src/ by scripts/build-registry.mjs, which both
  // the `storybook` and `build-storybook` scripts run first.
  staticDirs: [{ from: '../registry', to: '/' }],
  viteFinal: config => ({
    ...config,
    optimizeDeps: {
      ...config.optimizeDeps,
      // maplibre-gl works out its own worker URL at runtime, which no bundler
      // can follow statically. Excluding it from the pre-bundler leaves it
      // loading from node_modules in dev, where the worker sits on disk beside
      // the library and resolves.
      //
      // That only ever fixed the dev server: `optimizeDeps` does nothing for
      // `vite build`, so the deployed Storybook shipped with no worker at all
      // and asked for zero tiles while looking like a working map. The fix that
      // covers both is `?worker&url` in `src/stories/RouteMap.tsx`. This stays
      // because it is verified working and removing it is not.
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
