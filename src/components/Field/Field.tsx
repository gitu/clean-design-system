import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { FieldContext, type FieldContextValue } from './FieldContext'
import './Field.css'

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label. Omit it only when `aria-label` is set on the control. */
  label?: ReactNode
  /** Supporting text under the label — syntax notes, units, examples. */
  hint?: ReactNode
  /** Error text. Its presence puts the control into the invalid state. */
  error?: ReactNode
  /** Marks the label and sets `required` on the control. */
  required?: boolean
  /** Greys out the label and disables the control. */
  disabled?: boolean
  /** Place the label beside the control instead of above it. */
  orientation?: 'vertical' | 'horizontal'
  /** Right-aligned slot on the label row — "Reset", a counter, a help link. */
  action?: ReactNode
  children: ReactNode
}

/**
 * Label, hint, error and the ARIA wiring between them. Wrap any control in
 * this and the control picks up its id and `aria-describedby` automatically.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  action,
  className,
  children,
  ...rest
}: FieldProps) {
  const uid = useId()
  const id = `${uid}-control`
  const hintId = hint ? `${uid}-hint` : undefined
  const errorId = error ? `${uid}-error` : undefined

  const ctx: FieldContextValue = {
    id,
    describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined,
    invalid: Boolean(error),
    required,
    disabled,
  }

  return (
    <FieldContext.Provider value={ctx}>
      <div
        className={cx(
          'cds-field',
          `cds-field--${orientation}`,
          disabled && 'is-disabled',
          error && 'is-invalid',
          className
        )}
        {...rest}
      >
        {(label || action) && (
          <div className="cds-field__header">
            {label && (
              <label className="cds-field__label cds-label" htmlFor={id}>
                {label}
                {required && (
                  <span className="cds-field__required" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
            )}
            {action && <div className="cds-field__action">{action}</div>}
          </div>
        )}
        <div className="cds-field__body">
          {hint && !error && (
            <p className="cds-field__hint" id={hintId}>
              {hint}
            </p>
          )}
          <div className="cds-field__control">{children}</div>
          {error && (
            <p className="cds-field__error" id={errorId}>
              {error}
            </p>
          )}
        </div>
      </div>
    </FieldContext.Provider>
  )
}
