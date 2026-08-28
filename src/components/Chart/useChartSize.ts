import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * `useLayoutEffect` warns when React renders on a server. Resolving which hook
 * to use once at module scope — rather than branching during render — keeps the
 * hook order stable, which is the rule that actually matters.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Measures the container, but starts from a real number rather than zero.
 *
 * This is the whole reason `@visx/responsive`'s `ParentSize` is not used: it
 * measures on mount, so the first paint — and every server render, and the
 * first frame a screenshot catches — is a 0x0 chart. Starting at
 * `fallbackWidth` means the markup is always a real chart that then adjusts,
 * instead of nothing that then appears.
 */
export function useChartSize(fixedWidth: number | undefined, fallbackWidth: number) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [measured, setMeasured] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (fixedWidth !== undefined) return
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return

    const read = () => {
      const next = Math.round(node.getBoundingClientRect().width)
      // Ignore a zero read — a chart inside a collapsed panel or a hidden tab
      // would otherwise throw away a perfectly good width.
      if (next > 0) setMeasured(current => (current === next ? current : next))
    }

    read()
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [fixedWidth])

  return { ref, width: fixedWidth ?? measured ?? fallbackWidth }
}
