import type { MouseEvent, PointerEvent } from 'react'
import { useCallback, useMemo } from 'react'
import { scaleBand, scaleLinear } from '@visx/scale'
import { ChartAxis, ChartGrid } from '../Chart/ChartAxis'
import { ChartSurface } from '../Chart/ChartSurface'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import type { ChartTooltipRow } from '../ChartTooltip/ChartTooltip'
import { useChartInteraction } from '../Chart/useChartInteraction'
import { useChartKeyboard } from '../Chart/useChartKeyboard'
import { useChartSize } from '../Chart/useChartSize'
import { formatNumber } from '../Chart/chart-format'
import {
  bandPosition,
  collectStackTotals,
  collectValues,
  niceScale,
  resolveLayout,
  seriesColor,
  ticksFromStep,
} from '../Chart/chart-scales'
import type { ChartBaseProps, ChartKey, ChartTooltipContext } from '../Chart/chart-types'

export interface BarChartProps<Datum> extends ChartBaseProps<Datum> {
  /** The category. Bars use a band scale, so this is a string. */
  x: (datum: Datum, index: number) => string
  /**
   * `horizontal` for long category labels — which is most of them in a search
   * application, where categories are queries, sources and facet values.
   */
  layout?: 'vertical' | 'horizontal'
  stacked?: boolean
  /** Gap between bands, 0–1. */
  barPadding?: number
  /** Stops a single bar becoming a slab on a wide chart. */
  maxBarWidth?: number
  /** Draw the value at the end of each bar. */
  valueLabels?: boolean
}

/**
 * Categorical comparison, grouped or stacked, in either orientation.
 *
 * Bars are drawn as a unit rect inside a group carrying a single `transform`,
 * rather than as a rect with animated `x`/`y`/`width`/`height`. One
 * universally-supported property then carries position, width and height
 * together, so a value change, a band-width change and a stack reorder all
 * tween identically — and it is the only way to animate this without morphing
 * geometry attributes CSS was never meant to interpolate.
 */
