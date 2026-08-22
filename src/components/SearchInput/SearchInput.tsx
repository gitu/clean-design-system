import {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Kbd } from '../Kbd/Kbd'
import { Spinner } from '../Spinner/Spinner'
import { useControllableState } from '../../utils/useControllableState'
import './SearchInput.css'

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'onSubmit' | 'value' | 'defaultValue'> {
  value?: string
  defaultValue?: string
  /** Fires on every keystroke. */
  onValueChange?: (value: string) => void
  /** Fires on Enter and on the submit button. */
  onSubmit?: (value: string) => void
  /** Fires when the field is emptied via the clear button or Escape. */
  onClear?: () => void
  /** `lg` for a toolbar, `xl` for a landing page's primary field. */
  size?: 'md' | 'lg' | 'xl'
  /** Shows a spinner in place of the clear button. */
  loading?: boolean
  /** Renders a visible submit button rather than relying on Enter. */
  submitLabel?: string
  /** Shortcut hint pinned inside the trailing edge, e.g. `"/"` or `"Cmd+K"`. */
  shortcut?: string
  /** Scope selector fused to the leading edge — a `<Select bare>` fits well. */
  scope?: ReactNode
  className?: string
}

/**
 * The primary search field. Enter submits, Escape clears, and the clear button
 * appears only once there is something to clear.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    onSubmit,
    onClear,
    size = 'lg',
    loading = false,
    submitLabel,
    shortcut,
    scope,
    placeholder = 'Search',
    className,
    disabled,
    onKeyDown,
    ...rest
  },
  forwardedRef
) {
  const [query, setQuery] = useControllableState(value, defaultValue, onValueChange)
  const innerRef = useRef<HTMLInputElement | null>(null)

  function clear() {
    setQuery('')
    onClear?.()
    innerRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Enter') {
      event.preventDefault()
      onSubmit?.(query)
    } else if (event.key === 'Escape' && query) {
      event.preventDefault()
      clear()
    }
  }

  const showClear = query.length > 0 && !loading && !disabled

  return (
    <div
      className={cx(
        'cds-search',
        `cds-search--${size}`,
        disabled && 'is-disabled',
        className
      )}
    >
      {scope && <div className="cds-search__scope">{scope}</div>}
      <Icon name="search" size={size === 'xl' ? 20 : 16} className="cds-search__glyph" />
      <input
        ref={node => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        type="search"
        role="searchbox"
        className="cds-search__control"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {loading && <Spinner size="sm" label="Searching" className="cds-search__spinner" />}
      {showClear && (
        <button type="button" className="cds-search__clear" onClick={clear} aria-label="Clear search">
          <Icon name="close" size={14} />
        </button>
      )}
      {shortcut && !query && !loading && (
        <Kbd keys={shortcut} size="sm" className="cds-search__shortcut" />
      )}
      {submitLabel && (
        <button
          type="button"
          className="cds-search__submit"
          onClick={() => onSubmit?.(query)}
          disabled={disabled}
        >
          {submitLabel}
        </button>
      )}
    </div>
  )
})
