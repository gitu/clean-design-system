import { useId, useRef, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useControllableState } from '../../utils/useControllableState'
import './Tabs.css'

export interface TabItem {
  value: string
  label: ReactNode
  /** Result count shown after the label — the usual pattern for search scopes. */
  count?: number
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** `underline` is the editorial default; `enclosed` reads as a filed folder. */
  variant?: 'underline' | 'enclosed'
  size?: 'sm' | 'md'
  /** Stretch the rule the full width of the container. */
  fullWidth?: boolean
  label?: string
  /** Panel content. Render the active tab's content yourself. */
  children?: ReactNode
  className?: string
}

const nf = new Intl.NumberFormat('en-US')

/**
 * Result scopes, document sections, saved views. Arrow keys move between tabs
 * and activate as they go, which is the expected behaviour for a tablist whose
 * panels are cheap to render.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  label,
  children,
  className,
}: TabsProps) {
  const first = items[0]
  const [active, setActive] = useControllableState<string | undefined>(
    value,
    defaultValue ?? first?.value,
    next => next !== undefined && onChange?.(next)
  )
  const uid = useId()
  const listRef = useRef<HTMLDivElement>(null)

  function move(delta: number) {
    const enabled = items.filter(i => !i.disabled)
    const index = enabled.findIndex(i => i.value === active)
    const next = enabled[(index + delta + enabled.length) % enabled.length]
    if (!next) return
    setActive(next.value)
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(next.value)}"]`)
      ?.focus()
  }

  return (
    <div className={cx('cds-tabs', `cds-tabs--${variant}`, `cds-tabs--${size}`, className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        className={cx('cds-tabs__list', fullWidth && 'cds-tabs__list--full')}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            move(1)
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            move(-1)
          }
        }}
      >
        {items.map(item => {
          const isActive = item.value === active
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              data-value={item.value}
              id={`${uid}-tab-${item.value}`}
              aria-selected={isActive}
              // Only the active panel is rendered, and only when there are
              // children to put in it — so pointing every tab at a panel id
              // leaves most of them dangling.
              aria-controls={isActive && children ? `${uid}-panel-${active}` : undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              className={cx('cds-tabs__tab', isActive && 'is-active')}
              onClick={() => setActive(item.value)}
            >
              {item.icon && <span className="cds-tabs__icon">{item.icon}</span>}
              <span className="cds-tabs__label">{item.label}</span>
              {item.count !== undefined && (
                <span className="cds-tabs__count cds-numeric">{nf.format(item.count)}</span>
              )}
            </button>
          )
        })}
      </div>

      {children && (
        <div
          role="tabpanel"
          id={`${uid}-panel-${active}`}
          aria-labelledby={`${uid}-tab-${active}`}
          className="cds-tabs__panel"
          tabIndex={0}
        >
          {children}
        </div>
      )}
    </div>
  )
}
