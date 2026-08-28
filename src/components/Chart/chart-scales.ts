/**
 * Domain and geometry helpers.
 *
 * `noUncheckedIndexedAccess` is on, so every array index is `T | undefined`.
 * Rather than scatter `!` through the render code, the awkwardness is
 * concentrated here and the exported functions return honest types.
 */
import type { ChartDomain, ChartLayout, ChartMargin, ChartSeries } from './chart-types'
import { DEFAULT_MARGIN } from './chart-types'

export const firstOf = <T>(items: readonly T[]): T | undefined => items[0]
export const lastOf = <T>(items: readonly T[]): T | undefined => items[items.length - 1]

/**
 * `scaleBand()(category)` is typed `number | undefined` because a category
 * outside the domain has no position. Wrapping it once keeps that `?? 0` out
 * of the render.
 */
export function bandPosition(
  scale: { (value: string): number | undefined },
  category: string
): number {
  return scale(category) ?? 0
}

export function resolveLayout(
  width: number,
  height: number,
  margin?: Partial<ChartMargin>
): ChartLayout {
  const resolved: ChartMargin = { ...DEFAULT_MARGIN, ...margin }
  return {
    width,
    height,
    margin: resolved,
    // Never negative: a chart in a very narrow container would otherwise
    // produce an inverted range and visx would draw nothing at all.
    innerWidth: Math.max(width - resolved.left - resolved.right, 0),
    innerHeight: Math.max(height - resolved.top - resolved.bottom, 0),
  }
}

/** Every finite value across every visible series. */
export function collectValues<Datum>(
  data: Datum[],
  series: Array<ChartSeries<Datum>>,
  hidden: readonly string[]
): number[] {
  const out: number[] = []
  for (const s of series) {
    if (hidden.includes(s.key)) continue
    data.forEach((datum, index) => {
      const value = s.value(datum, index)
      if (value !== null && Number.isFinite(value)) out.push(value)
    })
  }
  return out
}

/** Per-datum totals, for a stacked y-domain. */
export function collectStackTotals<Datum>(
  data: Datum[],
  series: Array<ChartSeries<Datum>>,
  hidden: readonly string[]
): number[] {
  return data.map((datum, index) => {
    let positive = 0
    let negative = 0
    for (const s of series) {
      if (hidden.includes(s.key)) continue
      const value = s.value(datum, index)
      if (value === null || !Number.isFinite(value)) continue
      if (value < 0) negative += value
      else positive += value
    }
    // Return whichever side is further from zero — the extent the axis needs.
    return Math.abs(negative) > positive ? negative : positive
  })
}

/**
 * Rounds a domain out so that *the ticks* land on round numbers, not just the
 * ends. Choosing a nice step first and then extending the domain to a whole
 * multiple of it is the difference between an axis reading 0/7,500/15,000 and
 * one reading 0/6,180/12,360.
 */
export function niceScale(
  min: number,
  max: number,
  mode: 'auto' | 'zero',
  tickCount: number
): { domain: [number, number]; step: number } {
  let low = mode === 'zero' ? Math.min(0, min) : min
  let high = mode === 'zero' ? Math.max(0, max) : max

  if (!Number.isFinite(low) || !Number.isFinite(high)) return { domain: [0, 1], step: 1 }
  if (low === high) {
    // A flat series has no extent to divide; give it one so the line sits on
    // the centre rather than collapsing onto an edge.
    if (low === 0) return { domain: [0, 1], step: 0.25 }
    const pad = Math.abs(low) * 0.1
    low -= pad
    high += pad
  }

  const intervals = Math.max(tickCount - 1, 1)
  const step = niceStep((high - low) / intervals)
  const flooredLow = Math.floor(low / step) * step
  // Extend the top to a whole number of steps above the bottom, so every tick
  // from the floor upwards is itself a multiple of the step.
  const steps = Math.ceil((high - flooredLow) / step - 1e-9)
  const ceiledHigh = flooredLow + Math.max(steps, 1) * step
  return { domain: [round(flooredLow, step), round(ceiledHigh, step)], step }
}

function niceStep(rough: number): number {
  if (rough <= 0 || !Number.isFinite(rough)) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const nice = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10
  return nice * magnitude
}

function round(value: number, step: number): number {
  // Guard against floating-point crumbs like 0.30000000000000004.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  return Number(value.toFixed(Math.min(decimals, 12)))
}

/** Ticks walked from the domain floor by the step that produced it. */
export function ticksFromStep([min, max]: [number, number], step: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || step <= 0) return [min, max]
  const out: number[] = []
  const count = Math.round((max - min) / step)
  for (let i = 0; i <= count; i++) out.push(round(min + step * i, step))
  return out
}

/** Narrows data to a zoom window without mutating or copying the caller's rows. */
export function withinZoom<Datum>(
  data: Datum[],
  x: (datum: Datum, index: number) => Date | number,
  zoom: ChartDomain | null | undefined
): Datum[] {
  if (!zoom) return data
  const [low, high] = zoom
  return data.filter((datum, index) => {
    const value = x(datum, index)
    const n = value instanceof Date ? value.getTime() : value
    return n >= low && n <= high
  })
}

export const toNumber = (value: Date | number): number =>
  value instanceof Date ? value.getTime() : value

/** The palette wraps rather than crashing past six; the docs say don't. */
export const seriesColor = (series: { color?: string }, index: number): string =>
  series.color ?? `var(--cds-color-series-${(index % 6) + 1})`
