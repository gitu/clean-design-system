/**
 * Turning what somebody typed into a time of day.
 *
 * The wire format is always `HH:mm`, 24-hour, zero-padded — one shape to store,
 * compare and sort, whatever the field happens to be displaying. `hour12` is a
 * presentation choice and lives in the component, not in the value.
 */

/** `09:30`. The only shape this module ever returns. */
export type TimeString = string

const pad = (n: number) => String(n).padStart(2, '0')

export const toTime = (hours: number, minutes: number): TimeString =>
  `${pad(hours)}:${pad(minutes)}`

/**
 * Parses a typed time, or returns null.
 *
 * Accepts `9` · `930` · `9:30` · `9.30` · `9h30` · `9am` · `9:30 pm` ·
 * `21:00` · `noon` · `midnight`.
 *
 * A bare hour is an hour, not an ambiguity: `9` is 09:00. `9pm` is the only
 * way to mean the evening in a 24-hour field, which is why the suffix is
 * accepted even when the field displays 24-hour time.
 */
export function parseTime(input: string): TimeString | null {
  const text = input.trim().toLowerCase().replace(/\s+/g, '')
  if (!text) return null

  if (text === 'noon' || text === 'midday') return '12:00'
  if (text === 'midnight') return '00:00'

  const match = /^(\d{1,2})(?:[:.h]?(\d{2}))?(am|pm|a|p)?$/.exec(text)
  if (!match) return null

  let hours = Number(match[1])
  const minutes = match[2] ? Number(match[2]) : 0
  const suffix = match[3]?.[0]

  // `930` and `1345` — no separator, so the digits themselves say where the
  // split is. Only reachable when the first group ate everything.
  if (!match[2] && !suffix && (match[1]?.length ?? 0) > 2) return null
  if (!match[2] && match[1]?.length === 4) return null

  if (suffix === 'p' && hours < 12) hours += 12
  if (suffix === 'a' && hours === 12) hours = 0

  if (hours > 23 || minutes > 59) return null
  return toTime(hours, minutes)
}

/**
 * `930` and `1345` — four or three digits with no separator at all.
 *
 * Split out because the main pattern deliberately refuses them: `1345` would
 * otherwise parse as hour 1345. People type this constantly, so it gets its own
 * pass rather than a looser regex that would also accept nonsense.
 */
export function parseCompactTime(input: string): TimeString | null {
  const digits = input.trim()
  if (!/^\d{3,4}$/.test(digits)) return null
  const hours = Number(digits.slice(0, digits.length - 2))
  const minutes = Number(digits.slice(-2))
  if (hours > 23 || minutes > 59) return null
  return toTime(hours, minutes)
}

/** Both passes, in the order that gets the common cases right. */
export function parseAnyTime(input: string): TimeString | null {
  return parseCompactTime(input) ?? parseTime(input)
}

export interface TimeOptionsConfig {
  /** Minutes between suggestions. */
  step?: number
  /** Earliest suggestion, `HH:mm`. */
  min?: TimeString
  /** Latest suggestion, `HH:mm`. */
  max?: TimeString
}

/** Every `step` minutes across the allowed span — the listbox's contents. */
export function timeOptions({ step = 30, min = '00:00', max = '23:59' }: TimeOptionsConfig = {}) {
  const toMinutes = (time: TimeString) => {
    const [h = '0', m = '0'] = time.split(':')
    return Number(h) * 60 + Number(m)
  }
  const from = toMinutes(min)
  const to = toMinutes(max)
  const out: TimeString[] = []
  for (let minutes = Math.ceil(from / step) * step; minutes <= to; minutes += step) {
    out.push(toTime(Math.floor(minutes / 60), minutes % 60))
  }
  return out
}

/**
 * How a time is shown.
 *
 * Not `Intl.DateTimeFormat`: it needs a `Date`, and building one from a time of
 * day means inventing a date to hang it on, which then has to be pinned to UTC
 * to stop the formatter shifting it. For `HH:mm` the arithmetic is three lines
 * and has no timezone in it at all.
 */
export function formatTime(time: TimeString, hour12 = false): string {
  const [h = '0', m = '00'] = time.split(':')
  const hours = Number(h)
  if (!hour12) return `${pad(hours)}:${m}`
  const suffix = hours < 12 ? 'am' : 'pm'
  const shown = hours % 12 === 0 ? 12 : hours % 12
  return `${shown}:${m} ${suffix}`
}
