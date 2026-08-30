/**
 * The one piece of Vite's ambient typing these pages need.
 *
 * `vite/client` would supply it, but referencing that file also redeclares
 * `ImportMeta.env` as required, which collides with the optional declaration in
 * `src/css.d.ts` that the story files rely on. Declaring the single member we
 * use merges cleanly with both, and matches how the rest of the repo handles
 * Vite's non-standard imports.
 */
interface ImportMeta {
  /** Eager-free module map. Vite rewrites the pattern at build time. */
  glob: <T>(pattern: string) => Record<string, () => Promise<T>>
}
