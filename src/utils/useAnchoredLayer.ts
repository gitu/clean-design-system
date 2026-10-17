import type { RefObject } from 'react'
import { useLayoutEffect } from 'react'

/** Below this width the layer is a sheet along the bottom edge. Matches the
 * `max-width: 640px` the layouts already collapse at. */
const SHEET_QUERY = '(max-width: 640px)'
/** Space between the trigger and the layer, and between the layer and the
 * viewport edge, in CSS pixels. Measured geometry, so not a token. */
const GAP = 4
const EDGE = 8

export type LayerPlacement = 'below' | 'above' | 'sheet'

interface AnchoredLayerOptions {
  open: boolean
  /** What the layer hangs off — the trigger's wrapper. */
  anchorRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLElement | null>
  /** Which edge of the anchor the layer lines up with. */
  align: 'start' | 'end'
}

/**
 * Places a Menu or Popover panel against its trigger without letting the page
 * around it get in the way.
 *
 * The panel goes into the top layer (`popover="manual"`, set by this hook),
 * so a card with `overflow: hidden` or a lower stacking context can no longer
 * clip it or paint over it. It stays where it is in the DOM, so outside-click and focus
 * handling keep working against the wrapper.
 *
 * Measured in a layout effect, before the first paint, so the panel is never
 * seen in the wrong place: below the trigger when it fits, above when there is
 * more room there, clamped to the viewport, and capped in height with its own
 * scroll when neither side is tall enough. On a narrow screen it becomes a
 * sheet along the bottom edge instead. The resolved placement is written to
 * `data-placement` for the stylesheet.
 */
export function useAnchoredLayer({ open, anchorRef, panelRef, align }: AnchoredLayerOptions) {
  useLayoutEffect(() => {
    const panel = panelRef.current
    const anchor = anchorRef.current
    if (!open || !panel || !anchor) return undefined

    // Set here rather than in the markup, and only where it can be opened:
    // an engine that knows the attribute but not `showPopover` (jsdom, for
    // one) hides a `[popover]` element and would never show the panel.
    if (typeof panel.showPopover === 'function') {
      try {
        panel.setAttribute('popover', 'manual')
        if (!panel.matches(':popover-open')) panel.showPopover()
      } catch {
        // Not connected yet, or already shown by a re-render: fixed
        // positioning below still lifts it out of the clipping box.
      }
    }

    function place() {
      if (!panel || !anchor) return
      if (window.matchMedia(SHEET_QUERY).matches) {
        panel.dataset.placement = 'sheet'
        panel.style.removeProperty('top')
        panel.style.removeProperty('left')
        panel.style.removeProperty('max-height')
        return
      }

      // Measure at natural height before deciding where it goes.
      panel.style.removeProperty('max-height')
      const trigger = anchor.getBoundingClientRect()
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = window.innerHeight

      const spaceBelow = viewportHeight - trigger.bottom - GAP - EDGE
      const spaceAbove = trigger.top - GAP - EDGE
      const below = height <= spaceBelow || spaceBelow >= spaceAbove
      const room = Math.max(0, below ? spaceBelow : spaceAbove)
      const shown = Math.min(height, room)
      if (height > room) panel.style.maxHeight = `${room}px`

      const top = below ? trigger.bottom + GAP : trigger.top - GAP - shown
      const rtl = getComputedStyle(anchor).direction === 'rtl'
      const alignEnd = (align === 'end') !== rtl
      const preferred = alignEnd ? trigger.right - width : trigger.left
      const left = Math.min(Math.max(preferred, EDGE), Math.max(EDGE, viewportWidth - width - EDGE))

      panel.dataset.placement = below ? 'below' : 'above'
      panel.style.top = `${top}px`
      panel.style.left = `${left}px`
    }

    place()

    let frame = 0
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    // Capture, so scrolling any ancestor — not only the window — moves it.
    window.addEventListener('scroll', schedule, { capture: true, passive: true })
    window.addEventListener('resize', schedule)
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null
    observer?.observe(panel)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule, { capture: true })
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
      if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
        try {
          panel.hidePopover()
        } catch {
          // Already gone with its subtree.
        }
      }
    }
  }, [open, anchorRef, panelRef, align])
}

/**
 * Whether a pointerdown landed outside the layer. A sheet's backdrop belongs
 * to the panel element, so a tap on it targets the panel even though it is
 * plainly outside — the panel's own box is what decides.
 */
export function isOutsideLayer(
  event: PointerEvent,
  wrapper: HTMLElement | null,
  panel: HTMLElement | null
) {
  const target = event.target as Node
  if (!wrapper?.contains(target)) return true
  if (panel && target === panel) {
    const box = panel.getBoundingClientRect()
    return (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
  }
  return false
}
