import { CartesianChart } from '../Chart/CartesianChart'
import type { ChartBaseProps } from '../Chart/chart-types'

export interface AreaChartProps<Datum> extends ChartBaseProps<Datum> {
  /** Position along x. A `Date` gives a time scale, a `number` a linear one. */
  x: (datum: Datum, index: number) => Date | number
  formatX?: (value: Date | number) => string
  curve?: 'linear' | 'monotone' | 'step'
  xTicks?: number
  /**
   * Stacking is the point of an area chart — the filled bands read as parts of
   * a whole. Unstack only for two series that genuinely overlap.
   */
  stacked?: boolean
  /** `expand` normalises each column to 100% — share over time rather than volume. */
  stackOffset?: 'none' | 'expand'
  /** Fill strength, 0–1. The default is a wash, not a block. */
  fillOpacity?: number
}

/**
 * Quantity over time, as filled bands.
 *
 * Separate from `LineChart` rather than a variant of it because stacking is
 * not a paint job: it changes the y-domain to cumulative totals, changes what
 * the tooltip means, and makes `yDomain: 'auto'` anchor at zero. A single
 * component would have to accept `stacked` on a line chart and document it as
 * ignored.
 */
export function AreaChart<Datum>({ stacked = true, ...props }: AreaChartProps<Datum>) {
  return <CartesianChart {...props} mode="area" stacked={stacked} />
}
