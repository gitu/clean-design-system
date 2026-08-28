import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../Button/Button'
import { Calendar } from '../Calendar/Calendar'
import { fromIso, toIso, type IsoDate } from '../Calendar/calendar-utils'
import { useFieldControl } from '../Field/FieldContext'
import { Icon } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { parseDate } from './date-parse'
import './DateInput.css'

export interface DateInputProps {
  value: IsoDate | null
  onChange: (value: IsoDate | null) => void
  min?: IsoDate
  max?: IsoDate
  /** Days that cannot be chosen — an embargo blackout, a closed period. */
  disabledDates?: IsoDate[]
  /** Days worth marking without disabling them. */
  markedDates?: IsoDate[]
  /**
   * The day relative input (`today`, `+3d`, `friday`) counts from. Pass one to
   * make the component deterministic in a test or a screenshot.
   */
  today?: IsoDate
  /** How to read `8/7`. Defaults to day-first. */
  dayFirst?: boolean
  locale?: string
  weekStartsOn?: 0 | 1
  size?: 'sm' | 'md' | 'lg'
  /** Defaults to the locale's own shape — `dd/mm/yyyy`, `mm/dd/yyyy`, and so on. */
  placeholder?: string
  /** Accessible name, when there is no surrounding `<Field label>`. */
  label?: string
  /** Drop the calendar button and accept typing only. */
  hideCalendar?: boolean
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  id?: string
  'aria-describedby'?: string
  className?: string
}

/**
 * A date you can type or point at.
 *
 * Typing is the primary route, which is the opposite of most date fields and
 * deliberate: the people this system is built for are at a keyboard all day,
 * and `8.7.` is faster than four clicks through a month grid. It understands
 * the shapes people actually type — `2024-07-08`, `8.7.`, `8 Jul`, `today`,
 * `+3d`, `friday` — and normalises whatever it gets to the display format on
 * blur, so the field always ends up showing one thing.
 *
 * The calendar is still there for what a grid is better at: picking a day by
 * its shape in the month rather than by its number.
 *
 * **Not `<input type="date">`.** That control renders in the browser's own UI
 * font, shows the browser's locale format rather than the application's, and
 * has no way to mark days as unavailable. See `date-parse.ts` for the longer
 * version of that argument, including what it costs.
 *
 * A value that cannot be parsed is *not* silently dropped: the field marks
 * itself invalid, says so in a live region, and keeps the text so the writer
 * can fix it rather than retype it.
 */
export function DateInput({
  value,
  onChange,
  min,
  max,
  disabledDates,
  markedDates,
  today,
  dayFirst = true,
  locale = 'en-GB',
  weekStartsOn = 1,
  size = 'md',
  placeholder,
  label = 'Date',
  hideCalendar = false,
  invalid,
  disabled,
  required,
  id,
  'aria-describedby': describedByProp,
  className,
}: DateInputProps) {
  const field = useFieldControl({
    id,
    'aria-describedby': describedByProp,
    invalid,
    required,
    disabled,
  })

  const uid = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [unparsed, setUnparsed] = useState(false)

  const format = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  )
  const longFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  )

  const display = (iso: IsoDate | null) => (iso ? format.format(fromIso(iso)) : '')

  /**
   * The placeholder, built from the same formatter that does the displaying.
   *
   * Hard-coding `dd.mm.yyyy` and then rendering `12/07/2024` is a small lie the
   * field tells on every render — it promises one separator and shows another,
   * and in a US locale it promises the wrong order outright. Asking the
   * formatter for its own parts costs four lines and cannot drift.
   */
  const shape = useMemo(() => {
    const parts = format.formatToParts(new Date(Date.UTC(2024, 11, 31)))
    return parts
      .map(part =>
        part.type === 'day' ? 'dd' : part.type === 'month' ? 'mm' : part.type === 'year' ? 'yyyy' : part.value
      )
      .join('')
  }, [format])

  const hint = placeholder ?? shape

  /**
   * What is in the box right now.
   *
   * Kept separate from `value` because they are different things while
   * somebody is mid-word: `8.` is not yet a date, and forcing it through the
   * parser on every keystroke would rewrite the field under the caret.
   */
  const [text, setText] = useState(() => display(value))
  const committed = useRef(value)

  // Follow the value when it changes from outside — a preset button, a reset,
  // a form loading its record — but never while the field is being typed in.
  useEffect(() => {
    if (value !== committed.current && document.activeElement !== inputRef.current) {
      committed.current = value
      setText(display(value))
      setUnparsed(false)
    }
    committed.current = value
    // `display` is derived from `locale`, which is in the deps via `format`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, locale])

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        inputRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const blocked = (iso: IsoDate) => {
    if (min && iso < min) return true
    if (max && iso > max) return true
    return Boolean(disabledDates?.includes(iso))
  }

  /** Parse and report. Called on blur and on Enter, never on every keystroke. */
  const commit = () => {
    const raw = text.trim()
    if (!raw) {
      setUnparsed(false)
      if (value !== null) onChange(null)
      return
    }
    const parsed = parseDate(raw, { today, dayFirst })
    if (!parsed || blocked(parsed)) {
      setUnparsed(true)
      return
    }
    setUnparsed(false)
    setText(display(parsed))
    if (parsed !== value) onChange(parsed)
  }

  const messageId = `${uid}-parse`
  const describedBy = [field.describedBy, unparsed ? messageId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cx('cds-date-input', className)} ref={wrapperRef}>
      <Input
        ref={inputRef}
        id={field.id}
        size={size}
        value={text}
        placeholder={hint}
        // A date is not a word: autocorrect and capitalisation only get in
        // the way, and `inputMode` gets the numeric keypad on a phone.
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="numeric"
        aria-label={label}
        invalid={field.invalid || unparsed}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={describedBy || undefined}
        onChange={event => {
          setText(event.target.value)
          if (unparsed) setUnparsed(false)
        }}
        onBlur={commit}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          } else if (event.key === 'ArrowDown' && event.altKey) {
            event.preventDefault()
            setOpen(true)
          }
        }}
        iconEnd={
          hideCalendar ? undefined : (
            <button
              type="button"
              className="cds-date-input__trigger"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label={`${label}: open calendar`}
              disabled={field.disabled}
              onClick={() => setOpen(current => !current)}
            >
              <Icon name="calendar" size={15} />
            </button>
          )
        }
      />

      {/* Polite rather than assertive: the writer is still typing, and an
          assertive interruption on every keystroke would be unusable. */}
      <p className="cds-date-input__message cds-body-sm" id={messageId} role="status" aria-live="polite">
        {unparsed ? `Not a date we recognise. Try ${hint}, “today” or “+3d”.` : ''}
      </p>

      {open && (
        <div className="cds-date-input__panel" role="dialog" aria-label={label}>
          <Calendar
            value={value}
            onChange={next => {
              if (next) {
                setText(display(next))
                setUnparsed(false)
              }
              onChange(next)
              setOpen(false)
              inputRef.current?.focus()
            }}
            month={value ?? today ?? toIso(new Date())}
            min={min}
            max={max}
            disabledDates={disabledDates}
            markedDates={markedDates}
            weekStartsOn={weekStartsOn}
            locale={locale}
            label={label}
          />
          <div className="cds-date-input__actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setText('')
                setUnparsed(false)
                onChange(null)
                setOpen(false)
                inputRef.current?.focus()
              }}
            >
              Clear
            </Button>
            {value && <span className="cds-date-input__readout cds-body-sm">{longFormat.format(fromIso(value))}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
