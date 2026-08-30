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

  // Every caller writes `onClose={() => setOpen(false)}`, so the identity
  // changes on each render. Held in a ref, it stays out of the dependency
  // list below and the layer is set up once per opening — not torn down and
  // rebuilt on every render, which would run the cleanup's focus restore
  // after each keystroke and pull focus back to whatever opened the modal.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement as HTMLElement | null
    // Captured here rather than read in the cleanup: the panel for this
    // opening does not change while it is open, and reading a ref during
    // teardown is the classic way to get the wrong node.
    const panel = panelRef.current

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // Stopped so a modal inside a modal closes only the inner one.
        event.stopPropagation()
        onCloseRef.current()
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
      const target =
        panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current
      target?.focus()
    })

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      cancelAnimationFrame(frame)

      // Give focus back only if this layer still holds it. Closing one modal
      // to open another runs this cleanup *after* the new one has focused its
      // own field, and restoring focus then would snatch it straight back to
      // a button behind two layers. `body` counts as ours: it is where focus
      // lands when the panel is removed before this runs.
      const active = document.activeElement as HTMLElement | null
      const ours = !active || active === document.body || panel?.contains(active)
      if (ours) returnFocusRef.current?.focus()
    }
  }, [open])

  return panelRef
}
