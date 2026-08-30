import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import './Slider.css'

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue'> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  /**
   * Shown at the end of the track. Give it the value in the reader's terms —
   * "72", "4 rooms", "CHF 1.2m" — not a bare number where a unit is meant.
   */
  valueLabel?: ReactNode
  /** Text under the two ends of the track, e.g. "Poor" and "Excellent". */
  minLabel?: ReactNode
  maxLabel?: ReactNode
  size?: 'sm' | 'md'
  invalid?: boolean
}

/**
 * One value along a range.
 *
 * A native `<input type="range">`, for the same reason `Select` is a native
 * `<select>`: arrow keys, Home and End, touch dragging, and the platform's own
 * screen-reader announcement all arrive for free, and every hand-built slider
 * has to reimplement them — usually not completely.
 *
 * It is deliberately single-valued. Two thumbs on one track is a filter, and
 * `RangeFilter` is the component for that: it takes typed bounds, because
 * people who want "under 900k" type it far faster than they drag to it.
 *
 * A slider is a poor way to enter a precise number. Reach for it when the
 * reader is judging rather than specifying — a score, a weighting, an opacity
 * — and pair it with `valueLabel` so the current value is always readable.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    valueLabel,
    minLabel,
    maxLabel,
    size = 'md',
    invalid,
    disabled,
    id,
    className,
    ...rest
  },
  ref
) {
  const field = useFieldControl({ id, invalid, disabled })

  // The filled part of the track is drawn from this, so the ink stops under
  // the thumb rather than running the whole width.
  const current = value ?? defaultValue ?? min
  const span = max - min
  const filled = span > 0 ? ((current - min) / span) * 100 : 0

  return (
    <div
      className={cx(
        'cds-slider',
        `cds-slider--${size}`,
        field.invalid && 'is-invalid',
        field.disabled && 'is-disabled',
        className
      )}
    >
      <div className="cds-slider__row">
        <input
          ref={ref}
          type="range"
          id={field.id}
          className="cds-slider__input"
          style={{ '--cds-slider-filled': `${filled}%` } as React.CSSProperties}
          value={value}
          defaultValue={defaultValue}
          min={min}
          max={max}
          step={step}
          disabled={field.disabled}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field.describedBy}
          {...rest}
        />
        {valueLabel !== undefined && (
          <output className="cds-slider__value cds-numeric" htmlFor={field.id}>
            {valueLabel}
          </output>
        )}
      </div>
      {(minLabel || maxLabel) && (
        <div className="cds-slider__ends cds-body-sm" aria-hidden="true">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
})
