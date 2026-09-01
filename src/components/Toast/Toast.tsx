import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
  /** A single follow-up — "Undo", usually. Suppresses auto-dismiss. */
  action?: { label: string; onClick: () => void }
  /**
   * Milliseconds before this dismisses itself. Defaults to the provider's
   * `duration`. Pass `null` to keep it until dismissed — do that for anything
   * the reader has to act on.
   */
  duration?: number | null
}

interface ToastContextValue {
  /** Returns the id, so a caller can dismiss it early. */
  toast: (message: Omit<ToastMessage, 'id'> & { id?: string }) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export interface ToastProviderProps {
  children: ReactNode
  /** Oldest messages drop off beyond this. */
  max?: number
  /**
   * How long a message without an action stays. `null` keeps every message
   * until dismissed, which is what this component used to do unconditionally.
   */
  duration?: number | null
}

/**
 * Announces what just happened, without stealing focus.
 *
 * A plain confirmation clears itself after `duration`. Anything carrying an
 * action does not: a message that takes its own "Undo" away on a timer is
 * worse than no message. Hovering or focusing the stack holds every timer,
 * so reading slowly never costs you the message.
 *
 * This used to keep everything until dismissed, for the reason above. That is
 * right for the actionable ones and wrong for the other ninety-odd percent —
 * "Copied", "Role updated", "Plan uploaded" — which simply pile up until the
 * reader clears them by hand.
 */
export function ToastProvider({ children, max = 4, duration = 6000 }: ToastProviderProps) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  // A ref, not state: bumping it must not itself schedule a render, and the
  // value is only ever read at the moment a toast is pushed.
  const nextId = useRef(0)
  const [held, setHeld] = useState(false)

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

  // One timer per message, all of them paused while the stack is hovered or
  // holds focus. Re-running on `held` restarts the survivors from full, which
  // is the forgiving direction to round in.
  useEffect(() => {
    if (held) return undefined
    const timers = messages
      .map(message => {
        const ms = message.duration === undefined ? duration : message.duration
        if (ms == null || message.action) return null
        return window.setTimeout(() => dismiss(message.id), ms)
      })
      .filter((t): t is number => t !== null)
    return () => timers.forEach(id => window.clearTimeout(id))
  }, [messages, held, duration, dismiss])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {messages.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="cds-toast-layer cds-root"
            role="region"
            aria-label="Notifications"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocusCapture={() => setHeld(true)}
            onBlurCapture={() => setHeld(false)}
          >
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
