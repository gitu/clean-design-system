import { useMemo, useState, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { useControllableState } from '../../utils/useControllableState'
import './FacetGroup.css'

export interface FacetGroupProps {
  /** Section name, set as a kicker. */
  title: ReactNode
  /** Usually `FacetItem`s. */
  children: ReactNode
  /** How many selections are active — shown as a count beside the title. */
  selectedCount?: number
  /** Handler for the "Clear" action, shown only when `selectedCount` > 0. */
  onClear?: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Collapse the list past this many items behind a "Show all" toggle. Facets
   * with hundreds of values are the norm; this keeps the sidebar scannable.
   */
  maxVisible?: number
  /** Adds a filter-within-facet box. Matching is done by the caller. */
  searchable?: boolean
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  /** Hide the disclosure control entirely. */
  static?: boolean
  className?: string
}

/**
 * One collapsible dimension in the filter sidebar — Section, Author, Year.
 */
export function FacetGroup({
  title,
  children,
  selectedCount = 0,
  onClear,
  open,
  defaultOpen = true,
  onOpenChange,
  maxVisible,
  searchable = false,
  searchPlaceholder = 'Filter',
  onSearchChange,
  static: isStatic = false,
  className,
}: FacetGroupProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const [expanded, setExpanded] = useState(false)

  const items = useMemo(
    () => (Array.isArray(children) ? (children as ReactNode[]).flat() : [children]),
    [children]
  )
  const total = items.length
  const overflowing = maxVisible !== undefined && total > maxVisible && !expanded
  const visible = overflowing ? items.slice(0, maxVisible) : items

  return (
    <section className={cx('cds-facet-group', !isOpen && 'is-collapsed', className)}>
      <div className="cds-facet-group__header">
        {isStatic ? (
          <span className="cds-facet-group__title cds-kicker">{title}</span>
        ) : (
          <button
            type="button"
            className="cds-facet-group__toggle"
            aria-expanded={isOpen}
            onClick={() => setOpen(!isOpen)}
          >
            <Icon
              name="chevron-down"
              size={12}
              className="cds-facet-group__chevron"
            />
            <span className="cds-facet-group__title cds-kicker">{title}</span>
          </button>
        )}

        {selectedCount > 0 && (
          <span className="cds-facet-group__selected cds-numeric">{selectedCount}</span>
        )}
        {selectedCount > 0 && onClear && (
          <button type="button" className="cds-facet-group__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="cds-facet-group__body">
          {searchable && (
            <Input
              size="sm"
              type="search"
              placeholder={searchPlaceholder}
              iconStart={<Icon name="search" size={13} />}
              onChange={event => onSearchChange?.(event.target.value)}
              className="cds-facet-group__search"
              aria-label={typeof title === 'string' ? `Filter ${title}` : 'Filter values'}
            />
          )}

          <div className="cds-facet-group__items">{visible}</div>

          {maxVisible !== undefined && total > maxVisible && (
            <button
              type="button"
              className="cds-facet-group__more"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show less' : `Show all ${total}`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
