import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './ChartLegend.css'

export interface ChartLegendItem {
  key: string
  label: ReactNode
  color?: string
  /** Right-aligned readout — wire it to the hovered point's value. */
  value?: ReactNode
  dashed?: boolean
}

export interface ChartLegendProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: ChartLegendItem[]
  /**
   * Series keys currently switched off. Named `hiddenKeys` rather than
   * `hidden` so it does not shadow the HTML attribute of that name, which a
   * caller may still want to use on the legend itself.
   */
  hiddenKeys?: string[]
  onHiddenChange?: (keys: string[]) => void
  /** Emphasise one entry — wire to the chart's hovered series. */
  activeKey?: string | null
  onActiveKeyChange?: (key: string | null) => void
  orientation?: 'horizontal' | 'vertical'
  swatch?: 'line' | 'square' | 'dot'
  size?: 'sm' | 'md'
  label?: string
}

/**
 * The key, and the control for hiding series.
 *
 * Each entry is its own tab stop rather than a roving-focus group: these are
 * independent toggles, not a single-choice set, so the `SegmentedControl`
 * pattern would be the wrong promise to make. There are rarely more than eight.
 *
 * Toggling is only offered when `onHiddenChange` is passed — a legend with no
 * handler renders as static text rather than as buttons that do nothing.
 */
export function ChartLegend({
  items,
  hiddenKeys = [],
  onHiddenChange,
  activeKey = null,
  onActiveKeyChange,
  orientation = 'horizontal',
  swatch = 'line',
  size = 'sm',
  label = 'Series',
  className,
  ...rest
}: ChartLegendProps) {
  const interactive = typeof onHiddenChange === 'function'

  const toggle = (key: string) => {
    if (!onHiddenChange) return
    onHiddenChange(
      hiddenKeys.includes(key) ? hiddenKeys.filter(k => k !== key) : [...hiddenKeys, key]
    )
  }

  return (
    <div
      className={cx(
        'cds-chart-legend',
        `cds-chart-legend--${orientation}`,
        `cds-chart-legend--${size}`,
        className
      )}
      role="group"
      aria-label={label}
      {...rest}
    >
      {items.map(item => {
        const isHidden = hiddenKeys.includes(item.key)
        const content = (
          <>
            <span
              className={cx(
                'cds-chart-legend__swatch',
                `cds-chart-legend__swatch--${swatch}`,
                item.dashed && 'is-dashed'
              )}
            />
            <span className="cds-chart-legend__label">{item.label}</span>
            {item.value != null && (
              <span className="cds-chart-legend__value cds-numeric">{item.value}</span>
            )}
          </>
        )
        const shared = {
          className: cx(
            'cds-chart-legend__item',
            isHidden && 'is-hidden',
            activeKey === item.key && 'is-active'
          ),
          style: item.color ? { color: item.color } : undefined,
          onMouseEnter: () => onActiveKeyChange?.(item.key),
          onMouseLeave: () => onActiveKeyChange?.(null),
        }

        return interactive ? (
          <button
            key={item.key}
            type="button"
            aria-pressed={!isHidden}
            onClick={() => toggle(item.key)}
            onFocus={() => onActiveKeyChange?.(item.key)}
            onBlur={() => onActiveKeyChange?.(null)}
            {...shared}
          >
            {content}
          </button>
        ) : (
          <span key={item.key} {...shared}>
            {content}
          </span>
        )
      })}
    </div>
  )
}
