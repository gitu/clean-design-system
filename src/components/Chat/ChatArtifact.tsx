import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import './Chat.css'

export interface ChatArtifactProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  /** Where the numbers came from. Say the tool and the window. */
  source?: ReactNode
  /** Copy, export, open-in-full. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Something the model computed, framed as a result rather than as speech.
 *
 * The `source` line is the point of the component. A chart inside an answer
 * carries more authority than the sentence around it, so it has to say where
 * its numbers came from — which tool, over which window. Without that the
 * reader cannot tell a query from a recollection, and the two look identical.
 */
export function ChatArtifact({
  title,
  source,
  actions,
  children,
  className,
  ...rest
}: ChatArtifactProps) {
  return (
    <figure className={cx('cds-chat-artifact', className)} {...rest}>
      {(title || actions) && (
        <div className="cds-chat-artifact__head">
          {title && <span className="cds-chat-artifact__title cds-kicker">{title}</span>}
          {actions && <div className="cds-chat-artifact__actions">{actions}</div>}
        </div>
      )}
      <div className="cds-chat-artifact__body">{children}</div>
      {source && (
        <figcaption className="cds-chat-artifact__source cds-body-sm">{source}</figcaption>
      )}
    </figure>
  )
}
