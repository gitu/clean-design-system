import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import './Switch.css'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md'
  /** Put the track before the label instead of after it. */
  labelPosition?: 'start' | 'end'
}

/**
 * For settings that take effect immediately — "include archived", "live
 * updates". When the change only lands on submit, use a `Checkbox`.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    description,
    size = 'md',
    labelPosition = 'end',
    className,
    disabled,
    id,
    'aria-describedby': describedByProp,
    ...rest
  },
  ref
) {
  const field = useFieldControl({ id, 'aria-describedby': describedByProp, disabled })

  return (
    <label
      className={cx(
        'cds-switch',
        `cds-switch--${size}`,
        `cds-switch--label-${labelPosition}`,
        field.disabled && 'is-disabled',
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={field.id}
        className="cds-switch__input"
        disabled={field.disabled}
        aria-describedby={field.describedBy}
        {...rest}
      />
      <span className="cds-switch__track" aria-hidden="true">
        <span className="cds-switch__thumb" />
      </span>
      {(label || description) && (
        <span className="cds-switch__text">
          {label && <span className="cds-switch__label">{label}</span>}
          {description && <span className="cds-switch__description">{description}</span>}
        </span>
      )}
    </label>
  )
})
