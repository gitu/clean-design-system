import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import './Textarea.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  /** Monospace face — the right default for raw query bodies. */
  mono?: boolean
  /** Which directions the user may drag. Defaults to vertical only. */
  resize?: 'none' | 'vertical' | 'both'
}

/**
 * A multi-line text field.
 *
 * Resizes vertically by default and never horizontally: a textarea dragged
 * wider than its column breaks the measure of everything beside it. `mono` is
 * the right default for a raw query body, where alignment carries meaning.
 *
 * For prose that will be rendered later, use `MarkdownEditor` — it is this
 * control plus a toolbar and a preview of the face the text will publish in.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    invalid,
    mono = false,
    resize = 'vertical',
    className,
    rows = 4,
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
    <textarea
      ref={ref}
      id={field.id}
      rows={rows}
      className={cx(
        'cds-textarea',
        `cds-textarea--resize-${resize}`,
        mono && 'cds-textarea--mono',
        field.invalid && 'is-invalid',
        className
      )}
      disabled={field.disabled}
      required={field.required}
      aria-invalid={field.invalid || undefined}
      aria-describedby={field.describedBy}
      {...rest}
    />
  )
})
