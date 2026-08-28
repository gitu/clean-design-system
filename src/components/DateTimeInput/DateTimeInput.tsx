import { useId } from 'react'
import { cx } from '../../utils/cx'
import type { IsoDate } from '../Calendar/calendar-utils'
import { useFieldControl } from '../Field/FieldContext'
import { DateInput } from '../DateInput/DateInput'
import { TimeInput } from '../TimeInput/TimeInput'
import type { TimeString } from '../TimeInput/time-parse'
import './DateTimeInput.css'

/** `2024-07-08T06:00` — a wall-clock moment, with no zone in it. */
export type LocalDateTime = string

export interface DateTimeInputProps {
  /**
   * `YYYY-MM-DDTHH:mm`, or null.
   *
   * Deliberately **not** a `Date` and deliberately **not** UTC. An embargo
   * lifting at 06:00 lifts at 06:00 in the newsroom; storing that as an instant
   * means picking a zone at the moment of entry and being wrong the next time
   * the clocks change. The zone belongs to the system that publishes, and
   * `zone` below is a label saying which one, not a conversion.
   */
  value: LocalDateTime | null
  onChange: (value: LocalDateTime | null) => void
  /** Used when a time is entered before a date. Defaults to `00:00`. */
  defaultTime?: TimeString
  min?: IsoDate
  max?: IsoDate
  disabledDates?: IsoDate[]
  /** Anchors relative input like `today` and `+3d`. */
  today?: IsoDate
  step?: number
  hour12?: boolean
  /** Shown after the time — `CET`, `Europe/Zurich`, `newsroom time`. */
  zone?: string
  locale?: string
  weekStartsOn?: 0 | 1
  size?: 'sm' | 'md' | 'lg'
  /**
   * Names the pair, and both halves of it — "Embargo lifts" becomes
   * "Embargo lifts — date" and "Embargo lifts — time". Taken from a
   * surrounding `<Field label>` when there is one.
   */
  label?: string
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

const split = (value: LocalDateTime | null): { date: IsoDate | null; time: TimeString | null } => {
  if (!value) return { date: null, time: null }
  const [date, time] = value.split('T')
  return { date: date || null, time: time ? time.slice(0, 5) : null }
}

/**
 * A date and a time, as two fields that behave like one value.
 *
 * Two controls rather than one, because they are two different acts: a date is
 * picked from a grid or typed as a shorthand, a time is typed or chosen off a
 * list of round numbers. A single field trying to accept
 * `8.7.2024 06:00` has to guess where one ends and the other begins, and gets
 * it wrong exactly when somebody is in a hurry.
 *
 * What the component is actually for is the joining: splitting an ISO string
 * into two fields and putting it back together is four lines that every form
 * writes slightly differently, and the interesting case — a time entered before
 * a date, or a date cleared while a time is still set — is where they diverge.
 * Here, clearing the date clears the value; entering a time without a date
 * holds it until the date arrives.
 */
export function DateTimeInput({
  value,
  onChange,
  defaultTime = '00:00',
  min,
  max,
  disabledDates,
  today,
  step = 30,
  hour12 = false,
  zone,
  locale = 'en-GB',
  weekStartsOn = 1,
  size = 'md',
  label,
  invalid,
  disabled,
  required,
  className,
}: DateTimeInputProps) {
  const field = useFieldControl({ invalid, required, disabled })
  const uid = useId()
  const { date, time } = split(value)

  const name = label ?? field.fieldLabel ?? 'Date and time'

  const merge = (nextDate: IsoDate | null, nextTime: TimeString | null) => {
    // No date, no moment — a time on its own is not one.
    if (!nextDate) {
      onChange(null)
      return
    }
    onChange(`${nextDate}T${nextTime ?? defaultTime}`)
  }

  return (
    <div className={cx('cds-datetime', `cds-datetime--${size}`, className)} role="group" aria-label={name}>
      <DateInput
        // The visible `<label for>` points at the field's id, so the date half
        // takes it and the time half gets one of its own. Letting both adopt it
        // would put the same id on two inputs.
        {...(field.id ? { id: field.id } : null)}
        value={date}
        onChange={next => merge(next, time)}
        {...(min !== undefined ? { min } : null)}
        {...(max !== undefined ? { max } : null)}
        {...(disabledDates !== undefined ? { disabledDates } : null)}
        {...(today !== undefined ? { today } : null)}
        locale={locale}
        weekStartsOn={weekStartsOn}
        size={size}
        label={`${name} — date`}
        {...(invalid !== undefined ? { invalid } : null)}
        {...(disabled !== undefined ? { disabled } : null)}
        {...(required !== undefined ? { required } : null)}
        className="cds-datetime__date"
      />
      <TimeInput
        value={time}
        onChange={next => merge(date, next)}
        step={step}
        hour12={hour12}
        size={size}
        id={`${uid}-time`}
        label={`${name} — time`}
        {...(zone !== undefined ? { suffix: zone } : null)}
        {...(invalid !== undefined ? { invalid } : null)}
        {...(disabled !== undefined ? { disabled } : null)}
        className="cds-datetime__time"
      />
    </div>
  )
}
