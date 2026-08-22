import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Kbd } from '../Kbd/Kbd'
import { Spinner } from '../Spinner/Spinner'
import './CommandPalette.css'

export interface CommandItem {
  id: string
  label: string
  /** Second line under the label. */
  description?: string
  /** Section heading this item sits under. Items keep the order given. */
  group?: string
  icon?: ReactNode
  /** Shortcut shown on the right, e.g. `"Cmd+S"`. Display only. */
  shortcut?: string
  /** Extra words matched by the built-in filter but never displayed. */
  keywords?: string[]
  disabled?: boolean
  onSelect?: () => void
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  /** Fires before `item.onSelect`. The palette closes unless this returns `false`. */
  onSelect?: (item: CommandItem) => void | false
  placeholder?: string
  emptyMessage?: ReactNode
  /** Control the query yourself — pair with `filter={false}` for server search. */
  query?: string
  onQueryChange?: (query: string) => void
  /** Turn off the built-in substring filter when the caller supplies matches. */
  filter?: boolean
  loading?: boolean
  /** Left-hand hint row at the bottom. */
  footer?: ReactNode
  /**
   * Bind a global shortcut that opens the palette, e.g. `"mod+k"` where `mod`
   * is Cmd on macOS and Ctrl elsewhere. Omit to wire opening up yourself.
   */
  hotkey?: string
}

function matches(item: CommandItem, query: string) {
  if (!query) return true
  const haystack = [item.label, item.description, item.group, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(term => haystack.includes(term))
}

/**
 * Keyboard-first launcher for actions, saved searches and navigation. In a
 * dense application this is often the fastest path to anything, and it is the
 * one surface where power users spend most of their time.
 */
export function CommandPalette({
  open,
  onOpenChange,
  items,
  onSelect,
  placeholder = 'Search commands…',
  emptyMessage = 'No matches',
  query,
  onQueryChange,
  filter = true,
  loading = false,
  footer,
  hotkey,
}: CommandPaletteProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const currentQuery = query ?? internalQuery
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const setQuery = useCallback(
    (next: string) => {
      if (query === undefined) setInternalQuery(next)
      onQueryChange?.(next)
      setActiveIndex(0)
    },
    [query, onQueryChange]
  )

  const visible = useMemo(
    () => (filter ? items.filter(item => matches(item, currentQuery)) : items),
    [items, currentQuery, filter]
  )

  // Group while preserving the order items were given in.
  const groups = useMemo(() => {
    const out: Array<{ name: string | undefined; items: CommandItem[] }> = []
    for (const item of visible) {
      const last = out[out.length - 1]
      if (last && last.name === item.group) last.items.push(item)
      else out.push({ name: item.group, items: [item] })
    }
    return out
  }, [visible])

  const selectable = visible.filter(item => !item.disabled)

  const close = useCallback(() => {
    onOpenChange(false)
    setQuery('')
  }, [onOpenChange, setQuery])

  const choose = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return
      const result = onSelect?.(item)
      item.onSelect?.()
      if (result !== false) close()
    },
    [onSelect, close]
  )

  // Global hotkey.
  useEffect(() => {
    if (!hotkey) return
    const [modifier, key] = hotkey.toLowerCase().split('+')
    function handler(event: globalThis.KeyboardEvent) {
      const mod =
        modifier === 'mod' ? event.metaKey || event.ctrlKey
        : modifier === 'ctrl' ? event.ctrlKey
        : modifier === 'meta' ? event.metaKey
        : modifier === 'alt' ? event.altKey
        : true
      if (mod && event.key.toLowerCase() === (key ?? modifier)) {
        event.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hotkey, onOpenChange])

  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      // Focus after paint so the dialog is in the tree before we move focus.
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
    return undefined
  }, [open])

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(i => (selectable.length ? (i + 1) % selectable.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(i => (selectable.length ? (i - 1 + selectable.length) % selectable.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = selectable[activeIndex]
      if (item) choose(item)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(0, selectable.length - 1))
    }
  }

  const activeId = selectable[activeIndex]?.id

  return createPortal(
    <div className="cds-cmdk-layer cds-root" onKeyDown={handleKeyDown}>
      <div className="cds-cmdk__backdrop" onClick={close} aria-hidden="true" />
      <div
        className="cds-cmdk"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="cds-cmdk__search">
          <Icon name="search" size={16} className="cds-cmdk__search-icon" />
          <input
            ref={inputRef}
            className="cds-cmdk__input"
            value={currentQuery}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded="true"
            aria-controls="cds-cmdk-list"
            aria-activedescendant={activeId ? `cds-cmdk-item-${activeId}` : undefined}
            onChange={event => setQuery(event.target.value)}
          />
          {loading && <Spinner size="sm" label="Searching" />}
          <Kbd keys="Esc" size="sm" />
        </div>

        <div className="cds-cmdk__list" id="cds-cmdk-list" role="listbox" ref={listRef}>
          {visible.length === 0 && !loading && (
            <p className="cds-cmdk__empty">{emptyMessage}</p>
          )}

          {groups.map((group, gi) => (
            <div className="cds-cmdk__group" key={group.name ?? `g-${gi}`}>
              {group.name && <p className="cds-cmdk__group-name cds-kicker">{group.name}</p>}
              {group.items.map(item => {
                const index = selectable.indexOf(item)
                const isActive = index >= 0 && index === activeIndex
                return (
                  <div
                    key={item.id}
                    id={`cds-cmdk-item-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    aria-disabled={item.disabled || undefined}
                    data-active={isActive}
                    className={cx(
                      'cds-cmdk__item',
                      isActive && 'is-active',
                      item.disabled && 'is-disabled'
                    )}
                    onMouseMove={() => index >= 0 && setActiveIndex(index)}
                    onClick={() => choose(item)}
                  >
                    {item.icon && <span className="cds-cmdk__item-icon">{item.icon}</span>}
                    <span className="cds-cmdk__item-text">
                      <span className="cds-cmdk__item-label">{item.label}</span>
                      {item.description && (
                        <span className="cds-cmdk__item-description">{item.description}</span>
                      )}
                    </span>
                    {item.shortcut && <Kbd keys={item.shortcut} size="sm" />}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="cds-cmdk__footer">
          <span className="cds-cmdk__hints">
            <Kbd keys={['↑', '↓']} size="sm" /> to navigate
            <Kbd keys="↵" size="sm" /> to select
          </span>
          {footer}
        </div>
      </div>
    </div>,
    document.body
  )
}
