import type { KeyboardEvent, PointerEvent, ReactNode, Ref } from 'react'
import { useId } from 'react'
import { cx } from '../../utils/cx'
import { ChartSrTable } from './ChartSrTable'
import type { ChartLayout } from './chart-types'
import './Chart.css'

interface ChartSurfaceProps {
  containerRef: Ref<HTMLDivElement>
  layout: ChartLayout
  /** Accessible name. */
  label: string
  /** Read after the name — the caller's sentence plus a generated summary. */
  description: string
  /** Announced when the keyboard cursor lands. */
  announcement: string
  table: { caption: string; columns: string[]; rows: Array<{ key: string; label: string; values: string[] }> }
  className?: string
  style?: React.CSSProperties
  interactive: boolean
  animate: boolean
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void
  onPointerLeave?: (event: PointerEvent<HTMLDivElement>) => void
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  /** Drawn inside the plot, already translated by the margin. */
  children: ReactNode
  /** HTML drawn over the plot — the tooltip. */
  overlay?: ReactNode
  /** Replaces the plot entirely. */
  fallback?: ReactNode
  rest?: Record<string, unknown>
}

/**
 * The frame every chart shares: the SVG, the margins, the focus target and the
 * whole accessibility story.
 *
 * The SVG is `aria-hidden` in its entirety. ARIA on SVG children is supported
 * inconsistently enough across screen readers that the honest options are a
 * chart that reads as two hundred unlabelled nodes or one that says nothing at
 * all — so all semantics live in real DOM instead: a named, described
 * `role="img"` as the floor, a polite live region for the cursor, and a
 * visually-hidden table carrying the complete data for a reader who wants to
 * go at their own pace.
 */
export function ChartSurface({
  containerRef,
  layout,
  label,
  description,
  announcement,
  table,
  className,
  style,
  interactive,
  animate,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  onClick,
  children,
  overlay,
  fallback,
  rest,
}: ChartSurfaceProps) {
  const titleId = useId()
  const descId = useId()
  const { width, height, margin } = layout

  return (
    <figure
      ref={containerRef}
      className={cx('cds-chart', animate && 'cds-chart--animate', className)}
      style={style}
      // No explicit role: <figure> already has one, and `role="group"` on it is
      // not an allowed override. The figcaption plus aria-labelledby is what
      // names it.
      aria-labelledby={titleId}
      {...rest}
    >
      <figcaption id={titleId} className="cds-sr-only">
        {label}
      </figcaption>
      <p id={descId} className="cds-sr-only">
        {description}
      </p>

      <div
        className="cds-chart__plot"
        style={{ height }}
        // One tab stop for the whole chart; the arrow keys move a virtual
        // cursor inside it. See useChartKeyboard.
        tabIndex={interactive ? 0 : undefined}
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={onKeyDown}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        {fallback ?? (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="cds-chart__svg cds-numeric"
            aria-hidden="true"
            focusable="false"
          >
            <g transform={`translate(${margin.left},${margin.top})`}>{children}</g>
          </svg>
        )}
        {overlay}
      </div>

      <div className="cds-sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <ChartSrTable caption={table.caption} columns={table.columns} rows={table.rows} />
    </figure>
  )
}
