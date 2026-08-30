import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../utils/cx'
import './Menu.css'

export interface MenuItem {
  id: string
  label: ReactNode
  icon?: ReactNode
  /** Section heading above this item. Items keep the order given. */
  group?: string
  /** Shortcut shown on the right, e.g. `"Cmd+D"`. Display only. */
  shortcut?: string
  /** Renders in the danger colour — for the one destructive row. */
  tone?: 'default' | 'danger'
  disabled?: boolean
  onSelect?: () => void
}

export interface MenuProps {
  /** The control that opens the menu. Gets the aria wiring automatically. */
  trigger: (props: {
    onClick: () => void
    'aria-haspopup': 'menu'
    'aria-expanded': boolean
    'aria-controls': string
    ref: React.Ref<HTMLButtonElement>
  }) => ReactNode
  items: MenuItem[]
  /** Which edge of the trigger the menu lines up with. */
  align?: 'start' | 'end'
  /** Accessible name for the menu itself. */
  label?: string
  className?: string
}

/**
 * A dropdown of actions, anchored to whatever opens it.
 *
 * Positioned by CSS against a relatively-placed wrapper rather than measured
 * and placed by script — the same decision `ChartTooltip` makes, and for the
 * same reason: it keeps the component renderable on a server and removes an
 * entire class of "menu appears in the wrong place for one frame" bugs. The
 * cost is that it cannot flip itself away from a viewport edge; `align` is the
 * manual control for that.
 */
export function Menu({ trigger, items, align = 'start', label = 'Actions', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const menuId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const enabled = items.filter(item => !item.disabled)

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    []
  )

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  const select = (item: MenuItem) => {
    if (item.disabled) return
    item.onSelect?.()
    close()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      // Wrap, and skip disabled rows — a menu is short enough that landing on
      // something you cannot press is just a dead keystroke.
      let next = active
      // eslint-disable-next-line @typescript-eslint/prefer-for-of -- a bounded number of attempts, not an iteration
      for (let i = 0; i < items.length; i++) {
        next = (next + step + items.length) % items.length
        if (!items[next]?.disabled) break
      }
      setActive(next)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(items.findIndex(item => !item.disabled))
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(items.length - 1 - [...items].reverse().findIndex(item => !item.disabled))
    }
  }


  return (
    <div className={cx('cds-menu-wrap', className)} ref={wrapperRef}>
      {trigger({
        onClick: () => {
          setActive(items.findIndex(item => !item.disabled))
          setOpen(value => !value)
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': menuId,
        ref: triggerRef,
      })}

      {open && enabled.length > 0 && (
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- roving focus lives on the menuitems
        <div
          id={menuId}
          className={cx('cds-menu', `cds-menu--${align}`)}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
        >
          {items.map((item, index) => {
            const heading =
              item.group && item.group !== items[index - 1]?.group ? item.group : null
            return (
              <div key={item.id}>
                {heading && <p className="cds-menu__group cds-kicker">{heading}</p>}
                <button
                  type="button"
                  role="menuitem"
                  ref={node => {
                    itemRefs.current[index] = node
                  }}
                  className={cx('cds-menu__item', item.tone === 'danger' && 'is-danger')}
                  disabled={item.disabled}
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => select(item)}
                  onMouseEnter={() => !item.disabled && setActive(index)}
                >
                  {item.icon && <span className="cds-menu__icon">{item.icon}</span>}
                  <span className="cds-menu__label">{item.label}</span>
                  {item.shortcut && <span className="cds-menu__shortcut cds-mono">{item.shortcut}</span>}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
