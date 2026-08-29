import type { HTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { useControllableState } from '../../utils/useControllableState'
import './Disclosure.css'

export interface DisclosureProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The always-visible row. Keep it to one line — it is a heading, not a lede. */
  summary: ReactNode
  /** Right-aligned slot on the summary row — a count, a date, a status. */
  meta?: ReactNode
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Heading level for the summary. A disclosure in a list of them is a section
   * of the page and should say so; one inside a `Panel` that already has a
   * heading should not. Omit it and the summary is a plain row.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Where the hairline sits. `none` for a disclosure inside a ruled container. */
  border?: 'bottom' | 'none'
  disabled?: boolean
}

/**
 * A summary row that opens.
 *
 * Built as a button and a region rather than `<details>`/`<summary>`. The
 * native pair gets the semantics and the keyboard for free, and it was the
 * first thing tried — but it cannot be controlled from outside without fighting
 * the browser's own toggling, and it cannot animate its height, which this
 * system needs in order to honour `prefers-reduced-motion` the same way
 * everything else does. `FacetGroup` reached the same conclusion independently;
 * this is that mechanism, generalised.
 */
export function Disclosure({
  summary,
  meta,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  headingLevel,
  border = 'bottom',
  disabled = false,
  className,
  ...rest
}: DisclosureProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const regionId = useId()
  const buttonId = `${regionId}-summary`

  const button = (
    <button
      type="button"
      id={buttonId}
      className="cds-disclosure__summary"
      aria-expanded={isOpen}
      aria-controls={regionId}
      disabled={disabled}
      onClick={() => setOpen(!isOpen)}
    >
      <Icon name="chevron-down" size={12} className="cds-disclosure__chevron" />
      <span className="cds-disclosure__label">{summary}</span>
      {meta && <span className="cds-disclosure__meta cds-body-sm">{meta}</span>}
    </button>
  )

  const Heading = headingLevel ? (`h${headingLevel}` as const) : null

  return (
    <div
      className={cx(
        'cds-disclosure',
        `cds-disclosure--border-${border}`,
        isOpen && 'is-open',
        disabled && 'is-disabled',
        className
      )}
      {...rest}
    >
      {/* The heading wraps the button rather than replacing it: a screen reader
          needs both the level, to navigate by, and the button, to operate. */}
      {Heading ? <Heading className="cds-disclosure__heading">{button}</Heading> : button}

      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        className="cds-disclosure__region"
        hidden={!isOpen}
      >
        <div className="cds-disclosure__body">{children}</div>
      </div>
    </div>
  )
}
