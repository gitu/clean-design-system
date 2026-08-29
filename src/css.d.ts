declare module '*.css' {
  const content: string
  export default content
}

/**
 * Vite's `import.meta.env`, for the story-only bits that read configuration
 * (the delivery router's basemap URL). The package itself never touches it —
 * `tsup` builds `src/index.ts`, which does not reach these files.
 */
interface ImportMetaEnv {
  readonly VITE_MAP_STYLE?: string
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}

/**
 * Vite's `?url` suffix: the module resolves to the emitted asset's URL rather
 * than to its contents. Used for MapLibre's worker, which has to be handed to
 * the library as a URL the build has actually emitted.
 */
declare module '*?url' {
  const src: string
  export default src
}

/**
 * `?worker&url`: the worker and its imports are bundled, and the module
 * resolves to the emitted bundle's URL.
 */
declare module '*?worker&url' {
  const src: string
  export default src
}
