import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../src/utils/cx'
// Borrowing the classes means borrowing the stylesheet. `Button` imports this
// itself, and nothing on the index imports `Button`.
import '../../src/components/Button/Button.css'

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  iconStart?: ReactNode
  iconEnd?: ReactNode
  children: ReactNode
}

/**
 * A `Button` that is actually a link.
 *
 * The system has no such component on purpose: `Button` takes
 * `ButtonHTMLAttributes` and renders a `<button>`, because a control that
 * navigates and a control that acts are different things and a polymorphic `as`
 * prop is how a library stops being able to say which. Every `Button` in the
 * pattern stories is a demo that does nothing, so the question never came up
 * there.
 *
 * On the index it does: every one of these is a real navigation to another
 * page, and a `<button>` with an onClick that sets `location.href` would take
 * away middle-click, open-in-new-tab and the status bar. So this borrows the
 * button's class names for an anchor — which works because the button styles
 * are written as plain classes with no element selector in them. It lives here,
 * in the examples, rather than being proposed as a component.
 */
export function LinkButton({
  variant = 'secondary',
  size = 'md',
  iconStart,
  iconEnd,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a
      className={cx('cds-btn', `cds-btn--${variant}`, `cds-btn--${size}`, 'ex-link-btn', className)}
      {...rest}
    >
      {iconStart && <span className="cds-btn__icon">{iconStart}</span>}
      <span className="cds-btn__label">{children}</span>
      {iconEnd && <span className="cds-btn__icon">{iconEnd}</span>}
    </a>
  )
}
