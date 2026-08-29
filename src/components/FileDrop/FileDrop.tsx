import type { InputHTMLAttributes, ReactNode } from 'react'
import { useId, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import { Icon } from '../Icon/Icon'
import './FileDrop.css'

export interface FileDropProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  /**
   * The instruction, and it should name both routes — dropping and choosing.
   * Half of the people who use this will never drag anything.
   */
  label?: ReactNode
  /** What is accepted, in words. The `accept` attribute is not readable. */
  hint?: ReactNode
  /** Called with whatever arrived, by either route. */
  onFiles?: (files: FileList) => void
  invalid?: boolean
  /** `sm` for a drop target beside a list that already has files in it. */
  size?: 'sm' | 'md'
}

/**
 * A drop target for files.
 *
 * A real `<input type="file">` sits inside it, visually hidden but in the tab
 * order, and the whole box is that input's `<label>`. So the keyboard path,
 * the file picker, form association and the native accessible name all work
 * without a line of script — and the drag handling is an enhancement on top
 * rather than the mechanism. A `<div>` with an `onDrop` and a click handler is
 * the usual shape for this and it is unusable without a mouse.
 *
 * Only the drag *styling* is stateful. Dropping is handled by the native input
 * where the browser allows it and by `onFiles` otherwise, so a caller that
 * ignores `onFiles` and reads the form still gets the files.
 */
export function FileDrop({
  label = 'Drop files here, or choose from your computer',
  hint,
  onFiles,
  invalid,
  size = 'md',
  disabled,
  required,
  id,
  className,
  multiple = true,
  ...rest
}: FileDropProps) {
  const field = useFieldControl({ id, invalid, required, disabled })
  const generatedId = useId()
  const inputId = field.id ?? generatedId
  const hintId = hint ? `${generatedId}-hint` : undefined
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const describedBy = [field.describedBy, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div
      className={cx(
        'cds-filedrop',
        `cds-filedrop--${size}`,
        dragging && 'is-dragging',
        field.invalid && 'is-invalid',
        field.disabled && 'is-disabled',
        className
      )}
      onDragOver={event => {
        if (field.disabled) return
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={event => {
        // Only when the pointer has left the box itself, not merely crossed
        // onto the text inside it — otherwise the highlight flickers.
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        setDragging(false)
      }}
      onDrop={event => {
        if (field.disabled) return
        event.preventDefault()
        setDragging(false)
        const dropped = event.dataTransfer?.files
        if (!dropped?.length) return
        // Put them on the input too, so a plain form submit carries them.
        if (inputRef.current) inputRef.current.files = dropped
        onFiles?.(dropped)
      }}
    >
      <label className="cds-filedrop__label" htmlFor={inputId}>
        <Icon name="document" size={size === 'sm' ? 16 : 20} className="cds-filedrop__icon" />
        <span className="cds-filedrop__text cds-ui">{label}</span>
        {hint && (
          <span id={hintId} className="cds-filedrop__hint cds-body-sm">
            {hint}
          </span>
        )}
      </label>

      <input
        {...rest}
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={multiple}
        disabled={field.disabled}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={describedBy}
        className="cds-filedrop__input"
        onChange={event => {
          if (event.target.files?.length) onFiles?.(event.target.files)
        }}
      />
    </div>
  )
}
