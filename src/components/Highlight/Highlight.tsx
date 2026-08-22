import { Fragment, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Highlight.css'

export interface HighlightProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The text to render. */
  children: string
  /**
   * Terms to mark. A string is split on whitespace, so `"swiss bank"` marks
   * both words independently. Pass an array to mark exact phrases.
   */
  query: string | string[]
  caseSensitive?: boolean
  /** Cap the number of marks. Later matches render as plain text. */
  limit?: number
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Marks query terms inside a snippet. Search results are unreadable without
 * this — it is what lets someone scan twenty snippets in three seconds.
 */
export function Highlight({
  children,
  query,
  caseSensitive = false,
  limit,
  className,
  ...rest
}: HighlightProps) {
  const terms = (Array.isArray(query) ? query : query.split(/\s+/))
    .map(t => t.trim())
    .filter(Boolean)

  if (terms.length === 0) {
    return (
      <span className={className} {...rest}>
        {children}
      </span>
    )
  }

  // Longest first, so "data protection" wins over "data" when both are given.
  const pattern = new RegExp(
    `(${terms
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp)
      .join('|')})`,
    caseSensitive ? 'g' : 'gi'
  )

  const parts = children.split(pattern)
  let marked = 0

  return (
    <span className={className} {...rest}>
      {parts.map((part, i) => {
        // split() with one capture group puts matches at every odd index.
        const isMatch = i % 2 === 1
        if (isMatch && (limit === undefined || marked < limit)) {
          marked += 1
          return (
            <mark key={i} className={cx('cds-mark')}>
              {part}
            </mark>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </span>
  )
}
