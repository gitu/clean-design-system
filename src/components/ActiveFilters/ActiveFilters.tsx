import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Tag } from '../Tag/Tag'
import './ActiveFilters.css'

export interface ActiveFilter {
  /** Stable identity — used as the React key and passed back on remove. */
  id: string
  /** Dimension name, e.g. `Section`. Rendered as a kicker inside the tag. */
  facet?: string
  /** The applied value, e.g. `Politics`. */
  value: ReactNode
}

export interface ActiveFiltersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  filters: ActiveFilter[]
  onRemove?: (id: string) => void
  onClearAll?: () => void
  /** Leading label. Pass `null` to omit it. */
  label?: ReactNode
  clearAllLabel?: string
  /** Collapse past this many tags behind a "+n more" toggle. */
  maxVisible?: number
  size?: 'sm' | 'md'
}

/**
 * The receipt for what the user has narrowed to. Non-negotiable in a faceted
 * search: without it people lose track of why a result set is small and
 * conclude the search is broken.
 */
export function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
  label = 'Filtered by',
  clearAllLabel = 'Clear all',
  maxVisible,
  size = 'md',
  className,
  ...rest
}: ActiveFiltersProps) {
  if (filters.length === 0) return null

  const overflow = maxVisible !== undefined && filters.length > maxVisible
  const visible = overflow ? filters.slice(0, maxVisible) : filters
  const hidden = filters.length - visible.length

  return (
    <div className={cx('cds-active-filters', className)} {...rest}>
      {label != null && <span className="cds-active-filters__label cds-kicker">{label}</span>}

      <ul className="cds-active-filters__list">
        {visible.map(filter => (
          <li key={filter.id}>
            <Tag
              size={size}
              facet={filter.facet}
              onRemove={onRemove ? () => onRemove(filter.id) : undefined}
              removeLabel={`Remove ${filter.facet ? `${filter.facet} ` : ''}filter`}
            >
              {filter.value}
            </Tag>
          </li>
        ))}
        {hidden > 0 && (
          <li className="cds-active-filters__overflow cds-numeric">+{hidden} more</li>
        )}
      </ul>

      {onClearAll && (
        <button type="button" className="cds-active-filters__clear" onClick={onClearAll}>
          {clearAllLabel}
        </button>
      )}
    </div>
  )
}
