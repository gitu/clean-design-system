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
