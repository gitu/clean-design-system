import { Children, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Skeleton } from '../Skeleton/Skeleton'
import './ResultList.css'

export interface ResultListProps extends HTMLAttributes<HTMLElement> {
  /** Usually `ResultCard`s. Each child is wrapped in a list item. */
  children?: ReactNode
  /** Swaps the children for placeholder rows. */
  loading?: boolean
  /** How many placeholders to draw while loading. */
  loadingCount?: number
  /** Shown when there are no children and nothing is loading. */
  empty?: ReactNode
  /** `ol` conveys that order is meaningful — the right default for relevance. */
  as?: 'ol' | 'ul'
  /** Hairlines between rows. */
  dividers?: boolean
  /** Accessible name, e.g. "Search results". */
  label?: string
}

/**
 * The results column: rules between rows, placeholders while loading, and an
 * empty slot. Keeps a fixed rhythm so the page does not jump between states.
 */
export function ResultList({
  children,
  loading = false,
  loadingCount = 5,
  empty,
  as: Tag = 'ol',
  dividers = true,
  label,
  className,
  ...rest
}: ResultListProps) {
  const items = Children.toArray(children)

  if (loading) {
    return (
      <div
        className={cx('cds-result-list', dividers && 'cds-result-list--ruled', className)}
        aria-busy="true"
        aria-label={label}
        {...rest}
      >
        {Array.from({ length: loadingCount }, (_, i) => (
          <div className="cds-result-list__item" key={i}>
            <div className="cds-result-list__skeleton">
              <Skeleton variant="block" width="30%" height={11} />
              <Skeleton variant="block" width="72%" height={17} />
              <Skeleton variant="text" lines={2} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0 && empty) {
    return (
      <div className={cx('cds-result-list', className)} aria-label={label} {...rest}>
        {empty}
      </div>
    )
  }

  return (
    <Tag
      className={cx('cds-result-list', dividers && 'cds-result-list--ruled', className)}
      aria-label={label}
      {...rest}
    >
      {items.map((child, i) => (
        <li className="cds-result-list__item" key={i}>
          {child}
        </li>
      ))}
    </Tag>
  )
}
