import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Toolbar.css'

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Left group — usually the primary controls. */
  children?: ReactNode
  /** Right group, pushed to the far edge. */
  end?: ReactNode
  /** Where the hairline sits. */
  border?: 'none' | 'top' | 'bottom' | 'both'
  size?: 'sm' | 'md'
  /** Stick to the top of the scroll container. */
  sticky?: boolean
  label?: string
}

/** A row of controls above or below a content region. */
export function Toolbar({
  children,
  end,
  border = 'bottom',
  size = 'md',
  sticky = false,
  label,
  className,
  ...rest
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      className={cx(
        'cds-toolbar',
        `cds-toolbar--${size}`,
        `cds-toolbar--border-${border}`,
        sticky && 'cds-toolbar--sticky',
        className
      )}
      {...rest}
    >
      <div className="cds-toolbar__group">{children}</div>
      {end && <div className="cds-toolbar__group cds-toolbar__group--end">{end}</div>}
    </div>
  )
}
