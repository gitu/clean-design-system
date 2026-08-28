import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './ChartTooltip.css'

export interface ChartTooltipRow {
  key: string
  label: ReactNode
  value: ReactNode
  color?: string
  dashed?: boolean
  /** Dim a row the reader is not pointing at. */
  muted?: boolean
}

export interface ChartTooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  rows?: ChartTooltipRow[]
  footer?: ReactNode
  /** Fraction across the plot, 0–1. Past 0.5 the surface flips to the left. */
  x?: number
  /** Fraction down the plot, 0–1. Ignored when `placement` is `top`. */
  y?: number
  /** `top` pins it to the plot's top edge — calmer for a multi-series read. */
  placement?: 'follow' | 'top'
  open?: boolean
}

/**
 * The readout beside the crosshair.
 *
 * It is absolutely positioned inside the chart wrapper and picks its side by
 * comparing `x` to the midpoint — arithmetic from the scale we already have.
 * There is deliberately no portal, no `getBoundingClientRect`, no collision
 * detection and no focus management: all of those would make the first floating
 * surface in this system also the first thing in it that cannot render on a
 * server.
 *
 * It is `aria-hidden`. The chart's live region does the announcing, and without
 * this a keyboard reader hears every value twice.
 */
export function ChartTooltip({
  title,
  rows = [],
  footer,
  x = 0,
  y = 0,
  placement = 'follow',
  open = true,
  className,
  style,
  ...rest
}: ChartTooltipProps) {
  const flip = x > 0.5
  return (
    <div
      className={cx(
        'cds-chart-tooltip',
        `cds-chart-tooltip--${placement}`,
        flip && 'is-flipped',
        !open && 'is-closed',
        className
      )}
      style={{
        ...style,
        left: `${x * 100}%`,
        ...(placement === 'follow' ? { top: `${y * 100}%` } : null),
      }}
      aria-hidden="true"
      {...rest}
    >
      {title != null && <div className="cds-chart-tooltip__title cds-kicker">{title}</div>}
      {rows.length > 0 && (
        <dl className="cds-chart-tooltip__rows">
          {rows.map(row => (
            <div
              key={row.key}
              className={cx('cds-chart-tooltip__row', row.muted && 'is-muted')}
              style={row.color ? { color: row.color } : undefined}
            >
              <dt className="cds-chart-tooltip__label">
                <span
                  className={cx(
                    'cds-chart-tooltip__swatch',
                    row.dashed && 'cds-chart-tooltip__swatch--dashed'
                  )}
                />
                {row.label}
              </dt>
              <dd className="cds-chart-tooltip__value cds-numeric">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer != null && <div className="cds-chart-tooltip__footer">{footer}</div>}
    </div>
  )
}
