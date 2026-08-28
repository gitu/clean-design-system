/**
 * Axes, in-house rather than `@visx/axis`.
 *
 * `@visx/axis` reaches `@visx/text`, which brings lodash and measures strings
 * through the DOM — a runtime dependency and an SSR hazard in exchange for
 * tick rendering we would have had to restyle from scratch anyway. What it
 * actually provides is `scale.ticks()`, and `@visx/scale` already exposes that
 * on the scale itself.
 *
 * Ticks are set as kickers over a hairline, matching every other small label
 * in the system.
 */
import type { ChartLayout } from './chart-types'

export interface AxisTick {
  /** Position along the axis, in plot pixels. */
  offset: number
  label: string
}

interface ChartAxisProps {
  ticks: AxisTick[]
  layout: ChartLayout
  orientation: 'bottom' | 'left'
  /** Draw the axis line itself. Off when a grid line already sits there. */
  line?: boolean
}

export function ChartAxis({ ticks, layout, orientation, line = true }: ChartAxisProps) {
  const { innerWidth, innerHeight } = layout

  if (orientation === 'bottom') {
    return (
      <g className="cds-chart__axis cds-chart__axis--x" transform={`translate(0,${innerHeight})`}>
        {line && <line className="cds-chart__axis-line" x1={0} x2={innerWidth} y1={0} y2={0} />}
        {ticks.map(tick => (
          <text
            key={`${tick.offset}-${tick.label}`}
            className="cds-chart__tick"
            x={tick.offset}
            y={16}
            textAnchor="middle"
          >
            {tick.label}
          </text>
        ))}
      </g>
    )
  }

  return (
    <g className="cds-chart__axis cds-chart__axis--y">
      {ticks.map(tick => (
        <text
          key={`${tick.offset}-${tick.label}`}
          className="cds-chart__tick"
          x={-8}
          y={tick.offset}
          textAnchor="end"
          dominantBaseline="middle"
        >
          {tick.label}
        </text>
      ))}
    </g>
  )
}

interface ChartGridProps {
  ticks: AxisTick[]
  layout: ChartLayout
  orientation: 'horizontal' | 'vertical'
  /** Draw the line at this value heavier — the zero line, usually. */
  emphasiseAt?: number
}

/**
 * Gridlines are `rule-subtle`, one step quieter than the hairlines that carry
 * page structure, so the data always sits in front of them.
 */
export function ChartGrid({ ticks, layout, orientation, emphasiseAt }: ChartGridProps) {
  const { innerWidth, innerHeight } = layout
  return (
    <g className="cds-chart__grid" aria-hidden="true">
      {ticks.map(tick => {
        const emphasis = emphasiseAt !== undefined && Math.abs(tick.offset - emphasiseAt) < 0.5
        return orientation === 'horizontal' ? (
          <line
            key={`${tick.offset}-${tick.label}`}
            className={emphasis ? 'cds-chart__gridline is-baseline' : 'cds-chart__gridline'}
            x1={0}
            x2={innerWidth}
            y1={tick.offset}
            y2={tick.offset}
          />
        ) : (
          <line
            key={`${tick.offset}-${tick.label}`}
            className={emphasis ? 'cds-chart__gridline is-baseline' : 'cds-chart__gridline'}
            x1={tick.offset}
            x2={tick.offset}
            y1={0}
            y2={innerHeight}
          />
        )
      })}
    </g>
  )
}
