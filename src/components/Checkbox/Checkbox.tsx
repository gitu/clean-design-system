import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { useFieldControl } from '../Field/FieldContext'
import './Checkbox.css'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Text beside the box. Omit it only when `aria-label` is set. */
  label?: ReactNode
  /** Secondary line under the label. */
  description?: ReactNode
  /**
   * Renders the dash state for a partially-selected group. Purely visual until
   * paired with the matching `checked` value, as the DOM property requires.
   */
  indeterminate?: boolean
  size?: 'sm' | 'md'
  invalid?: boolean
}

/**
 * A real `<input type="checkbox">` under a drawn box.
 *
 * The native control is kept and visually hidden rather than replaced by a
 * `div` with `role="checkbox"`: it brings the label association, the form
 * value, the indeterminate state and every browser's own keyboard handling for
 * free, and none of that is worth reimplementing to change a tick.
 *
 * `indeterminate` is a DOM property with no HTML attribute, so it is applied
 * through a ref — which is why this component holds one even when the caller
 * does not.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    indeterminate = false,
    size = 'md',
    invalid,
    className,
    disabled,
    required,
    id,
    'aria-describedby': describedByProp,
    ...rest
  },
  forwardedRef
) {
  const innerRef = useRef<HTMLInputElement | null>(null)
  const field = useFieldControl({
    id,
    'aria-describedby': describedByProp,
    invalid,
    required,
    disabled,
  })

  // `indeterminate` exists only as a DOM property — there is no attribute for
  // it, so React cannot set it declaratively.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label
      className={cx(
        'cds-checkbox',
        `cds-checkbox--${size}`,
        field.disabled && 'is-disabled',
        field.invalid && 'is-invalid',
        className
      )}
    >
      <input
        ref={node => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        type="checkbox"
        id={field.id}
        className="cds-checkbox__input"
        disabled={field.disabled}
        required={field.required}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...rest}
      />
      <span className="cds-checkbox__box" aria-hidden="true">
        <Icon name={indeterminate ? 'dash' : 'check'} size={size === 'sm' ? 10 : 12} />
      </span>
      {(label || description) && (
        <span className="cds-checkbox__text">
          {label && <span className="cds-checkbox__label">{label}</span>}
          {description && <span className="cds-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  )
})
