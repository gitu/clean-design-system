import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import {
  addDays,
  addMonths,
  clamp,
  fromIso,
  isSameDay,
  isWithin,
  monthGrid,
  startOfMonth,
  toIso,
  weekdayLabels,
  type IsoDate,
} from './calendar-utils'
import './Calendar.css'

export interface CalendarRange {
  start: IsoDate | null
  end: IsoDate | null
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  /**
   * `single` picks a day, `range` picks two. Range selection takes two clicks;
   * the second one before the first swaps them rather than rejecting the click.
   */
  mode?: 'single' | 'range'
  /** Selected day, in `single` mode. `YYYY-MM-DD`. */
  value?: IsoDate | null
  onChange?: (value: IsoDate | null) => void
  /** Selected span, in `range` mode. */
  range?: CalendarRange
  onRangeChange?: (range: CalendarRange) => void
  /** The month on screen. Uncontrolled if omitted. */
  month?: IsoDate
  onMonthChange?: (month: IsoDate) => void
  min?: IsoDate
  max?: IsoDate
  /** Days that cannot be picked, on top of `min`/`max`. */
  disabledDates?: IsoDate[]
  /** Show two months side by side — the usual choice for picking a range. */
  months?: 1 | 2
  /** 0 is Sunday, 1 Monday. */
  weekStartsOn?: 0 | 1
  locale?: string
  /** A dot under a day — deadlines, entries, anything countable. */
  markedDates?: IsoDate[]
  /** Accessible name. */
  label?: string
  /** Rendered under each day number. Keep it to a word or a figure. */
  renderDay?: (iso: IsoDate) => ReactNode
}

/**
 * A month grid for picking a day or a span.
 *
 * The grid is a real `<table>` with a `<caption>`, because that is what lets a
 * screen reader say "week 3, Wednesday 17 July" rather than reading forty-two
 * buttons in a row. Only one day is tabbable at a time — a roving tabindex —
 * so tabbing past the calendar takes one press, not forty-two.
 *
 * Everything is computed in UTC. See `calendar-utils.ts` for why.
 */
