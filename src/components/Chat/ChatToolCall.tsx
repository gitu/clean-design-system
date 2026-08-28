import type { ReactNode } from 'react'
import { useId, useState } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Spinner } from '../Spinner/Spinner'
import type { ToolStatus } from './chat-types'
import './Chat.css'

export interface ChatToolCallProps {
  /** The tool's name, as the model called it. */
  name: string
  /** One line saying what it did, in the reader's language, not the model's. */
  summary?: ReactNode
  status?: ToolStatus
  /** The arguments and result, revealed on request. */
  children?: ReactNode
  /** How long it took, in ms. */
  duration?: number
  defaultOpen?: boolean
  className?: string
}

/**
 * What the model did, shown as itself.
 *
 * Collapsed by default and quiet by design: a reader wants to know that a
 * figure came from querying the index rather than from the model's memory, but
 * they do not want the JSON unless they ask. The name is in the mono face
 * because it is an identifier, and the summary is in prose because it is for
 * the reader.
 *
 * Never hide a *failed* call — `failed` opens itself, since the reason an
 * answer is wrong is exactly what the reader needs.
 */
export function ChatToolCall({
  name,
  summary,
  status = 'done',
  children,
  duration,
  defaultOpen,
  className,
}: ChatToolCallProps) {
  const [open, setOpen] = useState(defaultOpen ?? status === 'failed')
  const panelId = useId()

  return (
    <div className={cx('cds-chat-tool', `is-${status}`, className)}>
      <button
        type="button"
        className="cds-chat-tool__head"
        aria-expanded={open}
        aria-controls={children ? panelId : undefined}
        disabled={!children}
        onClick={() => setOpen(value => !value)}
      >
        <span className="cds-chat-tool__status" aria-hidden="true">
          {status === 'running' ? (
            <Spinner size="sm" />
          ) : (
            <Icon name={status === 'failed' ? 'alert' : 'check'} size={13} />
          )}
        </span>
        <span className="cds-chat-tool__name cds-mono">{name}</span>
        {summary && <span className="cds-chat-tool__summary">{summary}</span>}
        {duration !== undefined && status !== 'running' && (
          <span className="cds-chat-tool__duration cds-numeric">{duration} ms</span>
        )}
        {children && (
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
        )}
      </button>
      {children && (
        <div id={panelId} className="cds-chat-tool__panel" hidden={!open}>
          {children}
        </div>
      )}
    </div>
  )
}
