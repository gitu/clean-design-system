import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Spinner } from '../Spinner/Spinner'
import type { ButtonVariant } from '../Button/Button'
import './IconButton.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The glyph. Usually an `<Icon />`. */
  icon: ReactNode
  /**
   * Required. There is no visible text, so this is the only name the button
   * has — it becomes both `aria-label` and the native tooltip.
   */
  label: string
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  /** Render at exactly the icon's size, with no padding box. */
  bare?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    loading = false,
    bare = false,
    disabled,
    className,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'cds-icon-btn',
        `cds-icon-btn--${variant}`,
        `cds-icon-btn--${size}`,
        bare && 'cds-icon-btn--bare',
        className
      )}
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} label={null} /> : icon}
    </button>
  )
})
