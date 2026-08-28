import { useId, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import './Chat.css'

export interface ChatDiffProps {
  /** A unified diff. `diff --git` headers are optional. */
  patch: string
  /** Overrides the path taken from the patch header. */
  path?: string
  /** Collapse to this many lines. `false` shows the whole patch. */
  preview?: number | false
  className?: string
}

interface DiffLine {
  kind: 'add' | 'remove' | 'context' | 'hunk' | 'meta'
  text: string
  /** Line number in the old file, where there is one. */
  before?: number
  /** Line number in the new file, where there is one. */
  after?: number
}

/**
 * Parses a unified diff into lines with both sets of numbers.
 *
 * Deliberately forgiving: models produce patches with and without `diff --git`
 * headers, with and without trailing newlines, and occasionally with the hunk
 * counts slightly wrong. Anything unrecognised is carried through as `meta`
 * rather than dropped, because a patch you cannot fully parse is still a patch
 * the reader should be able to see.
 */
function parsePatch(patch: string): { lines: DiffLine[]; path?: string; added: number; removed: number } {
  const out: DiffLine[] = []
  let path: string | undefined
  let before = 0
  let after = 0
  let added = 0
  let removed = 0

  for (const raw of patch.replace(/\n$/, '').split('\n')) {
    if (raw.startsWith('diff --git')) {
      const match = raw.match(/ b\/(\S+)$/)
      if (match?.[1]) path = match[1]
      out.push({ kind: 'meta', text: raw })
      continue
    }
    if (raw.startsWith('+++ ')) {
      const candidate = raw.slice(4).replace(/^b\//, '').trim()
      if (candidate && candidate !== '/dev/null') path ??= candidate
      out.push({ kind: 'meta', text: raw })
      continue
    }
    if (raw.startsWith('--- ') || raw.startsWith('index ') || raw.startsWith('new file') || raw.startsWith('deleted file')) {
      out.push({ kind: 'meta', text: raw })
      continue
    }
    const hunk = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (hunk) {
      before = Number(hunk[1])
      after = Number(hunk[2])
      out.push({ kind: 'hunk', text: raw })
      continue
    }
    if (raw.startsWith('+')) {
      added++
      out.push({ kind: 'add', text: raw.slice(1), after: after++ })
    } else if (raw.startsWith('-')) {
      removed++
      out.push({ kind: 'remove', text: raw.slice(1), before: before++ })
    } else {
      const text = raw.startsWith(' ') ? raw.slice(1) : raw
      out.push({ kind: 'context', text, before: before++, after: after++ })
    }
  }

  return { lines: out, path, added, removed }
}

/**
 * A patch, as a patch.
 *
 * Added and removed lines are marked by a sign in the gutter and a tinted
 * ground — both, because the success and danger tints alone are the one place
 * this system would otherwise be asking colour to carry meaning on its own.
 *
 * The `meta` lines of a `diff --git` header are kept but muted: they are how
 * you tell a rename from an edit, and dropping them makes some patches
 * unreadable.
 */
export function ChatDiff({ patch, path, preview = 16, className }: ChatDiffProps) {
  const [expanded, setExpanded] = useState(false)
  const bodyId = useId()
  const parsed = useMemo(() => parsePatch(patch), [patch])

  const budget = preview === false ? parsed.lines.length : preview
  const truncated = !expanded && parsed.lines.length > budget
  const shown = truncated ? parsed.lines.slice(0, budget) : parsed.lines
  const hidden = parsed.lines.length - shown.length

  return (
    <div className={cx('cds-chat-diff', className)}>
      <div className="cds-chat-file__head">
        <Icon name="document" size={13} />
        <span className="cds-chat-file__path cds-mono">{path ?? parsed.path ?? 'patch'}</span>
        <span className="cds-chat-diff__counts cds-numeric">
          <span className="cds-chat-diff__added">+{parsed.added}</span>
          <span className="cds-chat-diff__removed">−{parsed.removed}</span>
        </span>
      </div>

      <pre className="cds-chat-file__body" id={bodyId}>
        <code>
          {shown.map((line, index) => (
            <span key={index} className={cx('cds-chat-file__line', `is-${line.kind}`)}>
              <span className="cds-chat-file__number" aria-hidden="true">
                {line.before ?? ''}
              </span>
              <span className="cds-chat-file__number" aria-hidden="true">
                {line.after ?? ''}
              </span>
              <span className="cds-chat-diff__sign" aria-hidden="true">
                {line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}
              </span>
              <span className="cds-chat-file__text">
                {/* A screen reader gets the word, not the glyph. */}
                {(line.kind === 'add' || line.kind === 'remove') && (
                  <span className="cds-sr-only">{line.kind === 'add' ? 'Added: ' : 'Removed: '}</span>
                )}
                {line.text || ' '}
              </span>
            </span>
          ))}
        </code>
      </pre>

      {parsed.lines.length > budget && (
        <button
          type="button"
          className="cds-chat-file__more"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded(value => !value)}
        >
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={12} />
          {expanded ? 'Show less' : `Show ${hidden} more ${hidden === 1 ? 'line' : 'lines'}`}
        </button>
      )}
    </div>
  )
}
