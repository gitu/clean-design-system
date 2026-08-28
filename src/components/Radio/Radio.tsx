import { createContext, forwardRef, useContext, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useControllableState } from '../../utils/useControllableState'
import './Radio.css'

interface RadioGroupContextValue {
  name: string
  value: string | undefined
  onChange: ((value: string) => void) | undefined
  disabled: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md'
  value: string
}

/**
 * One option in a mutually exclusive set.
 *
 * A real `<input type="radio">` under a drawn circle, for the same reason as
 * `Checkbox`: the native control carries the roving focus, the arrow-key
 * behaviour and the form value, and none of that is worth rebuilding to change
 * how a dot looks. Radios sharing a `name` are a group to the browser whether
 * or not they are one in the markup.
 *
 * Use `RadioGroup` to share the name and the selected value across a set; use
 * this alone only when the surrounding form already provides both.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    description,
    size = 'md',
    className,
    disabled,
    value,
    name,
    onChange,
    checked,
    defaultChecked,
    ...rest
  },
  ref
) {
  const group = useContext(RadioGroupContext)
  const isDisabled = disabled ?? group?.disabled ?? false
  // Inside a group the group owns the value. Honouring `defaultChecked` as well
  // would make the input controlled and uncontrolled at once, which React warns
  // about and which silently breaks selection.
  const isChecked = checked ?? (group ? group.value === value : undefined)

  return (
    <label
      className={cx('cds-radio', `cds-radio--${size}`, isDisabled && 'is-disabled', className)}
    >
      <input
        ref={ref}
        type="radio"
        className="cds-radio__input"
        value={value}
        name={name ?? group?.name}
        checked={isChecked}
        defaultChecked={isChecked === undefined ? defaultChecked : undefined}
        disabled={isDisabled}
        onChange={event => {
          onChange?.(event)
          if (event.target.checked) group?.onChange?.(value)
        }}
        {...rest}
      />
      <span className="cds-radio__dot" aria-hidden="true" />
      {(label || description) && (
        <span className="cds-radio__text">
          {label && <span className="cds-radio__label">{label}</span>}
          {description && <span className="cds-radio__description">{description}</span>}
        </span>
      )}
    </label>
  )
})

export interface RadioGroupProps {
  /** Shared `name` for the inputs. Generated when omitted. */
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Accessible name for the group. Omit when a `<Field label>` supplies one. */
  label?: ReactNode
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
  className?: string
  children: ReactNode
}

/**
 * Wrap `Radio`s to share a name and a selected value. Renders a `radiogroup`
 * so assistive tech announces the set, not a run of loose controls.
 */
export function RadioGroup({
  name,
  value,
  defaultValue,
  onChange,
  label,
  orientation = 'vertical',
  disabled = false,
  className,
  children,
}: RadioGroupProps) {
  const uid = useId()
  const [selected, setSelected] = useControllableState<string | undefined>(
    value,
    defaultValue,
    next => next !== undefined && onChange?.(next)
  )
  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? uid, value: selected, onChange: setSelected, disabled }}
    >
      <div
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : undefined}
        className={cx('cds-radio-group', `cds-radio-group--${orientation}`, className)}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}
