import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  // visx (and the d3 packages under it) stay external so consumers dedupe them
  // and we don't inline a charting library into every bundle that imports a
  // Button. Charts are the only thing that reach for it.
  external: ['react', 'react-dom', 'react/jsx-runtime', /^@visx\//, /^d3-/],
  // Component CSS is imported from the components themselves and collected
  // by esbuild into a single dist/index.css.
  injectStyle: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }
  },
})
