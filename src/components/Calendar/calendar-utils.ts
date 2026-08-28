/**
 * Date maths for `Calendar`, all in UTC.
 *
 * A calendar grid built from local dates renders differently on a server in
 * UTC and a browser in Europe/Zurich — the month can start on a different
 * weekday — which surfaces as a hydration mismatch in a consumer's app and
 * never here. So every date in this component is a UTC midnight, and the only
 * place a timezone enters is the caller's own formatter.
 */

/** `2024-07-08` — the wire format, and the key a day is identified by. */
export type IsoDate = string

export const toIso = (date: Date): IsoDate => date.toISOString().slice(0, 10)

export const fromIso = (iso: IsoDate): Date => new Date(`${iso}T00:00:00.000Z`)

export const utc = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month, day))

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 86_400_000)

export const addMonths = (date: Date, months: number): Date =>
  utc(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate())

export const startOfMonth = (date: Date): Date =>
  utc(date.getUTCFullYear(), date.getUTCMonth(), 1)

export const isSameDay = (a: Date, b: Date): boolean => toIso(a) === toIso(b)

export const isBefore = (a: Date, b: Date): boolean => a.getTime() < b.getTime()
export const isAfter = (a: Date, b: Date): boolean => a.getTime() > b.getTime()

export const clamp = (date: Date, min?: Date, max?: Date): Date => {
  if (min && isBefore(date, min)) return min
  if (max && isAfter(date, max)) return max
  return date
}

export const isWithin = (date: Date, min?: Date, max?: Date): boolean =>
  !(min && isBefore(date, min)) && !(max && isAfter(date, max))

/**
 * Six weeks of days covering the month, padded from the surrounding ones.
 *
 * Always six rows, never five: a grid that changes height as you page through
 * months makes the buttons move under the pointer.
 */
export function monthGrid(month: Date, weekStartsOn: number): Date[][] {
  const first = startOfMonth(month)
  const offset = (first.getUTCDay() - weekStartsOn + 7) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day))
  )
}

/** Weekday initials in the caller's locale, ordered from `weekStartsOn`. */
export function weekdayLabels(locale: string, weekStartsOn: number) {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
  // 2024-01-07 is a Sunday, so index 0 lines up with getUTCDay() === 0.
  return Array.from({ length: 7 }, (_, i) => {
    const date = utc(2024, 0, 7 + ((i + weekStartsOn) % 7))
    return { short: short.format(date), long: long.format(date) }
  })
}
