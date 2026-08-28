/**
 * Runs every story as a test.
 *
 * The stories already describe each component's states in detail, so this
 * turns that existing work into a check rather than asking for a parallel
 * suite: each story is mounted in a real Chromium, its `play` function (where
 * one exists) is run, and any render error or a11y violation fails the run.
 *
 *   pnpm test          # once
 *   pnpm test:watch    # while working
 *
 * The preview configuration — the theme decorator above all — is applied by
 * `@storybook/addon-vitest` itself since Storybook 10.3, so there is no setup
 * file here calling `setProjectAnnotations`.
 */
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [storybookTest({ configDir: '.storybook' })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    // Charts measure their container and the pattern stories mount whole
    // applications; the default 5s is tight for the largest of them.
    testTimeout: 20000,
  },
})
