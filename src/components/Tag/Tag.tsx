import type { HTMLAttributes, MouseEvent, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import './Tag.css'

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onSelect'> {
  /** Optional dimension label rendered before the value, e.g. `Section`. */
  facet?: ReactNode
  /** The value itself. */
  children: ReactNode
  /** Show a dismiss control. The handler receives the click event. */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void
  /** Accessible name for the dismiss control. */
  removeLabel?: string
  tone?: 'neutral' | 'accent'
  size?: 'sm' | 'md'
}

/**
 * A value the user put into the interface — an applied filter, a chosen
 * keyword. Removable by default in the sense that it is built to carry a
 * dismiss affordance; pass `onRemove` to show one.
 */
export function Tag({
  facet,
  children,
  onRemove,
  removeLabel,
  tone = 'neutral',
  size = 'md',
  className,
  ...rest
}: TagProps) {
  const label =
    removeLabel ??
    `Remove ${typeof facet === 'string' ? `${facet} ` : ''}${
      typeof children === 'string' ? children : 'filter'
    }`

  return (
    <span
      className={cx('cds-tag', `cds-tag--${tone}`, `cds-tag--${size}`, className)}
      {...rest}
    >
      {facet != null && (
        <>
          <span className="cds-tag__facet">{facet}</span>
          <span className="cds-tag__sep" aria-hidden="true" />
        </>
      )}
      <span className="cds-tag__value">{children}</span>
      {onRemove && (
        <button type="button" className="cds-tag__remove" onClick={onRemove} aria-label={label}>
          <Icon name="close" size={11} />
        </button>
      )}
    </span>
  )
}
