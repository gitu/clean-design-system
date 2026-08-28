import { CartesianChart } from '../Chart/CartesianChart'
import type { ChartBaseProps } from '../Chart/chart-types'

export interface LineChartProps<Datum> extends ChartBaseProps<Datum> {
  /** Position along x. A `Date` gives a time scale, a `number` a linear one. */
  x: (datum: Datum, index: number) => Date | number
  formatX?: (value: Date | number) => string
  curve?: 'linear' | 'monotone' | 'step'
  /**
   * `hover` draws a dot only at the point being read, which is the editorial
   * default — a line with twenty dots on it is a line you read twice.
   */
  points?: 'none' | 'hover' | 'always'
  xTicks?: number
}

/**
 * A time series. Data goes in wide — one row per x position, one accessor per
 * series — because that is what a chart draws; pivot a long table before you
 * get here, the same way you would sort before handing rows to `DataTable`.
 *
 * Past four series the palette can no longer separate by hue alone under
 * colour-blind vision, so mark the fifth and sixth `dashed` or group them into
 * an "Other".
 */
export function LineChart<Datum>(props: LineChartProps<Datum>) {
  return <CartesianChart {...props} mode="line" />
}
