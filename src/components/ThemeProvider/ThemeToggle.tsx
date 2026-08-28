import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import { useTheme } from './ThemeProvider'

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'secondary' | 'ghost'
  /** Render at exactly the icon's size, with no padding box. */
  bare?: boolean
  className?: string
}

/**
 * One button for the whole theme control, sized to sit in a masthead.
 *
 * It steps through three states rather than two, because two is a lie: a plain
 * light/dark switch has no way back to *following the system*, so the first
 * time a reader touches it they lose that behaviour permanently. Here the
 * order is
 *
 *   following the system → the opposite of what is on screen → what the system
 *   says, pinned → following again
 *
 * The middle state is the one people actually want (it is why they reached for
 * the control), and the third exists so that "I want light, and I want it to
 * stay light" is expressible. The icon says which state it is in: a monitor
 * while following, a sun or moon once pinned.
 *
 * The choice is remembered in `localStorage` by the provider. Inside a
 * *controlled* `ThemeProvider` — one given a `theme` prop — this button is
 * inert by design: the owner of that prop decides, and the toggle only
 * reports the request through `onThemeChange`.
 */
export function ThemeToggle({
  size = 'sm',
  variant = 'ghost',
  bare = false,
  className,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, cycleTheme } = useTheme()

  const icon = theme === 'system' ? 'monitor' : theme === 'dark' ? 'moon' : 'sun'
  const state =
    theme === 'system' ? `following the system (${resolvedTheme})` : `${theme}, pinned`
  const next =
    theme === 'system'
      ? resolvedTheme === 'dark'
        ? 'light'
        : 'dark'
      : theme !== resolvedTheme
        ? resolvedTheme
        : 'the system'

  return (
    <IconButton
      icon={<Icon name={icon} size={size === 'lg' ? 18 : 15} />}
      label={`Theme: ${state}. Switch to ${next}.`}
      size={size}
      variant={variant}
      bare={bare}
      className={cx('cds-theme-toggle', className)}
      onClick={cycleTheme}
    />
  )
}
