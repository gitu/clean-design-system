import type { ReactNode } from 'react'
import { Fragment, useMemo } from 'react'
import { cx } from '../../utils/cx'
import './Markdown.css'

export interface MarkdownProps {
  children: string
  /**
   * Rendered for a fenced code block. Pass one to add highlighting, or a
   * `ChatFile`. Without it, code blocks render as plain preformatted text.
   */
  renderCode?: (code: string, language?: string) => ReactNode
  className?: string
}

/**
 * A deliberately small Markdown subset, rendered as React elements.
 *
 * **No HTML is ever injected.** Every node below is constructed, never parsed
 * out of a string and handed to `dangerouslySetInnerHTML` — which is the entire
 * reason this exists rather than a dependency plus a sanitiser. Model output,
 * a comment box and a CMS body field are all untrusted input, and the safest
 * way to render untrusted input is to never give it a path to the DOM as
 * markup. It is also why the preview in `MarkdownEditor` can be live: there is
 * no sanitiser to get wrong.
 *
 * The cost is honest: this is a subset, not CommonMark. It handles paragraphs,
 * ATX headings, fenced and inline code, bold, italic, links, bullet and ordered
 * lists, block quotes and horizontal rules. It does not handle tables, nested
 * lists, reference links, footnotes or embedded HTML. A caller who needs those
 * should run their own parser and render the elements directly — this component
 * is for the ninety per cent case where a dependency and a sanitiser are not
 * worth it.
 */
export function Markdown({ children, renderCode, className }: MarkdownProps) {
  const blocks = useMemo(() => parseBlocks(children), [children])

  return (
    <div className={cx('cds-markdown', className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)[block.level - 1] ?? 'h6'
            return (
              <Tag key={index} className={block.level <= 2 ? 'cds-title' : 'cds-subtitle'}>
                {renderInline(block.text)}
              </Tag>
            )
          }
          case 'code':
            return (
              <Fragment key={index}>
                {renderCode ? (
                  renderCode(block.code, block.language)
                ) : (
                  <pre className="cds-markdown__code">
                    <code>{block.code}</code>
                  </pre>
                )}
              </Fragment>
            )
          case 'quote':
            return (
              <blockquote key={index} className="cds-markdown__quote">
                {renderInline(block.text)}
              </blockquote>
            )
          case 'rule':
            return <hr key={index} className="cds-markdown__rule" />
          case 'list':
            return block.ordered ? (
              <ol key={index} className="cds-markdown__list">
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="cds-markdown__list">
                {block.items.map((item, i) => (
                  <li key={i}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          default:
            return <p key={index}>{renderInline(block.text)}</p>
        }
      })}
    </div>
  )
}

/* --- blocks --------------------------------------------------------------- */

type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'rule' }

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    // Fenced code. Everything up to the closing fence is taken verbatim, which
    // is what stops markdown syntax inside a snippet from being interpreted.
    const fence = /^```\s*(\S+)?\s*$/.exec(line)
    if (fence) {
      flush()
      const code: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? '')) {
        code.push(lines[i] ?? '')
        i++
      }
      blocks.push({
        type: 'code',
        code: code.join('\n'),
        ...(fence[1] ? { language: fence[1] } : null),
      })
      continue
    }

    if (!line.trim()) {
      flush()
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flush()
      blocks.push({ type: 'rule' })
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flush()
      blocks.push({ type: 'heading', level: heading[1]?.length ?? 1, text: heading[2] ?? '' })
      continue
    }

    if (line.startsWith('> ')) {
      flush()
      const quote: string[] = []
      while (i < lines.length && (lines[i] ?? '').startsWith('> ')) {
        quote.push((lines[i] ?? '').slice(2))
        i++
      }
      i--
      blocks.push({ type: 'quote', text: quote.join(' ') })
      continue
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (bullet || ordered) {
      flush()
      const isOrdered = Boolean(ordered)
      const items: string[] = []
      while (i < lines.length) {
        const current = lines[i] ?? ''
        const match = isOrdered
          ? (/^\s*\d+[.)]\s+(.*)$/.exec(current))
          : (/^\s*[-*+]\s+(.*)$/.exec(current))
        if (!match) break
        items.push(match[1] ?? '')
        i++
      }
      i--
      blocks.push({ type: 'list', ordered: isOrdered, items })
      continue
    }

    paragraph.push(line.trim())
  }

  flush()
  return blocks
}

/* --- inline --------------------------------------------------------------- */

/**
 * Inline spans, resolved in one pass over a single alternation so that the
 * earliest match wins — which is what stops the `*` inside a code span from
 * being read as emphasis.
 */
function renderInline(text: string): ReactNode[] {
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)\s]+\))/
  const out: ReactNode[] = []
  let rest = text
  let key = 0

  while (rest) {
    const match = pattern.exec(rest)
    if (match?.index === undefined) {
      out.push(rest)
      break
    }
    if (match.index > 0) out.push(rest.slice(0, match.index))
    const token = match[0]

    if (token.startsWith('`')) {
      out.push(
        <code key={key++} className="cds-markdown__inline-code">
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('**')) {
      out.push(<strong key={key++}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token)
      const href = link?.[2] ?? '#'
      // Only http(s) and mailto survive. A `javascript:` URL in model output is
      // the obvious attack, and there is no legitimate use for one here.
      const safe = /^(https?:|mailto:|#|\/)/i.test(href) ? href : '#'
      out.push(
        <a key={key++} className="cds-link" href={safe} rel="noopener noreferrer" target="_blank">
          {link?.[1] ?? token}
        </a>
      )
    } else {
      out.push(<em key={key++}>{token.slice(1, -1)}</em>)
    }

    rest = rest.slice(match.index + token.length)
  }

  return out
}
