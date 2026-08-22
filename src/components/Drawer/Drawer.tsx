import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import './Drawer.css'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  /** Heading, set as a kicker over the content. */
  title?: ReactNode
  description?: ReactNode
  /** Which edge it enters from. `start`/`end` follow writing direction. */
  side?: 'start' | 'end' | 'bottom'
  size?: 'sm' | 'md' | 'lg'
  /** Pinned action row at the bottom. */
  footer?: ReactNode
  /** Hide the close button — only sensible when the footer offers a way out. */
  hideClose?: boolean
  /** Let clicks on the backdrop close it. */
  dismissible?: boolean
  children?: ReactNode
  className?: string
}

/**
 * A slide-over panel: filters on narrow screens, a result's detail view beside
 * the list, a bulk-edit form. Closes on Escape and on backdrop click, and
 * returns focus to whatever opened it.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = 'end',
  size = 'md',
  footer,
  hideClose = false,
  dismissible = true,
  children,
  className,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return undefined

    returnFocusRef.current = document.activeElement as HTMLElement | null

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // Minimal focus trap: cycle within the panel's tabbable elements.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
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

  if (!open) return null

  return createPortal(
    <div className={cx('cds-drawer-layer', 'cds-root', `cds-drawer-layer--${side}`)}>
      <div
        className="cds-drawer__backdrop"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cx('cds-drawer', `cds-drawer--${side}`, `cds-drawer--${size}`, className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
      >
        {(title || !hideClose) && (
          <header className="cds-drawer__header">
            <div className="cds-drawer__heading">
              {title && <h2 className="cds-drawer__title cds-kicker">{title}</h2>}
              {description && <p className="cds-drawer__description">{description}</p>}
            </div>
            {!hideClose && (
              <IconButton
                icon={<Icon name="close" size={16} />}
                label="Close"
                size="sm"
                onClick={onClose}
              />
            )}
          </header>
        )}
        <div className="cds-drawer__body">{children}</div>
        {footer && <footer className="cds-drawer__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  )
}
