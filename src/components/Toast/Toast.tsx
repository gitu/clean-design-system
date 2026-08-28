import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import './Toast.css'

export interface ToastMessage {
  id: string
  title: ReactNode
  description?: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
  /** A single follow-up — "Undo", usually. */
  action?: { label: string; onClick: () => void }
}

interface ToastContextValue {
  /** Returns the id, so a caller can dismiss it early. */
  toast: (message: Omit<ToastMessage, 'id'> & { id?: string }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Announces what just happened, without stealing focus.
 *
 * Deliberately not auto-dismissing. A message that disappears on a timer is
 * unreadable to anyone who reads slowly, and if it carried an "Undo" it has
 * taken the undo away with it — so these stay until dismissed. That also means
 * this is the wrong component for anything high-frequency.
 */
export function ToastProvider({
  children,
  max = 4,
}: {
  children: ReactNode
  /** Oldest messages drop off beyond this. */
  max?: number
}) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  // A ref, not state: bumping it must not itself schedule a render, and the
  // value is only ever read at the moment a toast is pushed.
  const nextId = useRef(0)

  const dismiss = useCallback((id: string) => {
    setMessages(current => current.filter(message => message.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    message => {
      // A counter rather than Math.random: this only ever runs in a browser,
      // and a stable sequence is easier to assert against in a test.
      nextId.current += 1
      const id = message.id ?? `toast-${nextId.current}`
      setMessages(current => [...current, { ...message, id }].slice(-max))
      return id
    },
    [max]
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {messages.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="cds-toast-layer cds-root" role="region" aria-label="Notifications">
            {messages.map(message => (
              <div
                key={message.id}
                className={cx('cds-toast', `cds-toast--${message.tone ?? 'default'}`)}
                // `status` rather than `alert`: these report what happened, and
                // an assertive live region interrupts whatever is being read.
                role="status"
              >
                <div className="cds-toast__body">
                  <p className="cds-toast__title">{message.title}</p>
                  {message.description && (
                    <p className="cds-toast__description">{message.description}</p>
                  )}
                </div>
                {message.action && (
                  <button
                    type="button"
                    className="cds-toast__action"
                    onClick={() => {
                      message.action?.onClick()
                      dismiss(message.id)
                    }}
                  >
                    {message.action.label}
                  </button>
                )}
                <IconButton
                  icon={<Icon name="close" size={14} />}
                  label="Dismiss"
                  size="sm"
                  variant="ghost"
                  onClick={() => dismiss(message.id)}
                />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

/** Throws outside a `ToastProvider` — a silent no-op would be worse. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside a <ToastProvider>')
  return context
}
