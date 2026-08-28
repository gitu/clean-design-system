import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './NavList.css'

export interface NavItem {
  /** Identifies the destination. Reported by `onChange` and matched by `value`. */
  id: string
  label: ReactNode
  /** Section heading this item sits under. Items keep the order given. */
  group?: string
  icon?: ReactNode
  /** Right-aligned figure — unread, pending, however many. */
  count?: number
  /**
   * Renders an `<a>` instead of a `<button>`. Pass this when the destination is
   * a real URL: it is what makes middle-click and "open in new tab" work.
   */
  href?: string
  disabled?: boolean
}

export interface NavListProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: NavItem[]
  /** The current destination. */
  value?: string
  onChange?: (id: string) => void
  /**
   * `vertical` is a sidebar, `horizontal` a header bar. Horizontal drops the
   * group headings — a bar is not the place for section titles.
   */
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md'
  /** Accessible name. Required when a page has more than one nav. */
  label?: string
}

const nf = new Intl.NumberFormat('en-US')

/**
 * The navigation for an application with more than one page.
 *
 * A real `<nav>` wrapping a real list, so a screen reader can enumerate the
 * destinations and skip past them. The current item carries
 * `aria-current="page"` rather than only a colour — the same reason
 * `Pagination` does.
 *
 * Items render as links when given an `href` and as buttons otherwise. Prefer
 * the link: it is the difference between navigation a browser understands and
 * navigation only your JavaScript does.
 */
export function NavList({
  items,
  value,
  onChange,
  orientation = 'vertical',
  size = 'md',
  label = 'Sections',
  className,
  ...rest
}: NavListProps) {
  // Group headings only make sense stacked; a horizontal bar shows a flat list.
  const grouped = orientation === 'vertical'
  const sections: Array<{ name?: string; items: NavItem[] }> = []
  for (const item of items) {
    const name = grouped ? item.group : undefined
    const last = sections[sections.length - 1]
    if (last && last.name === name) last.items.push(item)
    else sections.push({ name, items: [item] })
  }

  return (
    <nav
      className={cx('cds-nav', `cds-nav--${orientation}`, `cds-nav--${size}`, className)}
      aria-label={label}
      {...rest}
    >
      {sections.map((section, index) => (
        <div className="cds-nav__section" key={section.name ?? `s-${index}`}>
          {section.name && <p className="cds-nav__group cds-kicker">{section.name}</p>}
          <ul className="cds-nav__list">
            {section.items.map(item => {
              const isCurrent = item.id === value
              const inner = (
                <>
                  {item.icon && <span className="cds-nav__icon">{item.icon}</span>}
                  <span className="cds-nav__label">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="cds-nav__count cds-numeric">{nf.format(item.count)}</span>
                  )}
                </>
              )
              const shared = {
                className: cx('cds-nav__item', isCurrent && 'is-current'),
                'aria-current': isCurrent ? ('page' as const) : undefined,
              }

              return (
                <li key={item.id}>
                  {item.href && !item.disabled ? (
                    <a
                      href={item.href}
                      onClick={event => {
                        // Let the browser handle modified clicks — that is the
                        // whole point of rendering a link.
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
                          return
                        if (onChange) {
                          event.preventDefault()
                          onChange(item.id)
                        }
                      }}
                      {...shared}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => onChange?.(item.id)}
                      {...shared}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
