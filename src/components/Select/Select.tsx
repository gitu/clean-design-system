import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { useFieldControl } from '../Field/FieldContext'
import './Select.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  /** Groups options under an `<optgroup>` of this name. */
  group?: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  /** Options to render. Ignored when `children` is supplied. */
  options?: SelectOption[]
  /** Shown as a disabled first option when the value is empty. */
  placeholder?: string
  invalid?: boolean
  /** Leading icon inside the control. */
  iconStart?: ReactNode
  /** Drop the border and ground, for use inside a toolbar. */
  bare?: boolean
}

/**
 * A native `<select>` with the system's chrome. Native is deliberate: it gets
 * keyboard behaviour, mobile pickers and long-list performance for free, which
 * matters when a facet has four hundred values.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    options,
    placeholder,
    invalid,
    iconStart,
    bare = false,
    className,
    children,
    disabled,
    required,
    id,
    value,
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

  const groups: { name: string | undefined; items: SelectOption[] }[] = []
  for (const option of options ?? []) {
    const last = groups[groups.length - 1]
    if (last && last.name === option.group) last.items.push(option)
    else groups.push({ name: option.group, items: [option] })
  }

  return (
    <div
      className={cx(
        'cds-select',
        `cds-select--${size}`,
        bare && 'cds-select--bare',
        field.invalid && 'is-invalid',
        field.disabled && 'is-disabled',
        className
      )}
    >
      {iconStart && <span className="cds-select__icon">{iconStart}</span>}
      <select
        ref={ref}
        id={field.id}
        className="cds-select__control"
        disabled={field.disabled}
        required={field.required}
        value={value}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field.describedBy}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ??
          groups.map((group, i) =>
            group.name ? (
              <optgroup key={group.name} label={group.name}>
                {group.items.map(o => (
                  <option key={o.value} value={o.value} disabled={o.disabled}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              group.items.map(o => (
                <option key={`${i}-${o.value}`} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))
            )
          )}
      </select>
      <Icon name="chevron-down" size={14} className="cds-select__chevron" />
    </div>
  )
})
