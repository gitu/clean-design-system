/**
 * Shared chart vocabulary.
 *
 * This folder is internal: it has no stories and exports no component. Only
 * the types below reach the package barrel, and they do so from here and
 * nowhere else — re-exporting them from each chart's `index.ts` as well would
 * trip `isolatedModules` on the duplicate.
 *
 * The prop shapes deliberately echo `DataTable`: a chart is given data plus
 * accessors and renders what it is given. Sorting, filtering, paging, zooming
 * and drilling stay outside, which is what keeps these usable against a server
 * that does the work.
 */
import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Identifies a datum, and links it across charts in a `ChartGroup`. Two charts
 * over the same weeks should both key on the ISO week; charts that key on
 * different things are only meaningfully grouped for `hiddenSeries`.
 */
export type ChartKey = string

export interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

/** An x window in scale units — epoch milliseconds for a time scale. */
export type ChartDomain = [number, number]

export interface ChartSeries<Datum> {
  /** Stable key. Identifies the series in the legend, tooltip and events. */
  key: string
  /** Legend and tooltip label. Defaults to `key`. */
  label?: ReactNode
  /**
   * Reads this series out of a datum. Return `null` for a genuine gap — a gap
   * breaks the line, where zero draws a point at zero. They are not the same.
   */
  value: (datum: Datum, index: number) => number | null
  /** Overrides the palette slot. Any CSS colour, or a `var(--cds-*)` token. */
  color?: string
  /** Overrides the chart's `formatValue` for this series only. */
  format?: (value: number) => string
  /**
   * Dashed stroke. Beyond four series the palette can no longer separate by
   * hue alone under colour-blind vision, so this stops being decoration and
   * starts being the thing carrying the distinction.
   */
  dashed?: boolean
}

export interface ChartDatumEvent<Datum> {
  datum: Datum
  index: number
  key: ChartKey
  /** Which series was hit. `null` when the whole x-slice was clicked. */
  seriesKey: string | null
  value: number | null
  /** Lets a caller drill down on Enter but not on a stray click. */
  source: 'pointer' | 'keyboard'
}

export interface ChartTooltipRowData {
  seriesKey: string
  label: ReactNode
  value: number | null
  formatted: string
  color: string
  dashed: boolean
}

export interface ChartTooltipContext<Datum> {
  key: ChartKey
  index: number
  datum: Datum
  xLabel: string
  rows: ChartTooltipRowData[]
}

/**
 * The four linked channels. Each resolves own prop → surrounding `ChartGroup`
 * → the chart's own internal state, so a chart works standalone, lifted, or
 * grouped without changing shape.
 */
export interface ChartInteractionProps<Datum> {
  /** The datum under the pointer *or* the keyboard cursor — one state, both inputs. */
  hoverKey?: ChartKey | null
  onHoverChange?: (key: ChartKey | null) => void
  /** Datum keys drawn at full strength; everything else dims. Cross-filtering. */
  selected?: ChartKey[]
  onSelectionChange?: (keys: ChartKey[]) => void
  /** Series keys hidden by the legend. */
  hiddenSeries?: string[]
  onHiddenSeriesChange?: (keys: string[]) => void
  /** Visible x window. `null` is the full extent. */
  zoom?: ChartDomain | null
  onZoomChange?: (domain: ChartDomain | null) => void
  /** Fires on click and on Enter. The hook for drill-down and filtering. */
  onDatumClick?: (event: ChartDatumEvent<Datum>) => void
  /** Opt out of the surrounding `ChartGroup`, wholly or per channel. */
  sync?: false | Array<'hover' | 'selection' | 'series' | 'zoom'>
}

export interface ChartBaseProps<Datum>
  extends ChartInteractionProps<Datum>,
    Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  data: Datum[]
  series: Array<ChartSeries<Datum>>
  /**
   * Stable identity per datum. Defaults to the x value as a string. Charts in
   * one `ChartGroup` must agree on this — it is the vocabulary that linking,
   * selection and the crosshair share.
   */
  datumKey?: (datum: Datum, index: number) => ChartKey
  /** Accessible name. Required — a chart with no name is unreadable to AT. */
  label: string
  /** One sentence read after the name, describing what the chart shows. */
  description?: string
  /** Plot height in pixels, excluding axes. */
  height?: number
  /** Fixed width. Omit and the chart fills its container. */
  width?: number
  /** Width used for the first render and on a server. Never 0, deliberately. */
  fallbackWidth?: number
  margin?: Partial<ChartMargin>
  /** Value formatting for axis, tooltip and announcements. */
  formatValue?: (value: number) => string
  /** `zero` anchors the baseline at 0; `auto` fits the data. */
  yDomain?: [number, number] | 'auto' | 'zero'
  yTicks?: number
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  /** `true` for the standard surface, or a render function for a custom one. */
  tooltip?: boolean | ((context: ChartTooltipContext<Datum>) => ReactNode)
  crosshair?: boolean
  loading?: boolean
  /** Shown in place of the plot when `data` is empty. */
  empty?: ReactNode
  /**
   * Enter and update transitions. Off makes a chart screenshot-deterministic,
   * which is why every visual-review story sets it.
   */
  animate?: boolean
  /** Overrides the sentence announced when the keyboard cursor moves. */
  formatAnnouncement?: (
    context: ChartTooltipContext<Datum> & { seriesKey: string | null }
  ) => string
}

/** Resolved geometry, shared by every internal piece. */
export interface ChartLayout {
  width: number
  height: number
  margin: ChartMargin
  innerWidth: number
  innerHeight: number
}

export const DEFAULT_MARGIN: ChartMargin = { top: 8, right: 12, bottom: 24, left: 44 }
