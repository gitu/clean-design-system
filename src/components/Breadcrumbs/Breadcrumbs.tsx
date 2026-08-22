import { Fragment, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Breadcrumbs.css'

export interface Crumb {
  label: ReactNode
  href?: string
  onClick?: () => void
}

export interface BreadcrumbsProps extends HTMLAttributes<HTMLElement> {
  items: Crumb[]
  /** Character between crumbs. */
  separator?: ReactNode
  /**
   * Collapse the middle behind an ellipsis when there are more crumbs than
   * this, always keeping the first and the last two.
   */
  maxItems?: number
  label?: string
}

/** Path back up through a collection, an archive, or a folder tree. */
export function Breadcrumbs({
  items,
  separator = '/',
  maxItems,
  label = 'Breadcrumb',
  className,
  ...rest
}: BreadcrumbsProps) {
  let visible: Array<Crumb | null> = items
  if (maxItems !== undefined && items.length > maxItems) {
    visible = [items[0] ?? null, null, ...items.slice(-2)]
  }

  return (
    <nav className={cx('cds-breadcrumbs', className)} aria-label={label} {...rest}>
      <ol className="cds-breadcrumbs__list">
        {visible.map((crumb, i) => {
          const isLast = i === visible.length - 1
          return (
            <Fragment key={i}>
              <li className="cds-breadcrumbs__item">
                {crumb === null ? (
                  <span className="cds-breadcrumbs__ellipsis">…</span>
                ) : isLast ? (
                  <span className="cds-breadcrumbs__current" aria-current="page">
                    {crumb.label}
                  </span>
                ) : crumb.href || crumb.onClick ? (
                  <a className="cds-breadcrumbs__link" href={crumb.href} onClick={crumb.onClick}>
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </li>
              {!isLast && (
                <li className="cds-breadcrumbs__separator" aria-hidden="true">
                  {separator}
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
