import { Markdown, type MarkdownProps } from '../Markdown/Markdown'

export type ChatMarkdownProps = MarkdownProps

/**
 * `Markdown`, under the name the chat family uses.
 *
 * The renderer started here and then turned out to be the same component the
 * editor's preview needed, so it moved to `src/components/Markdown`. This alias
 * stays because `ChatMarkdown` is a published export and reads better beside
 * `ChatMessage` and `ChatDiff` — it is one line, not a second implementation.
 */
export function ChatMarkdown(props: ChatMarkdownProps) {
  return <Markdown {...props} />
}
