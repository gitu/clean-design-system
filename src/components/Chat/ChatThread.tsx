import type { HTMLAttributes, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { cx } from '../../utils/cx'
import './Chat.css'

export interface ChatThreadProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Follow new turns as they arrive. Off once the reader scrolls up. */
  autoScroll?: boolean
  /** What a screen reader is told as turns arrive. */
  label?: string
}

/**
 * The scrolling conversation.
 *
 * Auto-scroll stops the moment the reader scrolls away from the bottom and
 * resumes when they come back — a thread that yanks itself down while someone
 * is reading an earlier answer is worse than one that never follows at all.
 *
 * The list is a polite live region, so a screen reader hears new turns without
 * being interrupted mid-sentence. Streaming text is deliberately *not*
 * announced token by token; `ChatMessage` marks a turn `streaming` and the
 * region only settles once it is done.
 */
export function ChatThread({
  children,
  autoScroll = true,
  label = 'Conversation',
  className,
  ...rest
}: ChatThreadProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const onScroll = () => {
      // 32px of slack, so a resting scroll position still counts as "at the end".
      pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 32
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!autoScroll || !pinned.current) return
    const node = ref.current
    if (node) node.scrollTop = node.scrollHeight
  })

  return (
    <div
      ref={ref}
      className={cx('cds-chat-thread', className)}
      role="log"
      aria-live="polite"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  )
}
