/**
 * Formatters, all built once at module scope — the idiom `FacetItem` already
 * uses for its counts.
 *
 * Every date formatter pins `timeZone: 'UTC'`. A server in UTC and a browser
 * in Europe/Zurich would otherwise produce different axis ticks from the same
 * timestamp, which surfaces as a React hydration mismatch in a consumer's app
 * and never here. Callers whose data is genuinely local should pass their own
 * `formatX`.
 */

const number = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

const day = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' })
const dayYear = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const month = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'short', year: '2-digit' })

/** Whole numbers grouped; fractions to two places. Axis ticks and tooltips. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? number.format(value) : decimal.format(value)
}

/** For axis ticks where the full figure would collide: 1.2K, 3.4M. */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Math.abs(value) >= 10000 ? compact.format(value) : formatNumber(value)
}

/** Picks a date format from the span being shown, so ticks stay legible. */
export function formatDateForSpan(value: Date | number, spanMs: number): string {
  const date = value instanceof Date ? value : new Date(value)
  const DAY = 86_400_000
  if (spanMs > 400 * DAY) return month.format(date)
  if (spanMs > 300 * DAY) return dayYear.format(date)
  return day.format(date)
}

/** The long form, for tooltips and announcements. */
export function formatDateFull(value: Date | number): string {
  return dayYear.format(value instanceof Date ? value : new Date(value))
}

export const formatPercent = (value: number): string =>
  `${Number.isInteger(value) ? value : decimal.format(value)}%`
