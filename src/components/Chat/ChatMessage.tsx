import type { HTMLAttributes, ReactNode } from 'react'
import { useMemo } from 'react'
import { cx } from '../../utils/cx'
import { Avatar } from '../Avatar/Avatar'
import type { ChatRole } from './chat-types'
import './Chat.css'

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLElement>, 'content'> {
  role: ChatRole
  children: ReactNode
  /** Who said it. Defaults to "You" and "Assistant". */
  author?: string
  at?: string
  status?: 'streaming' | 'done' | 'error'
  /** Buttons under the turn — copy, retry, feedback. */
  actions?: ReactNode
}

/**
 * One turn.
 *
 * Both roles are set on the page's own ground rather than in opposing bubbles:
 * an assistant turn here can contain a chart, a table and a question, and a
 * chat bubble is the wrong container for any of those. The speaker is carried
 * by the avatar and a rule, which is how the rest of this system marks things.
 */
export function ChatMessage({
  role,
  children,
  author,
  at,
  status = 'done',
  actions,
  className,
  ...rest
}: ChatMessageProps) {
  const name = author ?? (role === 'user' ? 'You' : role === 'system' ? 'System' : 'Assistant')

  const time = useMemo(() => {
    if (!at) return null
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(
      new Date(at)
    )
  }, [at])

  return (
    <article
      className={cx('cds-chat-msg', `cds-chat-msg--${role}`, status === 'error' && 'is-error', className)}
      {...rest}
    >
      <div className="cds-chat-msg__gutter">
        {role === 'assistant' ? (
          <span className="cds-chat-msg__mark" aria-hidden="true" />
        ) : (
          <Avatar name={name} size="sm" tinted decorative />
        )}
      </div>

      <div className="cds-chat-msg__body">
        <header className="cds-chat-msg__meta">
          <span className="cds-chat-msg__author cds-kicker">{name}</span>
          {time && <span className="cds-chat-msg__time cds-numeric">{time}</span>}
        </header>

        <div className="cds-chat-msg__content">
          {children}
          {status === 'streaming' && <span className="cds-chat-msg__caret" aria-hidden="true" />}
        </div>

        {actions && <footer className="cds-chat-msg__actions">{actions}</footer>}
      </div>
    </article>
  )
}
