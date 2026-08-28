import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Spinner } from '../Spinner/Spinner'
import './Button.css'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> {
  /**
   * `primary` is a solid ink fill — the one obvious action on a view.
   * `accent` is the accent fill, reserved for the search/submit action itself.
   * `secondary` is ruled, `ghost` is bare, `danger` is ruled in red.
   */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the width of the container. */
  fullWidth?: boolean
  /** Swap the leading icon for a spinner and block interaction. */
  loading?: boolean
  /** Icon shown before the label. */
  iconStart?: ReactNode
  /** Icon shown after the label — chevrons, external-link marks. */
  iconEnd?: ReactNode
}

/**
 * The system's one button.
 *
 * Five variants rather than a `tone` and a `fill` that multiply into twenty:
 * a design system's job here is to make the loud choice rare, and a matrix
 * makes it easy. `primary` is the obvious action on a view, `accent` is
 * reserved for search itself, and `danger` is ruled rather than filled —
 * red is the one colour this system will not use as a ground.
 *
 * `loading` swaps the leading icon for a spinner and disables the button, so
 * the width does not jump and a second click cannot land.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    fullWidth = false,
    loading = false,
    iconStart,
    iconEnd,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref
) {
  const spinnerSize = size === 'lg' ? 'md' : 'sm'
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'cds-btn',
        `cds-btn--${variant}`,
        `cds-btn--${size}`,
        fullWidth && 'cds-btn--full',
        loading && 'is-loading',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={spinnerSize} label={null} className="cds-btn__spinner" />
      ) : (
        iconStart && <span className="cds-btn__icon">{iconStart}</span>
      )}
      {children != null && children !== false && <span className="cds-btn__label">{children}</span>}
      {iconEnd && !loading && <span className="cds-btn__icon">{iconEnd}</span>}
    </button>
  )
})
