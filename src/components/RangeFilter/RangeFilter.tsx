import { useState, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Input } from '../Input/Input'
import { Button } from '../Button/Button'
import './RangeFilter.css'

export interface RangeValue {
  min: string
  max: string
}

export interface RangeFilterProps {
  /** Current bounds. Empty strings mean "unbounded on that side". */
  value?: RangeValue
  defaultValue?: RangeValue
  onChange?: (value: RangeValue) => void
  /** Fires on Apply, or on blur when `applyOn="blur"`. */
  onApply?: (value: RangeValue) => void
  /** `number` and `date` both render two native inputs of that type. */
  type?: 'number' | 'date'
  /** Placeholders for the two fields. */
  minPlaceholder?: string
  maxPlaceholder?: string
  /** Unit shown as a suffix inside both fields, e.g. `CHF`, `pages`. */
  unit?: ReactNode
  /** Commit strategy. `button` shows an explicit Apply. */
  applyOn?: 'button' | 'blur'
  applyLabel?: string
  /** Quick presets rendered as a row of links, e.g. last 7 / 30 / 90 days. */
  presets?: { label: string; value: RangeValue }[]
  disabled?: boolean
  className?: string
}

const EMPTY: RangeValue = { min: '', max: '' }

/**
 * A two-ended bound for numeric or date facets. Deliberately two text fields
 * rather than a slider: search users type exact values far more often than
 * they drag, and a slider cannot express "anything before 1990".
 */
export function RangeFilter({
  value,
  defaultValue = EMPTY,
  onChange,
  onApply,
  type = 'number',
  minPlaceholder = type === 'date' ? '' : 'Min',
  maxPlaceholder = type === 'date' ? '' : 'Max',
  unit,
  applyOn = 'button',
  applyLabel = 'Apply',
  presets,
  disabled = false,
  className,
}: RangeFilterProps) {
  const [internal, setInternal] = useState<RangeValue>(defaultValue)
  const current = value ?? internal

  function update(next: RangeValue) {
    if (value === undefined) setInternal(next)
    onChange?.(next)
    return next
  }

  const invalid =
    current.min !== '' &&
    current.max !== '' &&
    (type === 'number'
      ? Number(current.min) > Number(current.max)
      : current.min > current.max)

  return (
    <div className={cx('cds-range', className)}>
      <div className="cds-range__row">
        <Input
          size="sm"
          type={type}
          value={current.min}
          placeholder={minPlaceholder}
          disabled={disabled}
          invalid={invalid}
          suffix={unit}
          aria-label="Minimum"
          onChange={event => update({ ...current, min: event.target.value })}
          onBlur={() => applyOn === 'blur' && !invalid && onApply?.(current)}
        />
        <span className="cds-range__dash" aria-hidden="true" />
        <Input
          size="sm"
          type={type}
          value={current.max}
          placeholder={maxPlaceholder}
          disabled={disabled}
          invalid={invalid}
          suffix={unit}
          aria-label="Maximum"
          onChange={event => update({ ...current, max: event.target.value })}
          onBlur={() => applyOn === 'blur' && !invalid && onApply?.(current)}
        />
      </div>

      {invalid && (
        <p className="cds-range__error" role="alert">
          The lower bound is above the upper bound.
        </p>
      )}

      {presets && presets.length > 0 && (
        <div className="cds-range__presets">
          {presets.map(preset => (
            <button
              key={preset.label}
              type="button"
              className="cds-range__preset"
              disabled={disabled}
              onClick={() => onApply?.(update(preset.value))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {applyOn === 'button' && (
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled || invalid}
          onClick={() => onApply?.(current)}
        >
          {applyLabel}
        </Button>
      )}
    </div>
  )
}
