import type { HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import './Pagination.css'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page, 1-based. */
  page: number
  /** Total number of pages. */
  pageCount: number
  onChange: (page: number) => void
  /** How many page numbers to show around the current one. */
  siblings?: number
  size?: 'sm' | 'md'
  /** Hide the numbers and show only Previous/Next. */
  compact?: boolean
  label?: string
}

/**
 * Builds the page list with ellipses: always the first and last page, plus a
 * window around the current one. Returns `null` entries for the gaps.
 */
function buildRange(page: number, pageCount: number, siblings: number): (number | null)[] {
  const window = siblings * 2 + 5
  if (pageCount <= window) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, pageCount - 1)
  const out: (number | null)[] = [1]

  if (left > 2) out.push(null)
  for (let i = left; i <= right; i++) out.push(i)
  if (right < pageCount - 1) out.push(null)

  out.push(pageCount)
  return out
}

/**
 * Page numbers, with the ends always reachable.
 *
 * The window around the current page collapses with ellipses rather than
 * scrolling, so the control keeps a stable width across a 212-page result set —
 * a paginator that changes size as you walk through it moves the buttons under
 * the pointer.
 *
 * Rendered as a `<nav>` with the current page carrying `aria-current="page"`,
 * which is what tells a screen reader where it is without reading all eleven
 * numbers.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  siblings = 1,
  size = 'md',
  compact = false,
  label = 'Pagination',
  className,
  ...rest
}: PaginationProps) {
  if (pageCount <= 1) return null

  const pages = compact ? [] : buildRange(page, pageCount, siblings)
  const atStart = page <= 1
  const atEnd = page >= pageCount

  return (
    <nav
      className={cx('cds-pagination', `cds-pagination--${size}`, className)}
      aria-label={label}
      {...rest}
    >
      <button
        type="button"
        className="cds-pagination__step"
        onClick={() => onChange(page - 1)}
        disabled={atStart}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={14} />
        <span className="cds-pagination__step-label">Previous</span>
      </button>

      {compact ? (
        <span className="cds-pagination__summary cds-numeric">
          Page {page} of {pageCount}
        </span>
      ) : (
        <ul className="cds-pagination__pages">
          {pages.map((entry, i) =>
            entry === null ? (
              <li key={`gap-${i}`} className="cds-pagination__gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  className={cx('cds-pagination__page', entry === page && 'is-current')}
                  onClick={() => onChange(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  aria-label={`Page ${entry}`}
                >
                  {entry}
                </button>
              </li>
            )
          )}
        </ul>
      )}

      <button
        type="button"
        className="cds-pagination__step"
        onClick={() => onChange(page + 1)}
        disabled={atEnd}
        aria-label="Next page"
      >
        <span className="cds-pagination__step-label">Next</span>
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  )
}
