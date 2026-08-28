import { useEffect, useRef } from 'react'

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The behaviour every modal layer owes the reader: Escape closes it, Tab stays
 * inside it, the page behind stops scrolling, focus moves in on open and back
 * to whatever opened it on close.
 *
 * Extracted from `Drawer` when `Dialog` needed the same fifty lines. Both call
 * it; nothing else should need to, because anything that does is a modal and
 * should probably be one of those two.
 *
 * Returns the ref to put on the panel. An element inside marked
 * `data-autofocus` receives focus; otherwise the panel itself does.
 */
export function useModalLayer(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // Stopped so a modal inside a modal closes only the inner one.
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(TABBABLE)
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus() ??
        panelRef.current?.focus()
    })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      cancelAnimationFrame(frame)
      returnFocusRef.current?.focus?.()
    }
  }, [open, onClose])

  return panelRef
}
