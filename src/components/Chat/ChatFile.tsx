import { useId, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import './Chat.css'

export interface ChatFileProps {
  /** Path as the reader knows it, e.g. `src/components/Button/Button.tsx`. */
  path: string
  /** File contents. Omit for a reference the reader can only open elsewhere. */
  content?: string
  /** Shown next to the path — `tsx`, `json`. Display only; no highlighting. */
  language?: string
  /**
   * How many lines to show before truncating. `false` shows all of them.
   *
   * Defaulting to a budget rather than the whole file is the point of this
   * component: a model that read a nine-hundred-line file should be able to say
   * so without pasting nine hundred lines into the conversation.
   */
  preview?: number | false
  /** Start at which line number — for an excerpt out of a larger file. */
  startLine?: number
  /** Total lines in the real file, when `content` is already an excerpt. */
  totalLines?: number
  /** Bytes, shown beside the path. */
  size?: number
  /** Line numbers to mark — the ones the answer is about. */
  highlightLines?: number[]
  actions?: React.ReactNode
  className?: string
}

const bytes = (value: number) =>
  value < 1024 ? `${value} B` : value < 1048576 ? `${Math.round(value / 1024)} KB` : `${(value / 1048576).toFixed(1)} MB`

/**
 * A file, shown at whatever length is useful rather than at its full length.
 *
 * Collapsed to `preview` lines by default with a control to see the rest, and
 * honest about what it is holding back — "340 more lines" is information; a
 * silent truncation is a lie about what the model read.
 *
 * There is no syntax highlighting. Adding it means shipping a grammar bundle
 * per language, and a mono face with real line numbers already does the work
 * that matters here, which is letting someone point at line 214.
 */
export function ChatFile({
  path,
  content,
  language,
  preview = 12,
  startLine = 1,
  totalLines,
  size,
  highlightLines,
  actions,
  className,
}: ChatFileProps) {
  const [expanded, setExpanded] = useState(false)
  const bodyId = useId()

  const lines = useMemo(() => (content ? content.replace(/\n$/, '').split('\n') : []), [content])
  const marked = useMemo(() => new Set(highlightLines ?? []), [highlightLines])

  const budget = preview === false ? lines.length : preview
  const truncated = !expanded && lines.length > budget
  const shown = truncated ? lines.slice(0, budget) : lines
  const hidden = lines.length - shown.length
  const real = totalLines ?? lines.length

  return (
    <div className={cx('cds-chat-file', className)}>
      <div className="cds-chat-file__head">
        <Icon name="document" size={13} />
        <span className="cds-chat-file__path cds-mono">{path}</span>
        {language && <span className="cds-chat-file__lang">{language}</span>}
        <span className="cds-chat-file__meta cds-numeric">
          {real} {real === 1 ? 'line' : 'lines'}
          {size !== undefined && ` · ${bytes(size)}`}
        </span>
        {actions && <div className="cds-chat-file__actions">{actions}</div>}
      </div>

      {content !== undefined && (
        <>
          <pre className="cds-chat-file__body" id={bodyId}>
            <code>
              {shown.map((line, index) => {
                const number = startLine + index
                return (
                  <span
                    key={number}
                    className={cx('cds-chat-file__line', marked.has(number) && 'is-marked')}
                  >
                    <span className="cds-chat-file__number" aria-hidden="true">
                      {number}
                    </span>
                    <span className="cds-chat-file__text">{line || ' '}</span>
                  </span>
                )
              })}
            </code>
          </pre>

          {(truncated || expanded) && lines.length > budget && (
            <button
              type="button"
              className="cds-chat-file__more"
              aria-expanded={expanded}
              aria-controls={bodyId}
              onClick={() => setExpanded(value => !value)}
            >
              <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={12} />
              {expanded ? 'Show less' : `Show ${hidden} more ${hidden === 1 ? 'line' : 'lines'}`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
