import { useRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useControllableState } from '../../utils/useControllableState'
import './SegmentedControl.css'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: ReactNode
  /** Leading glyph. With no `label`, set `title` so the segment has a name. */
  icon?: ReactNode
  /** Tooltip and accessible name — required for icon-only segments. */
  title?: string
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string = string> {
  options: Array<SegmentedOption<T>>
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  size?: 'sm' | 'md'
  /** Stretch segments to fill the container evenly. */
  fullWidth?: boolean
  /** Accessible name for the set. */
  label?: string
  className?: string
}

/**
 * A small set of mutually exclusive choices shown all at once — sort order,
 * result density, time window. Above about five options use a `Select`.
 *
 * Implemented as a toolbar of buttons with roving arrow-key focus, so it
 * behaves the way a keyboard user expects a segmented control to behave.
 */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth = false,
  label,
  className,
}: SegmentedControlProps<T>) {
  const first = options[0]
  const [selected, setSelected] = useControllableState<T | undefined>(
    value,
    defaultValue ?? first?.value,
    next => next !== undefined && onChange?.(next)
  )
  const listRef = useRef<HTMLDivElement>(null)

  function move(delta: number, from: number) {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []
    )
    if (buttons.length === 0) return
    const current = buttons.findIndex(b => Number(b.dataset.index) === from)
    const next = buttons[(current + delta + buttons.length) % buttons.length]
    next?.focus()
    next?.click()
  }

  return (
    <div
      ref={listRef}
      role="radiogroup"
      aria-label={label}
      className={cx(
        'cds-segmented',
        `cds-segmented--${size}`,
        fullWidth && 'cds-segmented--full',
        className
      )}
    >
      {options.map((option, index) => {
        const isSelected = option.value === selected
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-index={index}
            aria-checked={isSelected}
            title={option.title}
            aria-label={option.title}
            disabled={option.disabled}
            tabIndex={isSelected ? 0 : -1}
            className={cx('cds-segmented__item', isSelected && 'is-selected')}
            onClick={() => setSelected(option.value)}
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault()
                move(1, index)
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault()
                move(-1, index)
              }
            }}
          >
            {option.icon && <span className="cds-segmented__icon">{option.icon}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
