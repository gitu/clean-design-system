import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Icon, type IconName } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import './Callout.css'

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger'

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Which status this is. `info` is the default and by far the most common. */
  tone?: CalloutTone
  /** First line, set as a label. State what happened. */
  title?: ReactNode
  /** The explanation, and what to do about it. */
  children?: ReactNode
  /** Buttons under the text — "Try again", "Enter it by hand". */
  actions?: ReactNode
  /** Replace the tone's own glyph. Pass `null` to drop it. */
  icon?: ReactNode
  /**
   * Announce this to assistive technology when it appears.
   *
   * Off by default, and that default matters: a callout that is simply part of
   * the page — "imported from Homegate on 2 August" — is read in document order
   * like any other text, and wrapping it in a live region would make a screen
   * reader interrupt itself on every page load. Turn it on for one that appears
   * *in response to something*, which is when there is news to announce.
   *
   * `danger` and `warning` announce assertively; the quieter tones do not
   * interrupt.
   */
  live?: boolean
  /** Show a dismiss control. */
  onDismiss?: () => void
  dismissLabel?: string
}

const TONE_ICON: Record<CalloutTone, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  danger: 'alert',
}

/**
 * An inline status block: what just happened, and what to do about it.
 *
 * The counterpart to `Toast`, and the difference is where the news belongs. A
 * toast is about the application and floats above the page; a callout is about
 * *this* content and sits in the flow next to it, so it survives scrolling,
 * printing and coming back to the page ten minutes later.
 *
 * Tinted rather than ruled — the one place this system fills a block with
 * colour, because a status that does not catch the eye is not doing its job.
 * Red still means wrong, never merely selected.
 */
export function Callout({
  tone = 'info',
  title,
  children,
  actions,
  icon,
  live = false,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  ...rest
}: CalloutProps) {
  const role = live ? (tone === 'danger' || tone === 'warning' ? 'alert' : 'status') : undefined

  return (
    <div className={cx('cds-callout', `cds-callout--${tone}`, className)} role={role} {...rest}>
      {icon !== null && (
        <span className="cds-callout__icon" aria-hidden="true">
          {icon ?? <Icon name={TONE_ICON[tone]} />}
        </span>
      )}

      <div className="cds-callout__body">
        {title && <p className="cds-callout__title cds-label">{title}</p>}
        {children && <div className="cds-callout__text cds-body-sm">{children}</div>}
        {actions && <div className="cds-callout__actions">{actions}</div>}
      </div>

      {onDismiss && (
        <IconButton
          icon={<Icon name="close" />}
          label={dismissLabel}
          size="sm"
          bare
          className="cds-callout__dismiss"
          onClick={onDismiss}
        />
      )}
    </div>
  )
}
