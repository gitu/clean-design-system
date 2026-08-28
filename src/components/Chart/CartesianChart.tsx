import type { MouseEvent, PointerEvent, ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { scaleLinear, scaleTime } from '@visx/scale'
import { AreaClosed, LinePath } from '@visx/shape'
import { curveLinear, curveMonotoneX, curveStepAfter } from '@visx/curve'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import type { ChartTooltipRow } from '../ChartTooltip/ChartTooltip'
import { ChartAxis, ChartGrid } from './ChartAxis'
import { ChartSurface } from './ChartSurface'
import { useChartInteraction } from './useChartInteraction'
import { useChartKeyboard } from './useChartKeyboard'
import { useChartSize } from './useChartSize'
import { formatDateForSpan, formatDateFull, formatNumber } from './chart-format'
import {
  collectStackTotals,
  collectValues,
  firstOf,
  lastOf,
  niceScale,
  resolveLayout,
  seriesColor,
  ticksFromStep,
  toNumber,
  withinZoom,
} from './chart-scales'
import type { ChartBaseProps, ChartKey, ChartTooltipContext } from './chart-types'

const CURVES = { linear: curveLinear, monotone: curveMonotoneX, step: curveStepAfter }

export interface CartesianChartProps<Datum> extends ChartBaseProps<Datum> {
  x: (datum: Datum, index: number) => Date | number
  formatX?: (value: Date | number) => string
  curve?: 'linear' | 'monotone' | 'step'
  points?: 'none' | 'hover' | 'always'
  xTicks?: number
  /** `area` fills beneath the line. */
  mode?: 'line' | 'area'
  stacked?: boolean
  stackOffset?: 'none' | 'expand'
  fillOpacity?: number
}

/**
 * The shared engine behind `LineChart` and `AreaChart`.
 *
 * Internal, because the two public components need different defaults and,
 * more importantly, different *valid* states — `stacked` is meaningful for an
 * area chart and nonsense for a line chart, and a single public component
 * would have to accept both and document one of them as ignored.
 */
export function CartesianChart<Datum>({
  data,
  series,
  x,
  datumKey,
  label,
  description,
  height = 240,
  width: fixedWidth,
  fallbackWidth = 640,
  margin,
  formatValue = formatNumber,
  formatX,
  formatAnnouncement,
  yDomain = 'auto',
  yTicks = 5,
  xTicks = 6,
  curve = 'linear',
  points = 'hover',
  mode = 'line',
  stacked = false,
  stackOffset = 'none',
  fillOpacity = 0.14,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  tooltip = true,
  crosshair = true,
  loading = false,
  empty,
  animate = true,
  className,
  style,
  onDatumClick,
  ...rest
}: CartesianChartProps<Datum>) {
  const { ref, width } = useChartSize(fixedWidth, fallbackWidth)
  const layout = resolveLayout(width, height, margin)
  const { innerWidth, innerHeight } = layout

  const interaction = useChartInteraction(rest)
  const { hoverKey, setHoverKey, selected, toggleSelection, hiddenSeries, zoom, setZoom } =
    interaction

  const visible = useMemo(
    () => series.filter(s => !hiddenSeries.includes(s.key)),
    [series, hiddenSeries]
  )
  const rows = useMemo(() => withinZoom(data, x, zoom), [data, x, zoom])
  const keyOf = useCallback(
    (datum: Datum, index: number): ChartKey =>
      datumKey ? datumKey(datum, index) : String(toNumber(x(datum, index))),
    [datumKey, x]
  )
  const keys = useMemo(() => rows.map(keyOf), [rows, keyOf])

  /* --- scales --- */

  const xValues = rows.map((datum, index) => toNumber(x(datum, index)))
  const xIsTime = rows.length > 0 && x(rows[0] as Datum, 0) instanceof Date
  const xMin = firstOf(xValues) ?? 0
  const xMax = lastOf(xValues) ?? 1
  const span = Math.max(xMax - xMin, 1)

  const xScale = useMemo(() => {
    const domain: [number, number] = xMin === xMax ? [xMin - 1, xMax + 1] : [xMin, xMax]
    return xIsTime
      ? scaleTime<number>({ domain: [new Date(domain[0]), new Date(domain[1])], range: [0, innerWidth] })
      : scaleLinear<number>({ domain, range: [0, innerWidth] })
  }, [xMin, xMax, xIsTime, innerWidth])

  const positionX = useCallback(
    (value: number) => (xIsTime ? xScale(new Date(value) as never) : xScale(value as never)) as number,
    [xScale, xIsTime]
  )

  const totals = useMemo(
    () => (stacked ? collectStackTotals(rows, visible, []) : []),
    [stacked, rows, visible]
  )
  const flat = useMemo(() => collectValues(rows, visible, []), [rows, visible])

  const yScaleInfo = useMemo(() => {
    if (Array.isArray(yDomain)) {
      const [low, high] = yDomain
      return { domain: yDomain, step: (high - low) / Math.max(yTicks - 1, 1) }
    }
    if (stacked && stackOffset === 'expand') return { domain: [0, 100] as [number, number], step: 25 }
    const pool = stacked ? totals : flat
    if (pool.length === 0) return { domain: [0, 1] as [number, number], step: 0.25 }
    // An area chart reads as a quantity, so it is anchored at zero unless the
    // caller says otherwise; a line chart is about shape and is not.
    const anchor = yDomain === 'zero' || (mode === 'area' && yDomain === 'auto') ? 'zero' : 'auto'
    return niceScale(Math.min(...pool), Math.max(...pool), anchor, yTicks)
  }, [yDomain, stacked, stackOffset, totals, flat, mode, yTicks])

  const yExtent = yScaleInfo.domain

  const yScale = useMemo(
    () => scaleLinear<number>({ domain: yExtent, range: [innerHeight, 0] }),
    [yExtent, innerHeight]
  )

  /* --- stacking --- */

  /** Cumulative baselines per datum, so each series sits on the one below it. */
  const stackBases = useMemo(() => {
    if (!stacked) return null
    const bases = new Map<string, number[]>()
    const running = new Array<number>(rows.length).fill(0)
    for (const s of visible) {
      const base = [...running]
      bases.set(s.key, base)
      rows.forEach((datum, index) => {
        const raw = s.value(datum, index)
        const value = raw === null || !Number.isFinite(raw) ? 0 : raw
        const share =
          stackOffset === 'expand'
            ? (value / (totals[index] || 1)) * 100
            : value
        running[index] = (running[index] ?? 0) + share
      })
    }
    return bases
  }, [stacked, visible, rows, stackOffset, totals])

  const valueAt = useCallback(
    (seriesKey: string, datum: Datum, index: number): number | null => {
      const s = visible.find(item => item.key === seriesKey)
      if (!s) return null
      const raw = s.value(datum, index)
      if (raw === null || !Number.isFinite(raw)) return null
      if (!stacked) return raw
      const base = stackBases?.get(seriesKey)?.[index] ?? 0
      const share = stackOffset === 'expand' ? (raw / (totals[index] || 1)) * 100 : raw
      return base + share
    },
    [visible, stacked, stackBases, stackOffset, totals]
  )

  /* --- ticks --- */

  const yTickValues = ticksFromStep(yExtent, yScaleInfo.step)
  const yAxisTicks = yTickValues.map(value => ({
    offset: yScale(value),
    label: stackOffset === 'expand' ? `${value}%` : formatValue(value),
  }))

  const xAxisTicks = useMemo(() => {
    if (rows.length === 0) return []
    // Thin the ticks to what the axis can actually hold. A date label needs
    // roughly 64px before neighbours start touching, and on a phone that means
    // three labels rather than six — six drawn anyway would just overlap into
    // an unreadable smear.
    const affordable = Math.max(Math.floor(innerWidth / 64), 2)
    const count = Math.min(xTicks, rows.length, affordable)
    const step = rows.length <= 1 ? 1 : (rows.length - 1) / Math.max(count - 1, 1)
    const seen = new Set<number>()
    const out: Array<{ offset: number; label: string }> = []
    for (let i = 0; i < count; i++) {
      const index = Math.round(i * step)
      if (seen.has(index)) continue
      seen.add(index)
      const datum = rows[index]
      if (datum === undefined) continue
      const raw = x(datum, index)
      out.push({
        offset: positionX(toNumber(raw)),
        label: formatX ? formatX(raw) : xIsTime ? formatDateForSpan(raw, span) : formatNumber(toNumber(raw)),
      })
    }
    return out
  }, [rows, xTicks, x, positionX, formatX, xIsTime, span, innerWidth])

  /* --- hover --- */

  const activeIndex = hoverKey === null ? -1 : keys.indexOf(hoverKey)
  const activeDatum = activeIndex >= 0 ? rows[activeIndex] : undefined

  const contextFor = useCallback(
    (index: number): ChartTooltipContext<Datum> | null => {
      const datum = rows[index]
      const key = keys[index]
      if (datum === undefined || key === undefined) return null
      const raw = x(datum, index)
      return {
        key,
        index,
        datum,
        xLabel: formatX ? formatX(raw) : xIsTime ? formatDateFull(raw) : formatNumber(toNumber(raw)),
        rows: visible.map((s, order) => {
          const value = s.value(datum, index)
          return {
            seriesKey: s.key,
            label: s.label ?? s.key,
            value,
            formatted: value === null ? '—' : (s.format ?? formatValue)(value),
            color: seriesColor(s, series.indexOf(s) === -1 ? order : series.indexOf(s)),
            dashed: s.dashed ?? false,
          }
        }),
      }
    },
    [rows, keys, x, formatX, xIsTime, visible, series, formatValue]
  )

  const nearestIndex = useCallback(
    (clientX: number, rect: DOMRect) => {
      if (rows.length === 0) return -1
      const local = clientX - rect.left - layout.margin.left
      let best = 0
      let bestDistance = Infinity
      xValues.forEach((value, index) => {
        const distance = Math.abs(positionX(value) - local)
        if (distance < bestDistance) {
          bestDistance = distance
          best = index
        }
      })
      return best
    },
    [rows.length, xValues, positionX, layout.margin.left]
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const index = nearestIndex(event.clientX, event.currentTarget.getBoundingClientRect())
      const key = keys[index]
      // Only write when the nearest point actually changes — otherwise every
      // pixel of movement re-renders the chart and everything linked to it.
      if (key !== undefined && key !== hoverKey) setHoverKey(key)
    },
    [nearestIndex, keys, hoverKey, setHoverKey]
  )

  const onPointerLeave = useCallback(() => setHoverKey(null), [setHoverKey])

  const activate = useCallback(
    (key: ChartKey, seriesKey: string | null, source: 'pointer' | 'keyboard') => {
      const index = keys.indexOf(key)
      const datum = rows[index]
      if (datum === undefined) return
      toggleSelection(key)
      onDatumClick?.({
        datum,
        index,
        key,
        seriesKey,
        value: seriesKey ? valueAt(seriesKey, datum, index) : null,
        source,
      })
    },
    [keys, rows, toggleSelection, onDatumClick, valueAt]
  )

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const index = nearestIndex(event.clientX, event.currentTarget.getBoundingClientRect())
      const key = keys[index]
      if (key !== undefined) activate(key, null, 'pointer')
    },
    [nearestIndex, keys, activate]
  )

  /* --- keyboard --- */

  const describe = useCallback(
    (key: ChartKey, seriesKey: string | null) => {
      const index = keys.indexOf(key)
      const context = contextFor(index)
      if (!context) return ''
      if (formatAnnouncement) return formatAnnouncement({ ...context, seriesKey })
      const row = seriesKey ? context.rows.find(r => r.seriesKey === seriesKey) : context.rows[0]
      const name = row && visible.length > 1 ? `${String(row.label)}, ` : ''
      return `${name}${context.xLabel}: ${row?.formatted ?? '—'}. Point ${index + 1} of ${keys.length}.`
    },
    [keys, contextFor, formatAnnouncement, visible.length]
  )

  const { onKeyDown, announcement } = useChartKeyboard({
    keys,
    seriesKeys: visible.map(s => s.key),
    hoverKey,
    setHoverKey,
    onActivate: (key, seriesKey) => activate(key, seriesKey, 'keyboard'),
    onEscapeZoom: () => {
      if (!zoom) return false
      setZoom(null)
      return true
    },
    describe,
  })

  /* --- screen-reader table + summary --- */

  const table = useMemo(
    () => ({
      caption: label,
      columns: rows.map((datum, index) => {
        const raw = x(datum, index)
        return formatX ? formatX(raw) : xIsTime ? formatDateFull(raw) : formatNumber(toNumber(raw))
      }),
      rows: visible.map(s => ({
        key: s.key,
        label: typeof s.label === 'string' ? s.label : s.key,
        values: rows.map((datum, index) => {
          const value = s.value(datum, index)
          return value === null ? 'no data' : (s.format ?? formatValue)(value)
        }),
      })),
    }),
    [label, rows, x, formatX, xIsTime, visible, formatValue]
  )

  const summary = useMemo(() => {
    const kind = mode === 'area' ? 'Area chart' : 'Line chart'
    if (rows.length === 0) return `${kind}. No data.`
    const from = table.columns[0]
    const to = table.columns[table.columns.length - 1]
    const seriesCount = `${visible.length} series`
    return [
      description,
      `${kind}. ${seriesCount}, ${rows.length} points from ${from} to ${to}.`,
      'Use the arrow keys to read data points.',
    ]
      .filter(Boolean)
      .join(' ')
  }, [mode, rows.length, table.columns, visible.length, description])

  /* --- marks --- */

  const activeContext = activeIndex >= 0 ? contextFor(activeIndex) : null
  const tooltipRows: ChartTooltipRow[] =
    activeContext?.rows.map(row => ({
      key: row.seriesKey,
      label: row.label,
      value: row.formatted,
      color: row.color,
      dashed: row.dashed,
    })) ?? []

  const hasData = rows.length > 0 && visible.length > 0
  const dimmed = (key: ChartKey) => selected.length > 0 && !selected.includes(key)
  // Only the whole-series dim applies to a line: a line is one mark spanning
  // every datum, so per-datum selection can't dim part of it.
  const anySelected = selected.length > 0

  const marks: ReactNode = visible.map((s, order) => {
    const paletteIndex = series.indexOf(s) === -1 ? order : series.indexOf(s)
    const colour = seriesColor(s, paletteIndex)
    const defined = (datum: Datum, index: number) => valueAt(s.key, datum, index) !== null

    return (
      <g
        key={s.key}
        className="cds-chart__series"
        style={{ color: colour, ['--cds-chart-i' as string]: order }}
      >
        {mode === 'area' && (
          <AreaClosed<Datum>
            className="cds-chart__area cds-chart__mark"
            data={rows}
            x={(datum, index) => positionX(toNumber(x(datum, index)))}
            y={(datum, index) => yScale(valueAt(s.key, datum, index) ?? 0)}
            y0={(datum, index) =>
              yScale(stacked ? (stackBases?.get(s.key)?.[index] ?? 0) : yExtent[0])
            }
            yScale={yScale}
            defined={defined}
            curve={CURVES[curve]}
            fillOpacity={fillOpacity}
          />
        )}
        <LinePath<Datum>
          className={`cds-chart__line cds-chart__mark${s.dashed ? ' cds-chart__line--dashed' : ''}`}
          data={rows}
          x={(datum, index) => positionX(toNumber(x(datum, index)))}
          y={(datum, index) => yScale(valueAt(s.key, datum, index) ?? 0)}
          defined={defined}
          curve={CURVES[curve]}
          pathLength={1}
        />
        {points !== 'none' &&
          rows.map((datum, index) => {
            const value = valueAt(s.key, datum, index)
            const key = keys[index]
            if (value === null || key === undefined) return null
            const isActive = key === hoverKey
            if (points === 'hover' && !isActive) return null
            return (
              <circle
                key={key}
                className={`cds-chart__point${isActive ? ' cds-chart__point--solid' : ''}`}
                cx={positionX(toNumber(x(datum, index)))}
                cy={yScale(value)}
                r={isActive ? 3.5 : 2.5}
                opacity={anySelected && dimmed(key) ? 0.24 : 1}
              />
            )
          })}
      </g>
    )
  })

  const fallback =
    !hasData && !loading ? (
      <div className="cds-chart__fallback cds-body-sm">{empty ?? 'No data to plot.'}</div>
    ) : undefined

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
      onPointerLeave={hasData ? onPointerLeave : undefined}
      onClick={hasData ? onClick : undefined}
      fallback={fallback}
      overlay={
        tooltip && activeContext && hasData ? (
          typeof tooltip === 'function' ? (
            tooltip(activeContext)
          ) : (
            <ChartTooltip
              title={activeContext.xLabel}
              rows={tooltipRows}
              x={(positionX(xValues[activeIndex] ?? 0) + layout.margin.left) / Math.max(width, 1)}
              placement="top"
            />
          )
        ) : undefined
      }
    >
      {showGrid && (
        <ChartGrid
          ticks={yAxisTicks}
          layout={layout}
          orientation="horizontal"
          emphasiseAt={yExtent[0] <= 0 && yExtent[1] >= 0 ? yScale(0) : undefined}
        />
      )}
      {marks}
      {crosshair && activeIndex >= 0 && activeDatum !== undefined && (
        <line
          className="cds-chart__crosshair"
          x1={positionX(xValues[activeIndex] ?? 0)}
          x2={positionX(xValues[activeIndex] ?? 0)}
          y1={0}
          y2={innerHeight}
        />
      )}
      {showYAxis && <ChartAxis ticks={yAxisTicks} layout={layout} orientation="left" />}
      {showXAxis && <ChartAxis ticks={xAxisTicks} layout={layout} orientation="bottom" />}
    </ChartSurface>
  )
}
