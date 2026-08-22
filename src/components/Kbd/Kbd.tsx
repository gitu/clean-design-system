import type { HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Kbd.css'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /**
   * Keys to render. A string is split on `+` so `"Cmd+K"` becomes two caps.
   * Pass an array for full control.
   */
  keys: string | string[]
  size?: 'sm' | 'md'
}

/** Keyboard shortcut hint. Dense applications live or die on these. */
export function Kbd({ keys, size = 'md', className, ...rest }: KbdProps) {
  const parts = Array.isArray(keys) ? keys : keys.split('+').map(k => k.trim())
  return (
    <span className={cx('cds-kbd', `cds-kbd--${size}`, className)} {...rest}>
      {parts.map((key, i) => (
        <kbd key={`${key}-${i}`} className="cds-kbd__key">
          {key}
        </kbd>
      ))}
    </span>
  )
}
