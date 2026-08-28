import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cx } from '../../utils/cx'

export type ThemeSetting = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** What was asked for, including `system`. */
  theme: ThemeSetting
  /** What is actually being shown right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeSetting) => void
  /** Flip between light and dark, resolving `system` first. */
  toggleTheme: () => void
  /**
   * Step through the three states a reader actually wants:
   * follow the system → pin the *other* theme → pin the system's own theme →
   * back to following. See `ThemeProvider` for why that order.
   */
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Read the current theme. Throws outside a `ThemeProvider`. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside a <ThemeProvider>')
  return ctx
}

export interface ThemeProviderProps {
  children: ReactNode
  /** Controlled setting. Omit to let the provider own it. */
  theme?: ThemeSetting
  defaultTheme?: ThemeSetting
  onThemeChange?: (theme: ThemeSetting) => void
  /**
   * Where the theme attribute lands. `element` scopes it to this subtree —
   * right for embedding. `document` puts it on `<html>` so portalled things
   * (the command palette, drawers) inherit it too. Defaults to `document`.
   */
  applyTo?: 'element' | 'document'
  /**
   * Where the choice is remembered. Pass `false` to keep it in memory only.
   *
   * Read in an effect rather than during render, because `localStorage` does
   * not exist on a server and reading it during render would make the first
   * client render disagree with the server's.
   */
  storageKey?: string | false
  /** Extra classes on the root element. */
  className?: string
  /** Render children without the wrapping element. Requires `applyTo="document"`. */
  asChild?: boolean
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * The root wrapper. **Every page built with this system must be inside one** —
 * it supplies the `cds-root` class that carries the base type, colour and box
 * model, and it owns the theme attribute the tokens key off. Without it the
 * components render unstyled.
 */
export function ThemeProvider({
  children,
  theme: controlledTheme,
  defaultTheme = 'system',
  onThemeChange,
  applyTo = 'document',
  storageKey = 'cds-theme',
  className,
  asChild = false,
}: ThemeProviderProps) {
  const [internal, setInternal] = useState<ThemeSetting>(defaultTheme)
  const theme = controlledTheme ?? internal
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(systemTheme)

  // Track the OS preference so `system` stays live rather than read-once.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) =>
      setSystemResolved(event.matches ? 'dark' : 'light')
    query.addEventListener('change', listener)
    setSystemResolved(query.matches ? 'dark' : 'light')
    return () => query.removeEventListener('change', listener)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemResolved : theme

  // Restore the stored choice once, on mount. A stored `system` is the same as
  // no attribute, so the common case has no flash; a stored `light` or `dark`
  // paints the default for one frame. An app that minds should write the
  // attribute from a blocking inline script in its own <head>.
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current || storageKey === false || controlledTheme !== undefined) return
    restored.current = true
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored === 'light' || stored === 'dark' || stored === 'system') setInternal(stored)
    } catch {
      // Private mode, or storage disabled. Carrying on with the default is the
      // correct outcome, not an error worth surfacing.
    }
  }, [storageKey, controlledTheme])

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      if (controlledTheme === undefined) setInternal(next)
      if (storageKey !== false) {
        try {
          window.localStorage.setItem(storageKey, next)
        } catch {
          // See above — an unavailable store is not a failure of the app.
        }
      }
      onThemeChange?.(next)
    },
    [controlledTheme, onThemeChange, storageKey]
  )

  useEffect(() => {
    if (applyTo !== 'document' || typeof document === 'undefined') return undefined
    const root = document.documentElement
    const previous = root.getAttribute('data-cds-theme')
    // `system` means "no attribute", which is what lets the media query decide.
    if (theme === 'system') root.removeAttribute('data-cds-theme')
    else root.setAttribute('data-cds-theme', theme)
    return () => {
      if (previous === null) root.removeAttribute('data-cds-theme')
      else root.setAttribute('data-cds-theme', previous)
    }
  }, [theme, applyTo])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
      cycleTheme: () => {
        // Following → pin the opposite of what is on screen (the reason anyone
        // reaches for the control) → pin what the system says (so the choice
        // survives the system changing its mind) → back to following.
        if (theme === 'system') setTheme(systemResolved === 'dark' ? 'light' : 'dark')
        else if (theme !== systemResolved) setTheme(systemResolved)
        else setTheme('system')
      },
    }),
    [theme, resolvedTheme, systemResolved, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      {asChild ? (
        children
      ) : (
        <div
          className={cx('cds-root', className)}
          data-cds-theme={applyTo === 'element' ? (theme === 'system' ? resolvedTheme : theme) : undefined}
        >
          {children}
        </div>
      )}
    </ThemeContext.Provider>
  )
}
