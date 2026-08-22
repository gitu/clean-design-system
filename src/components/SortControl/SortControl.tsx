import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Select } from '../Select/Select'
import './SortControl.css'

export interface SortOption {
  value: string
  label: string
  /** Whether this field can be reversed. Relevance usually cannot. */
  directional?: boolean
}

export type SortDirection = 'asc' | 'desc'

export interface SortControlProps {
  options: SortOption[]
  value: string
  direction?: SortDirection
  onChange: (value: string, direction: SortDirection) => void
  /** Leading label. Pass `null` to omit it. */
  label?: string | null
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

/**
 * Sort field plus direction. The direction toggle disappears for fields that
 * have no meaningful reverse — relevance being the obvious one.
 */
export function SortControl({
  options,
  value,
  direction = 'desc',
  onChange,
  label = 'Sort',
  size = 'sm',
  disabled = false,
  className,
}: SortControlProps) {
  const active = options.find(o => o.value === value)
  const directional = active?.directional ?? true

  return (
    <div className={cx('cds-sort', className)}>
      {label != null && <span className="cds-sort__label">{label}</span>}

      <Select
        bare
        size={size}
        value={value}
        disabled={disabled}
        aria-label="Sort by"
        options={options.map(o => ({ value: o.value, label: o.label }))}
        onChange={event => onChange(event.target.value, direction)}
      />

      {directional && (
        <button
          type="button"
          className="cds-sort__direction"
          disabled={disabled}
          aria-label={direction === 'asc' ? 'Sort ascending, switch to descending' : 'Sort descending, switch to ascending'}
          title={direction === 'asc' ? 'Ascending' : 'Descending'}
          onClick={() => onChange(value, direction === 'asc' ? 'desc' : 'asc')}
        >
          <Icon name={direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} />
        </button>
      )}
    </div>
  )
}
