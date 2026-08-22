import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Skeleton.css'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** `text` draws ruled lines, `block` a filled rectangle, `circle` an avatar. */
  variant?: 'text' | 'block' | 'circle'
  /** Number of lines when `variant="text"`. The last line is short, as prose is. */
  lines?: number
  width?: number | string
  height?: number | string
}

/**
 * Loading placeholder. Sized in the same rhythm as real content so the layout
 * does not jump when results arrive — the usual failing of search UIs.
 */
export function Skeleton({
  variant = 'text',
  lines = 3,
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const base: CSSProperties = { width, height, ...style }

  if (variant === 'text') {
    return (
      <div
        className={cx('cds-skeleton-text', className)}
        style={{ width, ...style }}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className="cds-skeleton cds-skeleton--line"
            style={{ width: i === lines - 1 && lines > 1 ? '62%' : undefined }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cx('cds-skeleton', `cds-skeleton--${variant}`, className)}
      style={base}
      aria-hidden="true"
      {...rest}
    />
  )
}
