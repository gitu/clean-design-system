import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import './Input.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'sm' | 'md' | 'lg'
  /** Node pinned inside the leading edge — usually an `<Icon />`. */
  iconStart?: ReactNode
  /** Node pinned inside the trailing edge — a unit, a clear button, a count. */
  iconEnd?: ReactNode
  /** Static text fused to the leading edge, e.g. `https://`. */
  prefix?: ReactNode
  /** Static text fused to the trailing edge, e.g. `kg`. */
  suffix?: ReactNode
  /** Force the error styling. A surrounding `<Field error>` sets this for you. */
  invalid?: boolean
  /** Use the monospace face — right for IDs, hashes and query syntax. */
  mono?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    iconStart,
    iconEnd,
    prefix,
    suffix,
    invalid,
    mono = false,
    className,
    disabled,
    required,
    id,
    'aria-describedby': describedByProp,
    ...rest
  },
  ref
) {
  const field = useFieldControl({
    id,
    'aria-describedby': describedByProp,
    invalid,
    required,
    disabled,
  })

  return (
    <div
      className={cx(
        'cds-input',
        `cds-input--${size}`,
        field.invalid && 'is-invalid',
        field.disabled && 'is-disabled',
        className
      )}
    >
      {prefix != null && <span className="cds-input__affix">{prefix}</span>}
      {iconStart && <span className="cds-input__icon cds-input__icon--start">{iconStart}</span>}
      <input
        ref={ref}
        id={field.id}
        className={cx('cds-input__control', mono && 'cds-input__control--mono')}
        disabled={field.disabled}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...rest}
      />
      {iconEnd && <span className="cds-input__icon cds-input__icon--end">{iconEnd}</span>}
      {suffix != null && <span className="cds-input__affix">{suffix}</span>}
    </div>
  )
})
