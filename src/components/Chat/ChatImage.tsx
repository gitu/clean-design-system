import { useState } from 'react'
import { cx } from '../../utils/cx'
import { Dialog } from '../Dialog/Dialog'
import './Chat.css'

export interface ChatImageProps {
  src: string
  /**
   * Required. An image in an answer is usually the answer, and an unlabelled
   * one is the whole answer missing for anyone who cannot see it.
   */
  alt: string
  /** Shown under the image — what it is, where it came from. */
  caption?: React.ReactNode
  /** Intrinsic size, so the layout does not jump when it loads. */
  width?: number
  height?: number
  /** Open full size in a dialog on click. */
  zoomable?: boolean
  className?: string
}

/**
 * An image in a turn — a screenshot the reader attached, or one the model
 * produced.
 *
 * Constrained by default: an attachment that fills the viewport pushes the
 * conversation off screen, so it is capped and click-to-zoom instead. `width`
 * and `height` are worth passing whenever they are known, because the reserved
 * box is what stops the thread jumping as images arrive.
 */
export function ChatImage({
  src,
  alt,
  caption,
  width,
  height,
  zoomable = true,
  className,
}: ChatImageProps) {
  const [zoomed, setZoomed] = useState(false)
  const [failed, setFailed] = useState(false)

  const image = (
    <img
      className="cds-chat-image__img"
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )

  if (failed) {
    return (
      <figure className={cx('cds-chat-image', 'is-failed', className)}>
        <div className="cds-chat-image__fallback cds-body-sm">
          Image could not be loaded — <span className="cds-mono">{alt}</span>
        </div>
      </figure>
    )
  }

  return (
    <figure className={cx('cds-chat-image', className)}>
      {zoomable ? (
        <button
          type="button"
          className="cds-chat-image__button"
          onClick={() => setZoomed(true)}
          aria-label={`${alt} — open full size`}
        >
          {image}
        </button>
      ) : (
        image
      )}
      {caption && <figcaption className="cds-chat-image__caption cds-body-sm">{caption}</figcaption>}

      {zoomable && (
        <Dialog open={zoomed} onClose={() => setZoomed(false)} title={alt} size="lg">
          <img className="cds-chat-image__full" src={src} alt={alt} />
        </Dialog>
      )}
    </figure>
  )
}
