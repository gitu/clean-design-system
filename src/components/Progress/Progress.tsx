import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Progress.css'

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Omit for an indeterminate bar — work is happening, duration unknown. */
  value?: number
  max?: number
  /** Accessible name. Required: a bare bar tells a screen reader nothing. */
  label: string
  /** Shown above the bar, with the value on the right. */
  showLabel?: boolean
  /** Overrides the right-hand readout. Defaults to a percentage. */
  valueLabel?: ReactNode
  size?: 'sm' | 'md'
  tone?: 'accent' | 'success' | 'warning' | 'danger'
}

/**
 * A determinate or indeterminate progress bar.
 *
 * Indeterminate reuses `Skeleton`'s sweep rather than inventing a second
 * "something is happening" motion, and follows the same rule `Spinner` set:
 * under reduced motion the sweep is replaced by a calmer pulse rather than
 * removed, because a still bar reads as stalled.
 */
export function Progress({
  value,
  max = 100,
  label,
  showLabel = false,
  valueLabel,
  size = 'md',
  tone = 'accent',
  className,
  ...rest
}: ProgressProps) {
  const indeterminate = value === undefined
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max)
  const percent = max === 0 ? 0 : (clamped / max) * 100

  return (
    <div className={cx('cds-progress', `cds-progress--${size}`, `cds-progress--${tone}`, className)} {...rest}>
      {showLabel && (
        <div className="cds-progress__labels">
          <span className="cds-progress__label cds-kicker">{label}</span>
          <span className="cds-progress__value cds-numeric">
            {valueLabel ?? (indeterminate ? '' : `${Math.round(percent)}%`)}
          </span>
        </div>
      )}
      <div
        className={cx('cds-progress__track', indeterminate && 'is-indeterminate')}
        role="progressbar"
        aria-label={label}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : (typeof valueLabel === 'string' ? valueLabel : undefined)}
      >
        <div
          className="cds-progress__fill"
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
