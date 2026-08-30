import { useState, type HTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import './Avatar.css'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The person. Used for the initials, and as the image's alt text. */
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * Tint the initials ground by hashing the name, so a list of people is
   * scannable. Off by default — a wall of colour is not this system's manner.
   */
  tinted?: boolean
  /** Decorative when the name is already written next to it. */
  decorative?: boolean
}

/** First letters of the first and last word — "M. Brunner" gives MB. */
function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/**
 * A person, as a picture or as their initials.
 *
 * The fallback is deliberately not a generic silhouette: initials identify
 * someone in a list of fourteen colleagues, and a row of identical grey heads
 * does not.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  tinted = false,
  decorative = false,
  className,
  style,
  ...rest
}: AvatarProps) {
  // A picture that fails to load leaves a broken-image glyph where a person
  // should be, which is worse than the fallback this component already has
  // for no picture at all.
  //
  // What is remembered is *which* URL failed, not a boolean. That way a new
  // `src` is untried by construction, with no effect needed to reset a flag
  // when the prop changes.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = src !== undefined && src !== failedSrc

  // A stable slot per name, so the same person keeps the same tint everywhere.
  const slot = tinted
    ? // eslint-disable-next-line @typescript-eslint/no-misused-spread -- a hash, not text handling
      ([...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6) + 1
    : null

  return (
    <span
      className={cx('cds-avatar', `cds-avatar--${size}`, tinted && 'is-tinted', className)}
      style={slot ? { ...style, ['--cds-avatar-tint' as string]: `var(--cds-color-series-${slot})` } : style}
      title={decorative ? undefined : name}
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      {...rest}
    >
      {showImage ? (
        <img
          className="cds-avatar__image"
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="cds-avatar__initials" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  )
}
