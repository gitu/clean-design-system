import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../Button/Button'
import { Calendar, type CalendarRange } from '../Calendar/Calendar'
import { fromIso } from '../Calendar/calendar-utils'
import type { IsoDate } from '../Calendar/calendar-utils'
import { Icon } from '../Icon/Icon'
import './DateRangePicker.css'

export interface DateRangePreset {
  id: string
  label: string
  /** Returns the span this preset means, in `YYYY-MM-DD`. */
  range: () => CalendarRange
}

export interface DateRangePickerProps {
  value: CalendarRange
  onChange: (range: CalendarRange) => void
  /** Shortcuts down the side — "Last 30 days" and friends. */
  presets?: DateRangePreset[]
  min?: IsoDate
  max?: IsoDate
  months?: 1 | 2
  weekStartsOn?: 0 | 1
  locale?: string
  /** Field label, announced with the trigger. */
  label?: string
  placeholder?: string
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

/**
 * A button that opens a two-month calendar and reports a span.
 *
 * `RangeFilter` deliberately uses two text fields rather than a slider, and the
 * same reasoning applies here in reverse: for *dates* a grid beats two text
 * fields, because "the last week of March" is a shape you point at rather than
 * a number you know. Typing stays available — the trigger's value is a plain
 * button, and a caller who wants keyed entry should use two `Input`s instead.
 */
export function DateRangePicker({
  value,
  onChange,
  presets,
  min,
  max,
  months = 2,
  weekStartsOn = 1,
  locale = 'en-GB',
  label = 'Date range',
  placeholder = 'Any date',
  size = 'md',
  disabled = false,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const format = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
    [locale]
  )

  const summary = value.start
    ? value.end
      ? `${format.format(fromIso(value.start))} – ${format.format(fromIso(value.end))}`
      : `${format.format(fromIso(value.start))} – …`
    : placeholder

  return (
    <div className={cx('cds-daterange', className)} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cx('cds-daterange__trigger', `cds-daterange__trigger--${size}`)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${summary}`}
        disabled={disabled}
        onClick={() => setOpen(current => !current)}
      >
        <Icon name="calendar" size={14} />
        <span className={cx('cds-daterange__value', !value.start && 'is-placeholder')}>{summary}</span>
      </button>

      {open && (
        <div className="cds-daterange__panel" role="dialog" aria-label={label}>
          {presets && presets.length > 0 && (
            <div className="cds-daterange__presets">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className="cds-daterange__preset"
                  onClick={() => {
                    onChange(preset.range())
                    setOpen(false)
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div className="cds-daterange__calendar">
            <Calendar
              mode="range"
              range={value}
              onRangeChange={next => {
                onChange(next)
                // Close once the span is complete, not on the first click.
                if (next.start && next.end) setOpen(false)
              }}
              months={months}
              min={min}
              max={max}
              weekStartsOn={weekStartsOn}
              locale={locale}
              label={label}
            />
            <div className="cds-daterange__actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange({ start: null, end: null })
                  setOpen(false)
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
