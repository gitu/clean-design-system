import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { useModalLayer } from '../../utils/useModalLayer'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import './Dialog.css'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  /** A line under the title. For a `danger` dialog, say what is irreversible. */
  description?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /**
   * `danger` rules the header in red. Use it only where the action cannot be
   * undone — if everything is alarming, nothing is.
   */
  tone?: 'default' | 'danger'
  hideClose?: boolean
  /** Off for a dialog the reader must answer rather than dismiss. */
  dismissible?: boolean
  children?: ReactNode
  className?: string
}

/**
 * A centred modal, for a decision or a short form.
 *
 * `Drawer` is the better choice for anything with more than a few fields — a
 * dialog tall enough to scroll has stopped being a question and become a page.
 * Both share `useModalLayer`, so Escape, the focus trap, the scroll lock and
 * the focus return behave identically.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'sm',
  tone = 'default',
  hideClose = false,
  dismissible = true,
  children,
  className,
}: DialogProps) {
  const panelRef = useModalLayer(open, onClose)

  if (!open) return null

  return createPortal(
    <div className="cds-dialog-layer cds-root">
      <div
        className="cds-dialog__backdrop"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cx('cds-dialog', `cds-dialog--${size}`, `cds-dialog--${tone}`, className)}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
      >
        {/* Plain divs rather than <header>/<footer> — see the note in Drawer:
            the panel is portalled to <body>, where those elements would
            register as extra `banner` and `contentinfo` landmarks. */}
        {(title || !hideClose) && (
          <div className="cds-dialog__header">
            <div className="cds-dialog__heading">
              {title && <h2 className="cds-dialog__title cds-title">{title}</h2>}
              {description && <p className="cds-dialog__description cds-body-sm">{description}</p>}
            </div>
            {!hideClose && (
              <IconButton
                icon={<Icon name="close" size={16} />}
                label="Close"
                size="sm"
                variant="ghost"
                onClick={onClose}
              />
            )}
          </div>
        )}
        {children && <div className="cds-dialog__body">{children}</div>}
        {footer && <div className="cds-dialog__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
