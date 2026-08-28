import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { useModalLayer } from '../../utils/useModalLayer'
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
  // Escape, focus trap, scroll lock and focus return — shared with `Dialog`.
  const panelRef = useModalLayer(open, onClose)

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
        {/* Plain divs, not <header>/<footer>. The panel is portalled to
            <body>, and `role="dialog"` does not scope those elements the way a
            <section> or <article> would — so a <header> here becomes a second
            `banner` landmark on the page and a <footer> a second `contentinfo`,
            both of which axe reports the moment the drawer is open. */}
        {(title || !hideClose) && (
          <div className="cds-drawer__header">
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
          </div>
        )}
        <div className="cds-drawer__body">{children}</div>
        {footer && <div className="cds-drawer__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