export function Calendar({
  mode = 'single',
  value = null,
  onChange,
  range = { start: null, end: null },
  onRangeChange,
  month,
  onMonthChange,
  min,
  max,
  disabledDates,
  months = 1,
  weekStartsOn = 1,
  locale = 'en-GB',
  markedDates,
  label = 'Calendar',
  renderDay,
  className,
  ...rest
}: CalendarProps) {
  const minDate = min ? fromIso(min) : undefined
  const maxDate = max ? fromIso(max) : undefined
  const disabledSet = useMemo(() => new Set(disabledDates ?? []), [disabledDates])
  const markedSet = useMemo(() => new Set(markedDates ?? []), [markedDates])

  const anchor = value ?? range.start ?? month ?? toIso(new Date())
  const [internalMonth, setInternalMonth] = useState(() => toIso(startOfMonth(fromIso(anchor))))
  const shownMonth = month ? startOfMonth(fromIso(month)) : fromIso(internalMonth)

  /** The day the arrow keys are on. Starts at the selection, or the 1st. */
  const [cursor, setCursor] = useState<IsoDate>(() => value ?? range.start ?? toIso(shownMonth))
  const gridRef = useRef<HTMLDivElement>(null)

  const setMonth = useCallback(
    (next: Date) => {
      const iso = toIso(startOfMonth(next))
      if (!month) setInternalMonth(iso)
      onMonthChange?.(iso)
    },
    [month, onMonthChange]
  )

  const monthFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  )
  const dayFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  )
  const weekdays = useMemo(() => weekdayLabels(locale, weekStartsOn), [locale, weekStartsOn])

  const isDisabled = useCallback(
    (date: Date) => !isWithin(date, minDate, maxDate) || disabledSet.has(toIso(date)),
    [minDate, maxDate, disabledSet]
  )

  const select = (date: Date) => {
    if (isDisabled(date)) return
    const iso = toIso(date)
    if (mode === 'single') {
      onChange?.(value === iso ? null : iso)
      return
    }
    // First click, or starting over after a complete range.
    if (!range.start || (range.start && range.end)) {
      onRangeChange?.({ start: iso, end: null })
      return
    }
    // Second click before the first: treat it as the start, not an error.
    onRangeChange?.(
      iso < range.start ? { start: iso, end: range.start } : { start: range.start, end: iso }
    )
  }

  const moveCursor = (next: Date) => {
    const bounded = clamp(next, minDate, maxDate)
    setCursor(toIso(bounded))
    // Follow the cursor into the neighbouring month when it walks off the edge.
    if (bounded.getUTCMonth() !== shownMonth.getUTCMonth() || bounded.getUTCFullYear() !== shownMonth.getUTCFullYear()) {
      const last = addMonths(shownMonth, months - 1)
      const beforeStart = bounded.getTime() < shownMonth.getTime()
      const afterEnd =
        bounded.getUTCFullYear() > last.getUTCFullYear() ||
        (bounded.getUTCFullYear() === last.getUTCFullYear() && bounded.getUTCMonth() > last.getUTCMonth())
      if (beforeStart || afterEnd) setMonth(startOfMonth(bounded))
    }
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-iso="${toIso(bounded)}"]`)?.focus()
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = fromIso(cursor)
    const keys: Record<string, () => Date> = {
      ArrowLeft: () => addDays(current, -1),
      ArrowRight: () => addDays(current, 1),
      ArrowUp: () => addDays(current, -7),
      ArrowDown: () => addDays(current, 7),
      PageUp: () => addMonths(current, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(current, event.shiftKey ? 12 : 1),
      Home: () => addDays(current, -((current.getUTCDay() - weekStartsOn + 7) % 7)),
      End: () => addDays(current, 6 - ((current.getUTCDay() - weekStartsOn + 7) % 7)),
    }
    const next = keys[event.key]
    if (next) {
      event.preventDefault()
      moveCursor(next())
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(current)
    }
  }

  const rangeStart = range.start ? fromIso(range.start) : null
  const rangeEnd = range.end ? fromIso(range.end) : null

  return (
    <div
      className={cx('cds-calendar', months === 2 && 'cds-calendar--dual', className)}
      role="group"
      aria-label={label}
      {...rest}
    >
      <div className="cds-calendar__nav">
        <IconButton
          icon={<Icon name="chevron-left" size={15} />}
          label="Previous month"
          size="sm"
          variant="ghost"
          disabled={minDate ? startOfMonth(addMonths(shownMonth, -1)).getTime() < startOfMonth(minDate).getTime() : false}
          onClick={() => setMonth(addMonths(shownMonth, -1))}
        />
        <IconButton
          icon={<Icon name="chevron-right" size={15} />}
          label="Next month"
          size="sm"
          variant="ghost"
          disabled={maxDate ? startOfMonth(addMonths(shownMonth, 1)).getTime() > startOfMonth(maxDate).getTime() : false}
          onClick={() => setMonth(addMonths(shownMonth, 1))}
        />
      </div>

      <div className="cds-calendar__months" ref={gridRef} onKeyDown={onKeyDown}>
        {Array.from({ length: months }, (_, offset) => {
          const gridMonth = addMonths(shownMonth, offset)
          const weeks = monthGrid(gridMonth, weekStartsOn)
          return (
            <table className="cds-calendar__grid" key={toIso(gridMonth)}>
              <caption className="cds-calendar__caption cds-kicker">
                {monthFormat.format(gridMonth)}
              </caption>
              <thead>
                <tr>
                  {weekdays.map(day => (
                    <th key={day.long} scope="col" className="cds-calendar__weekday">
                      <abbr title={day.long}>{day.short}</abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={`${toIso(gridMonth)}-w${weekIndex}`}>
                    {week.map(date => {
                      const iso = toIso(date)
                      const outside = date.getUTCMonth() !== gridMonth.getUTCMonth()
                      const disabled = isDisabled(date)
                      const selected =
                        mode === 'single'
                          ? value === iso
                          : iso === range.start || iso === range.end
                      const inRange =
                        mode === 'range' &&
                        rangeStart !== null &&
                        rangeEnd !== null &&
                        date > rangeStart &&
                        date < rangeEnd
                      const today = isSameDay(date, new Date())

                      return (
                        <td key={iso} className="cds-calendar__cell">
                          <button
                            type="button"
                            data-iso={iso}
                            className={cx(
                              'cds-calendar__day',
                              outside && 'is-outside',
                              selected && 'is-selected',
                              inRange && 'is-in-range',
                              today && 'is-today',
                              iso === range.start && rangeEnd && 'is-range-start',
                              iso === range.end && 'is-range-end'
                            )}
                            disabled={disabled}
                            // Roving tabindex: one stop for the whole grid.
                            tabIndex={iso === cursor ? 0 : -1}
                            aria-pressed={selected}
                            aria-current={today ? 'date' : undefined}
                            aria-label={dayFormat.format(date)}
                            onClick={() => {
                              setCursor(iso)
                              select(date)
                            }}
                            onFocus={() => setCursor(iso)}
                          >
                            <span className="cds-calendar__number cds-numeric">
                              {date.getUTCDate()}
                            </span>
                            {renderDay && <span className="cds-calendar__extra">{renderDay(iso)}</span>}
                            {markedSet.has(iso) && <span className="cds-calendar__dot" aria-hidden="true" />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )
        })}
      </div>
    </div>
  )
}