export function BarChart<Datum>({
  data,
  series,
  x,
  datumKey,
  label,
  description,
  height = 260,
  width: fixedWidth,
  fallbackWidth = 640,
  margin,
  formatValue = formatNumber,
  formatAnnouncement,
  yDomain = 'zero',
  yTicks = 5,
  layout: orientation = 'vertical',
  stacked = false,
  barPadding = 0.3,
  maxBarWidth = 48,
  valueLabels = false,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  tooltip = true,
  loading = false,
  empty,
  animate = true,
  className,
  style,
  onDatumClick,
  ...rest
}: BarChartProps<Datum>) {
  const { ref, width } = useChartSize(fixedWidth, fallbackWidth)
  // Horizontal bars need room on the left for the category names, which are
  // the whole reason to use that orientation.
  const layout = resolveLayout(width, height, {
    // Horizontal bars need a gutter for the category names — but a fixed 108px
    // is a third of a phone screen, so it scales down with the chart and the
    // labels ellipsize rather than the plot vanishing.
    ...(orientation === 'horizontal'
      ? { left: Math.max(Math.min(108, Math.round(width * 0.34)), 56), bottom: 28 }
      : null),
    ...margin,
  })
  const { innerWidth, innerHeight } = layout

  const { hoverKey, setHoverKey, selected, toggleSelection, hiddenSeries } =
    useChartInteraction(rest)

  const visible = useMemo(
    () => series.filter(s => !hiddenSeries.includes(s.key)),
    [series, hiddenSeries]
  )
  const categories = useMemo(() => data.map((datum, index) => x(datum, index)), [data, x])
  const keys = useMemo(
    () => data.map((datum, index) => (datumKey ? datumKey(datum, index) : x(datum, index))),
    [data, datumKey, x]
  )

  /* --- scales --- */

  const pool = useMemo(
    () => (stacked ? collectStackTotals(data, visible, []) : collectValues(data, visible, [])),
    [stacked, data, visible]
  )

  const valueScaleInfo = useMemo(() => {
    if (Array.isArray(yDomain)) {
      const [low, high] = yDomain
      return { domain: yDomain, step: (high - low) / Math.max(yTicks - 1, 1) }
    }
    if (pool.length === 0) return { domain: [0, 1] as [number, number], step: 0.25 }
    // Bars encode magnitude by length, so a non-zero baseline lies about the
    // ratios. `auto` is accepted but 'zero' is the default for a reason.
    const anchor = yDomain === 'auto' ? 'auto' : 'zero'
    return niceScale(Math.min(...pool, 0), Math.max(...pool), anchor, yTicks)
  }, [yDomain, pool, yTicks])

  const extent = valueScaleInfo.domain
  const along = orientation === 'vertical' ? innerWidth : innerHeight
  const across = orientation === 'vertical' ? innerHeight : innerWidth

  const band = useMemo(
    () => scaleBand<string>({ domain: keys, range: [0, along], padding: barPadding }),
    [keys, along, barPadding]
  )
  const valueScale = useMemo(
    () => scaleLinear<number>({ domain: extent, range: [0, across] }),
    [extent, across]
  )

  const groupWidth = Math.min(band.bandwidth(), maxBarWidth * (stacked ? 1 : visible.length))
  const barWidth = stacked ? groupWidth : groupWidth / Math.max(visible.length, 1)
  const bandInset = (band.bandwidth() - groupWidth) / 2
  const zero = valueScale(0)

  /* --- ticks --- */

  const valueTicks = ticksFromStep(extent, valueScaleInfo.step).map(value => ({
    // The value axis runs up the page vertically, and across it horizontally.
    offset: orientation === 'vertical' ? across - valueScale(value) : valueScale(value),
    label: formatValue(value),
  }))

  const categoryTicks = useMemo(() => {
    // SVG text does not ellipsize, so a label wider than the gutter would just
    // run under the plot. Budget characters against the gutter instead.
    const gutter = layout.margin.left - 12
    const maxChars = Math.max(Math.floor(gutter / 6.2), 6)
    const fit = (text: string) =>
      text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text

    const all = keys.map((key, index) => ({
      offset: bandPosition(band, key) + band.bandwidth() / 2,
      label: categories[index] ?? key,
    }))
    if (orientation === 'horizontal') return all.map(t => ({ ...t, label: fit(t.label) }))
    // Vertical bars put category names on the x-axis, where they collide long
    // before the bars do. Show every nth rather than drawing them on top of
    // each other — the bars still read, and the tooltip still names each one.
    const affordable = Math.max(Math.floor(innerWidth / 72), 1)
    if (all.length <= affordable) return all
    const stride = Math.ceil(all.length / affordable)
    return all.filter((_, index) => index % stride === 0)
  }, [keys, categories, band, orientation, innerWidth, layout.margin.left])

  /* --- geometry --- */

  const stackBases = useMemo(() => {
    if (!stacked) return null
    const bases = new Map<string, number[]>()
    const running = new Array<number>(data.length).fill(0)
    for (const s of visible) {
      bases.set(s.key, [...running])
      data.forEach((datum, index) => {
        const raw = s.value(datum, index)
        if (raw !== null && Number.isFinite(raw)) running[index] = (running[index] ?? 0) + raw
      })
    }
    return bases
  }, [stacked, visible, data])

  /* --- interaction --- */

  const contextFor = useCallback(
    (index: number): ChartTooltipContext<Datum> | null => {
      const datum = data[index]
      const key = keys[index]
      if (datum === undefined || key === undefined) return null
      return {
        key,
        index,
        datum,
        xLabel: categories[index] ?? key,
        rows: visible.map(s => {
          const value = s.value(datum, index)
          return {
            seriesKey: s.key,
            label: s.label ?? s.key,
            value,
            formatted: value === null ? '—' : (s.format ?? formatValue)(value),
            color: seriesColor(s, series.indexOf(s)),
            dashed: s.dashed ?? false,
          }
        }),
      }
    },
    [data, keys, categories, visible, series, formatValue]
  )

  const indexAt = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const local =
        orientation === 'vertical'
          ? clientX - rect.left - layout.margin.left
          : clientY - rect.top - layout.margin.top
      let best = -1
      let bestDistance = Infinity
      keys.forEach((key, index) => {
        const centre = bandPosition(band, key) + band.bandwidth() / 2
        const distance = Math.abs(centre - local)
        if (distance < bestDistance) {
          bestDistance = distance
          best = index
        }
      })
      return bestDistance <= band.step() ? best : -1
    },
    [orientation, layout.margin, keys, band]
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const index = indexAt(event.clientX, event.clientY, rect)
      const key = index >= 0 ? keys[index] : null
      if ((key ?? null) !== hoverKey) setHoverKey(key ?? null)
    },
    [indexAt, keys, hoverKey, setHoverKey]
  )

  const activate = useCallback(
    (key: ChartKey, seriesKey: string | null, source: 'pointer' | 'keyboard') => {
      const index = keys.indexOf(key)
      const datum = data[index]
      if (datum === undefined) return
      toggleSelection(key)
      const s = seriesKey ? visible.find(item => item.key === seriesKey) : undefined
      onDatumClick?.({
        datum,
        index,
        key,
        seriesKey,
        value: s ? s.value(datum, index) : null,
        source,
      })
    },
    [keys, data, toggleSelection, visible, onDatumClick]
  )

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const index = indexAt(event.clientX, event.clientY, rect)
      const key = index >= 0 ? keys[index] : undefined
      if (key !== undefined) activate(key, null, 'pointer')
    },
    [indexAt, keys, activate]
  )

  const describe = useCallback(
    (key: ChartKey, seriesKey: string | null) => {
      const index = keys.indexOf(key)
      const context = contextFor(index)
      if (!context) return ''
      if (formatAnnouncement) return formatAnnouncement({ ...context, seriesKey })
      const row = seriesKey ? context.rows.find(r => r.seriesKey === seriesKey) : context.rows[0]
      const name = row && visible.length > 1 ? `${String(row.label)}, ` : ''
      return `${name}${context.xLabel}: ${row?.formatted ?? '—'}. Bar ${index + 1} of ${keys.length}.`
    },
    [keys, contextFor, formatAnnouncement, visible.length]
  )

  const { onKeyDown, announcement } = useChartKeyboard({
    keys,
    seriesKeys: visible.map(s => s.key),
    hoverKey,
    setHoverKey,
    onActivate: (key, seriesKey) => activate(key, seriesKey, 'keyboard'),
    describe,
  })

  /* --- screen reader --- */

  const table = useMemo(
    () => ({
      caption: label,
      columns: categories,
      rows: visible.map(s => ({
        key: s.key,
        label: typeof s.label === 'string' ? s.label : s.key,
        values: data.map((datum, index) => {
          const value = s.value(datum, index)
          return value === null ? 'no data' : (s.format ?? formatValue)(value)
        }),
      })),
    }),
    [label, categories, visible, data, formatValue]
  )

  const summary = [
    description,
    `Bar chart. ${visible.length} series across ${data.length} categories.`,
    'Use the arrow keys to read bars.',
  ]
    .filter(Boolean)
    .join(' ')

  const hasData = data.length > 0 && visible.length > 0
  const activeIndex = hoverKey === null ? -1 : keys.indexOf(hoverKey)
  const activeContext = activeIndex >= 0 ? contextFor(activeIndex) : null
  const tooltipRows: ChartTooltipRow[] =
    activeContext?.rows.map(row => ({
      key: row.seriesKey,
      label: row.label,
      value: row.formatted,
      color: row.color,
    })) ?? []

  return (
    <ChartSurface
      containerRef={ref}
      layout={layout}
      label={label}
      description={summary}
      announcement={announcement}
      table={table}
      className={className}
      style={style}
      interactive={hasData}
      animate={animate}
      onKeyDown={onKeyDown}
      onPointerMove={hasData ? onPointerMove : undefined}
      onPointerLeave={hasData ? () => setHoverKey(null) : undefined}
      onClick={hasData ? onClick : undefined}
      fallback={
        !hasData && !loading ? (
          <div className="cds-chart__fallback cds-body-sm">{empty ?? 'No data to plot.'}</div>
        ) : undefined
      }
      overlay={
        tooltip && activeContext && hasData ? (
          typeof tooltip === 'function' ? (
            tooltip(activeContext)
          ) : (
            <ChartTooltip
              title={activeContext.xLabel}
              rows={tooltipRows}
              x={
                orientation === 'vertical'
                  ? (bandPosition(band, activeContext.key) +
                      band.bandwidth() / 2 +
                      layout.margin.left) /
                    Math.max(width, 1)
                  : 0.5
              }
              placement="top"
            />
          )
        ) : undefined
      }
    >
      {showGrid && (
        <ChartGrid
          ticks={valueTicks}
          layout={layout}
          orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'}
          emphasiseAt={orientation === 'vertical' ? across - zero : zero}
        />
      )}

      {data.map((datum, index) => {
        const key = keys[index]
        if (key === undefined) return null
        const dimmed = selected.length > 0 && !selected.includes(key)
        const start = bandPosition(band, key) + bandInset

        return (
          <g key={key} className={dimmed ? 'cds-chart__mark is-dimmed' : 'cds-chart__mark'}>
            {visible.map((s, order) => {
              const raw = s.value(datum, index)
              if (raw === null || !Number.isFinite(raw)) return null
              const base = stacked ? (stackBases?.get(s.key)?.[index] ?? 0) : 0
              const length = valueScale(base + raw) - valueScale(base)
              const offset = stacked ? valueScale(base) : 0
              const lane = stacked ? start : start + order * barWidth
              // Never let the scale collapse to zero: a non-invertible matrix
              // makes the browser drop the node entirely.
              const size = Math.max(Math.abs(length), 0.001)

              const transform =
                orientation === 'vertical'
                  ? `translate(${lane}, ${across - offset}) scale(${barWidth}, ${-size})`
                  : `translate(${offset}, ${lane}) scale(${size}, ${barWidth})`

              return (
                <g
                  key={s.key}
                  className="cds-chart__series"
                  style={{ color: seriesColor(s, series.indexOf(s)), ['--cds-chart-i' as string]: Math.min(index, 24) }}
                >
                  <rect className="cds-chart__bar" x={0} y={0} width={1} height={1} transform={transform} />
                </g>
              )
            })}

            {valueLabels &&
              visible.length === 1 &&
              (() => {
                const s = visible[0]
                const raw = s ? s.value(datum, index) : null
                if (!s || raw === null) return null
                const end = valueScale(raw)
                return orientation === 'vertical' ? (
                  <text
                    className="cds-chart__tick"
                    x={start + groupWidth / 2}
                    y={across - end - 6}
                    textAnchor="middle"
                  >
                    {(s.format ?? formatValue)(raw)}
                  </text>
                ) : (
                  <text
                    className="cds-chart__tick"
                    x={end + 6}
                    y={start + groupWidth / 2}
                    dominantBaseline="middle"
                  >
                    {(s.format ?? formatValue)(raw)}
                  </text>
                )
              })()}
          </g>
        )
      })}

      {orientation === 'vertical' ? (
        <>
          {showYAxis && <ChartAxis ticks={valueTicks} layout={layout} orientation="left" />}
          {showXAxis && <ChartAxis ticks={categoryTicks} layout={layout} orientation="bottom" />}
        </>
      ) : (
        <>
          {showYAxis && <ChartAxis ticks={categoryTicks} layout={layout} orientation="left" />}
          {showXAxis && <ChartAxis ticks={valueTicks} layout={layout} orientation="bottom" />}
        </>
      )}
    </ChartSurface>
  )
}
