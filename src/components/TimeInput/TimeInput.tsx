import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import { Icon } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { formatTime, parseAnyTime, timeOptions, type TimeString } from './time-parse'
import './TimeInput.css'

export interface TimeInputProps {
  /** Always `HH:mm`, 24-hour, whatever the field displays. */
  value: TimeString | null
  onChange: (value: TimeString | null) => void
  /** Minutes between the suggestions in the list. */
  step?: number
  min?: TimeString
  max?: TimeString
  /** Show and accept `9:30 pm` rather than `21:30`. */
  hour12?: boolean
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
  /** Accessible name, when there is no surrounding `<Field label>`. */
  label?: string
  /** Text fused to the trailing edge — a timezone, usually. */
  suffix?: string
  /** Drop the suggestion list and accept typing only. */
  hideList?: boolean
  invalid?: boolean
  disabled?: boolean
  required?: boolean
  id?: string
  'aria-describedby'?: string
  className?: string
}

/**
 * A time of day, typed, with the round numbers one keystroke away.
 *
 * Built as a real combobox rather than a `<select>` of every half hour: at a
 * five-minute step a day is 288 options, which is a scroll, not a choice. So
 * the text field is the control and the list is a filter over it — typing `9`
 * narrows to the nine o'clocks, and `9:47` is simply accepted, which a select
 * could never do.
 *
 * It reads `930`, `9.30`, `9h30`, `9am` and `noon` as well as `09:30`, because
 * those are what people type when they are not thinking about the field. The
 * value handed back is always `HH:mm` in 24-hour time — `hour12` changes what
 * is displayed and never what is stored, so a form does not have to know which
 * way the field happened to be rendered.
 *
 * **Not `<input type="time">`**, for the same reasons as `DateInput`: browser
 * chrome, browser locale, no control over the step list, and on desktop Firefox
 * no picker at all.
 */
export function TimeInput({
  value,
  onChange,
  step = 30,
  min,
  max,
  hour12 = false,
  size = 'md',
  placeholder,
  label = 'Time',
  suffix,
  hideList = false,
  invalid,
  disabled,
  required,
  id,
  'aria-describedby': describedByProp,
  className,
}: TimeInputProps) {
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
  const listRef = useRef<HTMLUListElement>(null)

  const [open, setOpen] = useState(false)
  const [unparsed, setUnparsed] = useState(false)
  const [active, setActive] = useState<number>(-1)

  const display = (time: TimeString | null) => (time ? formatTime(time, hour12) : '')
  const [text, setText] = useState(() => display(value))
  const committed = useRef(value)

  const all = useMemo(() => {
    const config: { step: number; min?: TimeString; max?: TimeString } = { step }
    if (min !== undefined) config.min = min
    if (max !== undefined) config.max = max
    return timeOptions(config)
  }, [step, min, max])

  /**
   * The list, narrowed by what has been typed.
   *
   * Matches on the *displayed* form so that typing `9` finds `9:30 pm` in a
   * 12-hour field, and on the raw form so `21` still finds it in a 24-hour one.
   */
  const options = useMemo(() => {
    const needle = text.trim().toLowerCase().replace(/\s+/g, '')
    if (!needle) return all
    const hit = all.filter(
      time =>
        formatTime(time, hour12).toLowerCase().replace(/\s+/g, '').startsWith(needle) ||
        time.startsWith(needle) ||
        time.replace(':', '').startsWith(needle)
    )
    return hit.length > 0 ? hit : all
  }, [all, text, hour12])

  useEffect(() => {
    if (value !== committed.current && document.activeElement !== inputRef.current) {
      setText(display(value))
      setUnparsed(false)
    }
    committed.current = value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, hour12])

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the highlighted option in view as the arrows walk it.
  useEffect(() => {
    if (!open || active < 0) return
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const inRange = (time: TimeString) => !(min && time < min) && !(max && time > max)

  const choose = (time: TimeString) => {
    setText(display(time))
    setUnparsed(false)
    setOpen(false)
    setActive(-1)
    onChange(time)
    inputRef.current?.focus()
  }

  const commit = () => {
    const raw = text.trim()
    if (!raw) {
      setUnparsed(false)
      if (value !== null) onChange(null)
      return
    }
    const parsed = parseAnyTime(raw)
    if (!parsed || !inRange(parsed)) {
      setUnparsed(true)
      return
    }
    setUnparsed(false)
    setText(display(parsed))
    if (parsed !== value) onChange(parsed)
  }

  const listId = `${uid}-list`
  const messageId = `${uid}-parse`
  const describedBy = [field.describedBy, unparsed ? messageId : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cx('cds-time-input', className)} ref={wrapperRef}>
      <Input
        ref={inputRef}
        id={field.id}
        size={size}
        value={text}
        placeholder={placeholder ?? (hour12 ? '9:30 am' : 'hh:mm')}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="numeric"
        aria-label={label}
        invalid={field.invalid || unparsed}
        disabled={field.disabled}
        required={field.required}
        aria-describedby={describedBy || undefined}
        // The combobox wiring lives on the input itself, which is what
        // assistive tech reads — the wrapper is presentational.
        role={hideList ? undefined : 'combobox'}
        aria-expanded={hideList ? undefined : open}
        aria-controls={hideList || !open ? undefined : listId}
        aria-autocomplete={hideList ? undefined : 'list'}
        aria-activedescendant={open && active >= 0 ? `${uid}-opt-${active}` : undefined}
        onChange={event => {
          setText(event.target.value)
          if (unparsed) setUnparsed(false)
          if (!hideList) setOpen(true)
          setActive(-1)
        }}
        onFocus={() => !hideList && setOpen(true)}
        onBlur={commit}
        onKeyDown={event => {
          if (hideList) {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
            return
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActive(current => Math.min(current + 1, options.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive(current => Math.max(current - 1, 0))
          } else if (event.key === 'Home' && open) {
            event.preventDefault()
            setActive(0)
          } else if (event.key === 'End' && open) {
            event.preventDefault()
            setActive(options.length - 1)
          } else if (event.key === 'Enter') {
            event.preventDefault()
            const picked = active >= 0 ? options[active] : undefined
            if (picked) choose(picked)
            else {
              commit()
              setOpen(false)
            }
          } else if (event.key === 'Escape') {
            if (open) {
              event.stopPropagation()
              setOpen(false)
              setActive(-1)
            }
          } else if (event.key === 'Tab') {
            setOpen(false)
          }
        }}
        suffix={suffix}
        iconEnd={<Icon name="clock" size={15} className="cds-time-input__icon" />}
      />

      <p className="cds-time-input__message cds-body-sm" id={messageId} role="status" aria-live="polite">
        {unparsed ? 'Not a time we recognise. Try 9:30, 930 or 9am.' : ''}
      </p>

      {open && !hideList && options.length > 0 && (
        <ul className="cds-time-input__list" id={listId} role="listbox" aria-label={label} ref={listRef}>
          {options.map((time, index) => (
            <li
              key={time}
              id={`${uid}-opt-${index}`}
              data-index={index}
              role="option"
              aria-selected={time === value}
              className={cx(
                'cds-time-input__option',
                'cds-numeric',
                index === active && 'is-active',
                time === value && 'is-selected'
              )}
              // mousedown, not click: the input's blur would close the list
              // before a click ever landed.
              onMouseDown={event => {
                event.preventDefault()
                choose(time)
              }}
              onMouseEnter={() => setActive(index)}
            >
              {formatTime(time, hour12)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
