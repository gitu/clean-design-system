import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChartKey } from './chart-types'

interface Options {
  /** Datum keys in draw order. The cursor moves along this. */
  keys: ChartKey[]
  /** Visible series keys, for up/down. */
  seriesKeys: string[]
  hoverKey: ChartKey | null
  setHoverKey: (key: ChartKey | null) => void
  onActivate: (key: ChartKey, seriesKey: string | null) => void
  onEscapeZoom?: () => boolean
  /** Builds the sentence read out when the cursor lands. */
  describe: (key: ChartKey, seriesKey: string | null) => string
}

/**
 * A virtual cursor: one tab stop for the whole chart, arrow keys inside it.
 *
 * The alternative — a tab stop per point — makes a sixty-point chart sixty
 * stops, and a dashboard of six such charts three hundred and sixty. Nobody
 * tabs through that to reach the next control.
 *
 * The cursor writes to the same `hoverKey` the pointer does, so the crosshair,
 * the tooltip and every linked chart respond identically whether the reader is
 * pointing or arrowing. That shared state is what makes cross-filtering
 * coherent from the keyboard, and it removes a parallel "focused index".
 */
export function useChartKeyboard({
  keys,
  seriesKeys,
  hoverKey,
  setHoverKey,
  onActivate,
  onEscapeZoom,
  describe,
}: Options) {
  const [seriesIndex, setSeriesIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const lastSpoken = useRef('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  /**
   * Debounced, and silent when the sentence has not changed — holding an arrow
   * key otherwise floods the live region with announcements the reader is
   * already past.
   */
  const announce = useCallback((text: string) => {
    if (text === lastSpoken.current) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      lastSpoken.current = text
      setAnnouncement(text)
    }, 120)
  }, [])

  const moveTo = useCallback(
    (index: number, series: number) => {
      const clamped = Math.max(0, Math.min(index, keys.length - 1))
      const key = keys[clamped]
      if (key === undefined) return
      setHoverKey(key)
      const seriesKey = seriesKeys.length > 1 ? (seriesKeys[series] ?? null) : null
      announce(describe(key, seriesKey))
    },
    [keys, seriesKeys, setHoverKey, announce, describe]
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (keys.length === 0) return
      const current = hoverKey === null ? -1 : keys.indexOf(hoverKey)
      const at = current === -1 ? 0 : current

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          moveTo(current === -1 ? 0 : at + 1, seriesIndex)
          break
        case 'ArrowLeft':
          event.preventDefault()
          moveTo(current === -1 ? keys.length - 1 : at - 1, seriesIndex)
          break
        case 'ArrowUp': {
          if (seriesKeys.length < 2) return
          event.preventDefault()
          const next = Math.max(0, seriesIndex - 1)
          setSeriesIndex(next)
          moveTo(at, next)
          break
        }
        case 'ArrowDown': {
          if (seriesKeys.length < 2) return
          event.preventDefault()
          const next = Math.min(seriesKeys.length - 1, seriesIndex + 1)
          setSeriesIndex(next)
          moveTo(at, next)
          break
        }
        case 'Home':
          event.preventDefault()
          moveTo(0, seriesIndex)
          break
        case 'End':
          event.preventDefault()
          moveTo(keys.length - 1, seriesIndex)
          break
        case 'PageUp':
          event.preventDefault()
          moveTo(at - 10, seriesIndex)
          break
        case 'PageDown':
          event.preventDefault()
          moveTo(at + 10, seriesIndex)
          break
        case 'Enter':
        case ' ': {
          if (hoverKey === null) return
          event.preventDefault()
          const seriesKey = seriesKeys.length > 1 ? (seriesKeys[seriesIndex] ?? null) : null
          onActivate(hoverKey, seriesKey)
          break
        }
        case 'Escape':
          // Unwind one layer at a time: the cursor, then the zoom, then let
          // the event through so a surrounding drawer can close.
          if (hoverKey !== null) {
            event.preventDefault()
            setHoverKey(null)
            announce('')
            lastSpoken.current = ''
          } else if (onEscapeZoom?.()) {
            event.preventDefault()
          }
          break
        default:
      }
    },
    [keys, hoverKey, seriesIndex, seriesKeys, moveTo, onActivate, setHoverKey, announce, onEscapeZoom]
  )

  return { onKeyDown, announcement, seriesIndex }
}
