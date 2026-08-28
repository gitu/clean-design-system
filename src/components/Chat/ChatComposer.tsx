import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useControllableState } from '../../utils/useControllableState'
import './Chat.css'

export interface ChatComposerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  /** Blocks sending — while the assistant is still answering, usually. */
  busy?: boolean
  disabled?: boolean
  /** Shown above the field — attachments, a scope chip, a model picker. */
  toolbar?: ReactNode
  /** Below the field. Say what Enter does, if it is not obvious. */
  hint?: ReactNode
  maxRows?: number
  label?: string
  className?: string
}

/**
 * The field you type into.
 *
 * Enter sends and Shift+Enter breaks the line — the convention every chat uses,
 * and the reason `hint` exists is that it is a convention rather than something
 * discoverable. The field grows with the text up to `maxRows` and then scrolls,
 * so a long message does not push the conversation off the screen.
 */
export function ChatComposer({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  placeholder = 'Ask about the archive…',
  busy = false,
  disabled = false,
  toolbar,
  hint,
  maxRows = 8,
  label = 'Message',
  className,
}: ChatComposerProps) {
  const [text, setText] = useControllableState(value, defaultValue, onValueChange)
  const ref = useRef<HTMLTextAreaElement>(null)
  const [rows, setRows] = useState(1)

  const grow = (element: HTMLTextAreaElement) => {
    const lines = element.value.split('\n').length
    setRows(Math.min(Math.max(lines, 1), maxRows))
  }

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed || busy || disabled) return
    onSubmit(trimmed)
    setText('')
    setRows(1)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form
      className={cx('cds-chat-composer', className)}
      onSubmit={(event: FormEvent) => {
        event.preventDefault()
        send()
      }}
    >
      {toolbar && <div className="cds-chat-composer__toolbar">{toolbar}</div>}
      <div className="cds-chat-composer__field">
        <textarea
          ref={ref}
          className="cds-chat-composer__input"
          value={text}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label}
          onChange={event => {
            setText(event.target.value)
            grow(event.target)
          }}
          onKeyDown={onKeyDown}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={disabled || busy || text.trim().length === 0}
          loading={busy}
        >
          <Icon name="arrow-up" size={14} /> Send
        </Button>
      </div>
      {hint && <p className="cds-chat-composer__hint cds-body-sm">{hint}</p>}
    </form>
  )
}
