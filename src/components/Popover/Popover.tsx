import type { CSSProperties, ReactNode, Ref } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { cx } from '../../utils/cx'
import { useControllableState } from '../../utils/useControllableState'
import './Popover.css'

export interface PopoverTriggerProps {
  onClick: () => void
  'aria-haspopup': 'dialog'
  'aria-expanded': boolean
  'aria-controls': string
  ref: Ref<HTMLButtonElement>
}

export interface PopoverProps {
  /** The control that opens it. Gets the aria wiring automatically. */
  trigger: (props: PopoverTriggerProps) => ReactNode
  /**
   * Panel content. A function receives `close`, which is what a popover
   * containing a form or a set of choices needs — `close(false)` skips
   * returning focus, for an action that moves focus itself.
   */
  children: ReactNode | ((close: (returnFocus?: boolean) => void) => ReactNode)
  /**
   * Accessible name for the panel. Required: the panel is a `dialog`, and a
   * dialog with no name is announced as nothing at all.
   */
  label: string
  /** Which edge of the trigger the panel lines up with. */
  align?: 'start' | 'end'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Any CSS length. Defaults to a comfortable form width. */
  width?: string
  padding?: 'none' | 'sm' | 'md'
  className?: string
}

/**
 * Arbitrary content anchored to a control — a short form, a set of choices, a
 * confirmation.
 *
 * `Menu` is for a list of actions and nothing else. This is the general case,
 * and the distinction is worth keeping: a menu's items are a known shape, so it
 * can own their keyboard model, whereas a popover's content is the caller's and
 * only the layer belongs to the system.
 *
 * **Not a modal.** No focus trap, no scroll lock, no scrim. Escape closes it,
 * clicking outside closes it, and moving focus out of it closes it — but the
 * page behind stays live and usable, which is the whole point. Anything that
 * genuinely takes the page over should be a `Dialog` or a `Drawer`.
 *
 * Positioned by CSS against a relatively-placed wrapper rather than measured
 * and placed by script — the same decision `Menu` and `ChartTooltip` make, and
 * for the same reasons: it renders on a server, and there is no frame in which
 * the panel is in the wrong place. The cost is that it cannot flip itself away
 * from a viewport edge, so `align` is the manual control.
 */
export function Popover({
  trigger,
  children,
  label,
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  width = '18rem',
  padding = 'md',
  className,
}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const panelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    [setOpen]
  )

  useEffect(() => {
    if (!isOpen) return undefined

    function onPointerDown(event: PointerEvent) {
      // No focus return: the reader has already put their attention somewhere
      // else, and yanking it back to the trigger would undo that.
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }

    // Tabbing past the last control in the panel closes it, rather than leaving
    // an open panel behind the reader. `relatedTarget` is null when focus
    // leaves the document entirely — switching tabs is not a reason to close.
    function onFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (next && !wrapperRef.current?.contains(next)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    const wrapper = wrapperRef.current
    wrapper?.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      wrapper?.removeEventListener('focusout', onFocusOut)
    }
  }, [isOpen, setOpen])

  // Focus moves in on open, to whatever is marked `data-autofocus` or else the
  // panel itself.
  //
  // Synchronously in the effect, not in an animation frame. `useModalLayer`
  // waits a frame because a Dialog is portalled and animates in; this panel is
  // rendered inline and is already in the DOM by the time effects run, so the
  // frame would only add one in which the keyboard is in the wrong place.
  useEffect(() => {
    if (!isOpen) return
    const target =
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current
    target?.focus()
  }, [isOpen])

  return (
    <div
      className={cx('cds-popover-wrap', className)}
      ref={wrapperRef}
      onKeyDown={event => {
        if (event.key !== 'Escape' || !isOpen) return
        // Stopped so a popover inside a dialog closes only the popover.
        event.stopPropagation()
        close()
      }}
    >
      {trigger({
        onClick: () => setOpen(!isOpen),
        'aria-haspopup': 'dialog',
        'aria-expanded': isOpen,
        'aria-controls': panelId,
        ref: triggerRef,
      })}

      {isOpen && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={cx('cds-popover', `cds-popover--${align}`, `cds-popover--pad-${padding}`)}
          style={{ '--cds-popover-width': width } as CSSProperties}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}
