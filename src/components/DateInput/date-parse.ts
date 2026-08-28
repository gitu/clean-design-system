import { addDays, addMonths, toIso, utc, type IsoDate } from '../Calendar/calendar-utils'

/**
 * Turning what somebody typed into a date.
 *
 * The reason this exists rather than `<input type="date">`: the native control
 * renders in the browser's own UI font and metrics, shows the *browser's*
 * locale format rather than the application's, and cannot be told which days
 * are unavailable. In a system whose entire subject is typographic consistency,
 * a field that looks different in every browser is a visible seam.
 *
 * The reason it is worth the code: people in a hurry type `8.7.`, `+3d` and
 * `friday`, and a date field that understands those is meaningfully faster than
 * one that makes you point at a grid. The grid stays available for the case it
 * is better at — "the last Thursday in March" is a shape you point at.
 *
 * Everything is UTC, matching `calendar-utils`, so a date is the same date on a
 * server and in a browser.
 */

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Two-digit years land in the current century unless that is absurdly far off. */
function fullYear(year: number, todayYear: number): number {
  if (year >= 1000) return year
  const century = Math.floor(todayYear / 100) * 100
  const candidate = century + year
  // `98` in 2024 means 1998, not 2098.
  return candidate - todayYear > 50 ? candidate - 100 : candidate
}

function monthIndex(name: string): number | null {
  const needle = name.toLowerCase()
  const index = MONTHS.findIndex(month => month.startsWith(needle) && needle.length >= 3)
  return index === -1 ? null : index
}

function build(year: number, month: number, day: number): IsoDate | null {
  if (month < 0 || month > 11 || day < 1 || day > 31) return null
  const date = utc(year, month, day)
  // Rejects 31 February rather than silently rolling it into March.
  if (date.getUTCMonth() !== ((month % 12) + 12) % 12 || date.getUTCDate() !== day) return null
  return toIso(date)
}

export interface ParseDateOptions {
  /** The day relative expressions are measured from. Defaults to the real today. */
  today?: IsoDate
  /**
   * How to read `8/7/2024`. `true` (the default) means 8 July, matching the
   * rest of the world; `false` means 7 August, matching the United States.
   * Ambiguous by nature, which is why the placeholder shows the expected shape.
   */
  dayFirst?: boolean
}

/**
 * Parses a typed date, or returns null.
 *
 * Accepts, in order of how often people type them:
 * `2024-07-08` · `8.7.2024` · `8.7.` · `8/7/2024` · `8 Jul 2024` · `Jul 8` ·
 * `today` · `tomorrow` · `yesterday` · `+3d` · `-2w` · `+1m` · `friday`
 */
export function parseDate(input: string, options: ParseDateOptions = {}): IsoDate | null {
  const text = input.trim().toLowerCase()
  if (!text) return null

  const todayIso = options.today ?? toIso(new Date())
  const today = new Date(`${todayIso}T00:00:00.000Z`)
  const dayFirst = options.dayFirst ?? true

  if (text === 'today' || text === 'now') return toIso(today)
  if (text === 'tomorrow') return toIso(addDays(today, 1))
  if (text === 'yesterday') return toIso(addDays(today, -1))

  // `+3`, `+3d`, `-2w`, `+1m`
  const relative = text.match(/^([+-])\s*(\d{1,4})\s*(d|day|days|w|week|weeks|m|month|months)?$/)
  if (relative) {
    const sign = relative[1] === '-' ? -1 : 1
    const amount = Number(relative[2]) * sign
    const unit = relative[3]?.[0] ?? 'd'
    if (unit === 'm') return toIso(addMonths(today, amount))
    return toIso(addDays(today, unit === 'w' ? amount * 7 : amount))
  }

  // A weekday name means the next one, and never today — "friday" typed on a
  // Friday means the Friday you are heading towards.
  const weekday = WEEKDAYS.findIndex(name => name.startsWith(text) && text.length >= 3)
  if (weekday !== -1) {
    const delta = ((weekday - today.getUTCDay() + 7) % 7) || 7
    return toIso(addDays(today, delta))
  }

  // ISO, and the `2024/07/08` variant of it.
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (iso) return build(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))

  // `8 Jul 2024`, `8 July`, `8. Juli` — day, then a month name.
  const dayMonth = text.match(/^(\d{1,2})\.?\s+([a-zà-ÿ]+)\.?(?:\s+(\d{2,4}))?$/)
  if (dayMonth) {
    const month = monthIndex(dayMonth[2] ?? '')
    if (month !== null) {
      const year = dayMonth[3] ? fullYear(Number(dayMonth[3]), today.getUTCFullYear()) : today.getUTCFullYear()
      return build(year, month, Number(dayMonth[1]))
    }
  }

  // `Jul 8`, `July 8 2024` — month name, then day.
  const monthDay = text.match(/^([a-zà-ÿ]+)\.?\s+(\d{1,2})(?:,?\s+(\d{2,4}))?$/)
  if (monthDay) {
    const month = monthIndex(monthDay[1] ?? '')
    if (month !== null) {
      const year = monthDay[3] ? fullYear(Number(monthDay[3]), today.getUTCFullYear()) : today.getUTCFullYear()
      return build(year, month, Number(monthDay[2]))
    }
  }

  // `8.7.2024`, `8/7/24`, `8.7.` and bare `8.7`.
  const numeric = text.match(/^(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\.?$/)
  if (numeric) {
    const a = Number(numeric[1])
    const b = Number(numeric[2])
    const year = numeric[3] ? fullYear(Number(numeric[3]), today.getUTCFullYear()) : today.getUTCFullYear()
    const [day, month] = dayFirst ? [a, b] : [b, a]
    return build(year, month - 1, day)
  }

  // A bare number is a day in the current month — `24` on the 8th of July.
  const bare = text.match(/^(\d{1,2})\.?$/)
  if (bare) {
    return build(today.getUTCFullYear(), today.getUTCMonth(), Number(bare[1]))
  }

  return null
}
