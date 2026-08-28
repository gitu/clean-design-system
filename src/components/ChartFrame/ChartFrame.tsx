import type { HTMLAttributes, ReactNode } from 'react'
import { useId, useState } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import './ChartFrame.css'

export interface ChartFrameProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Drill-down trail. Pass the system's `Breadcrumbs`. */
  breadcrumbs?: ReactNode
  /** Right-aligned slot in the header — a scope switch, a download. */
  actions?: ReactNode
  legend?: ReactNode
  legendPlacement?: 'top' | 'bottom'
  /** Source line, set as a kicker under a hairline. */
  footnote?: ReactNode
  /**
   * A visible data table behind a disclosure. Pass a `DataTable`.
   *
   * A slot rather than an import: every chart already renders a hidden table
   * for screen readers, and building a visible one in would mean anyone
   * importing `LineChart` also ships `DataTable`, `Checkbox` and `Skeleton`.
   */
  table?: ReactNode
  tableLabel?: string
  variant?: 'plain' | 'ruled'
  children?: ReactNode
}

/**
 * The titled region a chart sits in — `Panel`, but with the slots a chart
 * actually needs: a legend, a drill-down trail, a source note and a data table.
 */
export function ChartFrame({
  title,
  description,
  breadcrumbs,
  actions,
  legend,
  legendPlacement = 'top',
  footnote,
  table,
  tableLabel = 'Show data table',
  variant = 'plain',
  className,
  children,
  ...rest
}: ChartFrameProps) {
  const [open, setOpen] = useState(false)
  const tableId = useId()

  return (
    <section className={cx('cds-chart-frame', `cds-chart-frame--${variant}`, className)} {...rest}>
      {(title != null || actions != null || breadcrumbs != null) && (
        <header className="cds-chart-frame__header">
          <div className="cds-chart-frame__heading">
            {breadcrumbs}
            {title != null && <h3 className="cds-chart-frame__title cds-kicker">{title}</h3>}
            {description != null && (
              <p className="cds-chart-frame__description cds-body-sm">{description}</p>
            )}
          </div>
          {actions != null && <div className="cds-chart-frame__actions">{actions}</div>}
        </header>
      )}

      {legend != null && legendPlacement === 'top' && (
        <div className="cds-chart-frame__legend">{legend}</div>
      )}

      <div className="cds-chart-frame__body">{children}</div>

      {legend != null && legendPlacement === 'bottom' && (
        <div className="cds-chart-frame__legend cds-chart-frame__legend--bottom">{legend}</div>
      )}

      {(footnote != null || table != null) && (
        <footer className="cds-chart-frame__footer">
          {footnote != null && <p className="cds-chart-frame__footnote cds-kicker">{footnote}</p>}
          {table != null && (
            <>
              <button
                type="button"
                className="cds-chart-frame__disclosure"
                aria-expanded={open}
                aria-controls={tableId}
                onClick={() => setOpen(value => !value)}
              >
                <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
                {tableLabel}
              </button>
              <div id={tableId} hidden={!open} className="cds-chart-frame__table">
                {table}
              </div>
            </>
          )}
        </footer>
      )}
    </section>
  )
}
