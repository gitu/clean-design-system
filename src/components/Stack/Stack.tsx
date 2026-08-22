import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Stack.css'

export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Layout direction. `row` is the horizontal form, often called an inline. */
  direction?: 'row' | 'column'
  /** Gap, in space-scale steps — `4` means `var(--cds-space-4)`. */
  gap?: SpaceToken
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  wrap?: boolean
  /** Hairline rules between children — the system's default separator. */
  dividers?: boolean
  /** Element to render. Use a landmark tag where one fits. */
  as?: ElementType
  children?: ReactNode
}

const ALIGN: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
}

const JUSTIFY: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
}

/**
 * The layout primitive for glue between components. Reach for this instead of
 * ad-hoc margins, so spacing always lands on the system's scale.
 */
export function Stack({
  direction = 'column',
  gap = 4,
  align,
  justify,
  wrap = false,
  dividers = false,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: StackProps) {
  const vars = {
    '--cds-stack-gap': `var(--cds-space-${gap})`,
    alignItems: align ? ALIGN[align] : undefined,
    justifyContent: justify ? JUSTIFY[justify] : undefined,
    ...style,
  } as CSSProperties

  return (
    <Tag
      className={cx(
        'cds-stack',
        `cds-stack--${direction}`,
        wrap && 'cds-stack--wrap',
        dividers && 'cds-stack--dividers',
        className
      )}
      style={vars}
      {...rest}
    >
      {children}
    </Tag>
  )
}
