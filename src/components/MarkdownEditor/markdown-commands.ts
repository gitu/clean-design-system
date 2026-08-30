/**
 * The text transforms behind the editor's toolbar.
 *
 * Kept out of the component on purpose. Every one of these is a pure
 * `(text, selection) -> (text, selection)` function, which is the only shape
 * that makes "wrap the selection, then leave the cursor somewhere sensible"
 * reviewable — inside a component it would be twelve variants of
 * `setState(value.slice(0, start) + …)` and nobody would ever check the
 * arithmetic.
 */

export interface Selection {
  start: number
  end: number
}

export interface EditResult {
  value: string
  selection: Selection
}

export type MarkdownCommandId =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'code'
  | 'link'
  | 'quote'
  | 'list'
  | 'list-ordered'

/**
 * Wraps the selection in a marker, or unwraps it when it is already wrapped.
 *
 * The toggle is the part worth having: an editor where pressing ⌘B twice
 * leaves you with `****text****` is one people stop trusting, and they then
 * stop using the shortcut.
 *
 * With nothing selected it inserts the placeholder *and selects it*, so the
 * next keystroke replaces it rather than landing after it.
 */
export function wrap(
  value: string,
  selection: Selection,
  marker: string,
  placeholder: string
): EditResult {
  const { start, end } = selection
  const selected = value.slice(start, end)
  const width = marker.length

  // Already wrapped, either inside the selection or just outside it.
  const inside = selected.startsWith(marker) && selected.endsWith(marker) && selected.length >= width * 2
  const outside =
    value.slice(start - width, start) === marker && value.slice(end, end + width) === marker

  if (inside) {
    const stripped = selected.slice(width, -width)
    return {
      value: value.slice(0, start) + stripped + value.slice(end),
      selection: { start, end: start + stripped.length },
    }
  }

  if (outside) {
    return {
      value: value.slice(0, start - width) + selected + value.slice(end + width),
      selection: { start: start - width, end: end - width },
    }
  }

  const body = selected || placeholder
  return {
    value: value.slice(0, start) + marker + body + marker + value.slice(end),
    selection: { start: start + width, end: start + width + body.length },
  }
}

/** The whole lines the selection touches, as `[start, end]` offsets. */
function lineSpan(value: string, selection: Selection): Selection {
  const start = value.lastIndexOf('\n', selection.start - 1) + 1
  const nextBreak = value.indexOf('\n', selection.end)
  return { start, end: nextBreak === -1 ? value.length : nextBreak }
}

/**
 * Applies a per-line prefix — heading, quote, bullets, numbers.
 *
 * Line commands act on every line the selection *touches*, not on the selected
 * characters. Selecting the middle of three paragraphs and pressing "quote"
 * should quote three paragraphs; anything else is a surprise.
 *
 * Toggling off is symmetrical: if every touched line already carries the
 * prefix, it comes off. Mixed selections get the prefix added throughout,
 * because "make these all quotes" is the intent behind a mixed selection far
 * more often than "invert each line".
 */
export function prefixLines(
  value: string,
  selection: Selection,
  prefix: string | ((index: number) => string)
): EditResult {
  const span = lineSpan(value, selection)
  const lines = value.slice(span.start, span.end).split('\n')
  const at = (index: number) => (typeof prefix === 'string' ? prefix : prefix(index))

  const allPrefixed = lines.every((line, index) => line.startsWith(at(index)))
  const next = lines
    .map((line, index) => (allPrefixed ? line.slice(at(index).length) : at(index) + line))
    .join('\n')

  const delta = next.length - (span.end - span.start)
  const firstDelta = allPrefixed ? -at(0).length : at(0).length

  return {
    value: value.slice(0, span.start) + next + value.slice(span.end),
    selection: {
      // Keep the caret on the same character it was on, not at the line start.
      start: Math.max(span.start, selection.start + firstDelta),
      end: Math.max(span.start, selection.end + delta),
    },
  }
}

