import type { ReactNode } from 'react'

/**
 * The chat family.
 *
 * These live in one folder rather than six because they are never used apart —
 * a `ChatToolCall` outside a `ChatThread` is meaningless — and they share one
 * stylesheet. Everything here is exported; there is no internal half, unlike
 * `Chart/`.
 *
 * The design position, which the prop shapes follow from: **an assistant turn
 * is not a paragraph of text.** It is a sequence of things the model did —
 * called a tool, computed a figure, drew a chart, asked a question — and the
 * interface has to be able to show each of those as itself rather than as prose
 * about itself. So a message's content is `ReactNode`, and the pieces that make
 * up an answer are components a caller composes.
 */

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatTurn {
  id: string
  role: ChatRole
  /** Text, or any composition of the chat pieces. */
  content: ReactNode
  /** ISO timestamp. Rendered in the reader's locale. */
  at?: string
  /**
   * `streaming` shows a caret and keeps the live region polite; `error` rules
   * the turn in the danger colour.
   */
  status?: 'streaming' | 'done' | 'error'
}

export type ToolStatus = 'running' | 'done' | 'failed'

export interface ChatQuestionOption {
  id: string
  label: ReactNode
  /** A line under the label — what choosing this actually does. */
  description?: ReactNode
}
