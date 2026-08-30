/**
 * Stands in for `storybook/test` when the stories are built as applications.
 *
 * Six of the pattern stories import `within`, `userEvent` and `expect` at the
 * top level for their `play` functions. Nothing here ever runs a `play` — these
 * are demos, not tests — but a top-level import is a top-level import, so
 * without this alias every one of those six pages would ship the whole
 * interaction-testing runtime to a browser that has no use for it.
 *
 * The functions throw rather than no-op. If a `play` ever does end up on this
 * path, a loud failure is the only honest outcome; silently passing assertions
 * would be worse than the bundle.
 */
const unavailable = (name: string) => (): never => {
  throw new Error(
    `storybook/test is not available in the example builds (called ${name}). ` +
      'Story play functions run under `pnpm test`, not here.',
  )
}

export const within = unavailable('within')
export const userEvent = unavailable('userEvent')
export const expect = unavailable('expect')
export const fn = unavailable('fn')
export const waitFor = unavailable('waitFor')
export const screen = unavailable('screen')
