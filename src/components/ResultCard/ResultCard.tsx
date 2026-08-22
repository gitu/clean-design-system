import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Highlight } from '../Highlight/Highlight'
import './ResultCard.css'

export interface ResultCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The result's headline. Set in the editorial serif. */
  title: ReactNode
  /** Makes the title a link and the whole card clickable. */
  href?: string
  /** Uppercase kicker above the title — section, collection, source. */
  kicker?: ReactNode
  /** Body snippet. A string is highlighted against `query` automatically. */
  snippet?: ReactNode
  /** Terms to mark inside a string `title` and `snippet`. */
  query?: string | string[]
  /** Metadata line under the snippet: date, author, id, size. */
  meta?: ReactNode[]
  /** Badges and tags, shown at the end of the meta line. */
  tags?: ReactNode
  /** Leading slot — thumbnail, type icon, or a selection checkbox. */
  leading?: ReactNode
  /** Trailing slot — score, actions. */
  trailing?: ReactNode
  /** Draws the selected treatment: tinted ground and an accent edge. */
  selected?: boolean
  /** `comfortable` gives snippets room; `compact` fits more on screen. */
  density?: 'comfortable' | 'compact'
}

/**
 * One search result. Everything is optional except the title, so the same
 * component covers a bare list of filenames and a rich document result.
 */
export function ResultCard({
  title,
  href,
  kicker,
  snippet,
  query,
  meta,
  tags,
  leading,
  trailing,
  selected = false,
  density = 'comfortable',
  className,
  ...rest
}: ResultCardProps) {
  const renderText = (node: ReactNode) =>
    typeof node === 'string' && query ? <Highlight query={query}>{node}</Highlight> : node

  const heading = (
    <h3 className="cds-result__title">
      {href ? (
        <a className="cds-result__link" href={href}>
          {renderText(title)}
        </a>
      ) : (
        renderText(title)
      )}
    </h3>
  )

  return (
    <article
      className={cx(
        'cds-result',
        `cds-result--${density}`,
        selected && 'is-selected',
        href && 'is-linked',
        className
      )}
      aria-current={selected || undefined}
      {...rest}
    >
      {leading && <div className="cds-result__leading">{leading}</div>}
      <div className="cds-result__body">
        {kicker && <p className="cds-result__kicker cds-kicker">{kicker}</p>}
        {heading}
        {snippet && <p className="cds-result__snippet">{renderText(snippet)}</p>}
        {(meta?.length || tags) && (
          <div className="cds-result__footer">
            {meta?.map((item, i) => (
              <span key={i} className="cds-result__meta-item">
                {item}
              </span>
            ))}
            {tags && <span className="cds-result__tags">{tags}</span>}
          </div>
        )}
      </div>
      {trailing && <div className="cds-result__trailing">{trailing}</div>}
    </article>
  )
}
