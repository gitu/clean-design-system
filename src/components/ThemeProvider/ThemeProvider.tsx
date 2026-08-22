import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      if (controlledTheme === undefined) setInternal(next)
      onThemeChange?.(next)
    },
    [controlledTheme, onThemeChange]
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
    }),
    [theme, resolvedTheme, setTheme]
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