/**
 * A link, from whatever the selection happens to be.
 *
 * Three cases, because all three happen: selected text becomes the label,
 * a selected URL becomes the target, and an empty selection gets a skeleton
 * with the label pre-selected.
 */
export function link(value: string, selection: Selection): EditResult {
  const selected = value.slice(selection.start, selection.end)
  const isUrl = /^(https?:\/\/|mailto:|\/)\S*$/i.test(selected)

  const label = isUrl ? 'link text' : selected || 'link text'
  const href = isUrl ? selected : 'https://'
  const inserted = `[${label}](${href})`

  // Select the half the writer still has to fill in.
  const labelStart = selection.start + 1
  const hrefStart = labelStart + label.length + 2

  return {
    value: value.slice(0, selection.start) + inserted + value.slice(selection.end),
    selection: isUrl
      ? { start: labelStart, end: labelStart + label.length }
      : { start: hrefStart, end: hrefStart + href.length },
  }
}

export const COMMANDS: Record<
  MarkdownCommandId,
  { label: string; icon: string; shortcut?: string; run: (value: string, selection: Selection) => EditResult }
> = {
  heading: {
    label: 'Heading',
    icon: 'heading',
    run: (value, selection) => prefixLines(value, selection, '## '),
  },
  bold: {
    label: 'Bold',
    icon: 'bold',
    shortcut: 'Mod+B',
    run: (value, selection) => wrap(value, selection, '**', 'bold text'),
  },
  italic: {
    label: 'Italic',
    icon: 'italic',
    shortcut: 'Mod+I',
    run: (value, selection) => wrap(value, selection, '*', 'italic text'),
  },
  code: {
    label: 'Code',
    icon: 'code',
    shortcut: 'Mod+E',
    run: (value, selection) => wrap(value, selection, '`', 'code'),
  },
  link: {
    label: 'Link',
    icon: 'link',
    shortcut: 'Mod+K',
    run: link,
  },
  quote: {
    label: 'Quote',
    icon: 'quote',
    run: (value, selection) => prefixLines(value, selection, '> '),
  },
  list: {
    label: 'Bulleted list',
    icon: 'list',
    run: (value, selection) => prefixLines(value, selection, '- '),
  },
  'list-ordered': {
    label: 'Numbered list',
    icon: 'list-ordered',
    run: (value, selection) => prefixLines(value, selection, index => `${index + 1}. `),
  },
}

/**
 * Continues a list when Enter is pressed inside one, the way every editor
 * people already use does.
 *
 * Returns `null` when the line is not a list item, so the component can let the
 * keystroke through untouched. An empty item ends the list instead of adding
 * another bullet — otherwise leaving a list means deleting the marker the
 * editor just helpfully inserted.
 */
export function continueList(value: string, selection: Selection): EditResult | null {
  if (selection.start !== selection.end) return null

  const lineStart = value.lastIndexOf('\n', selection.start - 1) + 1
  const line = value.slice(lineStart, selection.start)

  const bullet = /^(\s*)([-*+])(\s+)(.*)$/.exec(line)
  const ordered = /^(\s*)(\d+)([.)])(\s+)(.*)$/.exec(line)
  if (!bullet && !ordered) return null

  const body = bullet ? bullet[4] : ordered?.[5]
  if (!body) {
    // An empty item: clear it and drop out of the list.
    return {
      value: value.slice(0, lineStart) + value.slice(selection.start),
      selection: { start: lineStart, end: lineStart },
    }
  }

  const marker = bullet
    ? `${bullet[1] ?? ''}${bullet[2] ?? ''}${bullet[3] ?? ''}`
    : `${ordered?.[1] ?? ''}${Number(ordered?.[2]) + 1}${ordered?.[3] ?? ''}${ordered?.[4] ?? ''}`

  const inserted = `\n${marker}`
  return {
    value: value.slice(0, selection.start) + inserted + value.slice(selection.end),
    selection: {
      start: selection.start + inserted.length,
      end: selection.start + inserted.length,
    },
  }
}

/** Words, counted the way a writer means it rather than by splitting on spaces. */
export function countWords(value: string): number {
  const trimmed = value.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}
