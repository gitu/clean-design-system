import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './ResultMeta.css'

export interface ResultMetaProps extends HTMLAttributes<HTMLDivElement> {
  /** Total matching records. */
  total: number
  /** 1-based index of the first result on this page. */
  from?: number
  /** 1-based index of the last result on this page. */
  to?: number
  /** Query execution time in milliseconds. Rendered only when supplied. */
  took?: number
  /** The query being reported on — quoted inline when given. */
  query?: string
  /** Right-aligned slot: sort control, density toggle, export button. */
  actions?: ReactNode
  /** Replaces the counts with a placeholder while a query is in flight. */
  loading?: boolean
}

const nf = new Intl.NumberFormat('en-US')

/**
 * The line that tells someone whether their search worked: how many, which
 * slice they are looking at, and how long it took. Sits directly above the
 * result list, on a hairline rule.
 */
export function ResultMeta({
  total,
  from,
  to,
  took,
  query,
  actions,
  loading = false,
  className,
  ...rest
}: ResultMetaProps) {
  const hasRange = from !== undefined && to !== undefined && total > 0

  return (
    <div className={cx('cds-result-meta', className)} {...rest}>
      <p className="cds-result-meta__count" aria-live="polite" aria-busy={loading || undefined}>
        {loading ? (
          <span className="cds-result-meta__loading">Searching…</span>
        ) : total === 0 ? (
          <>
            No results
            {query && (
              <>
                {' for '}
                <span className="cds-result-meta__query">“{query}”</span>
              </>
            )}
          </>
        ) : (
          <>
            {hasRange && (
              <>
                <span className="cds-numeric">{nf.format(from)}</span>–
                <span className="cds-numeric">{nf.format(to)}</span> of{' '}
              </>
            )}
            <strong className="cds-result-meta__total cds-numeric">{nf.format(total)}</strong>{' '}
            {total === 1 ? 'result' : 'results'}
            {query && (
              <>
                {' for '}
                <span className="cds-result-meta__query">“{query}”</span>
              </>
            )}
            {took !== undefined && (
              <span className="cds-result-meta__took">
                {' '}
                in <span className="cds-numeric">{(took / 1000).toFixed(2)}</span>s
              </span>
            )}
          </>
        )}
      </p>
      {actions && <div className="cds-result-meta__actions">{actions}</div>}
    </div>
  )
}
