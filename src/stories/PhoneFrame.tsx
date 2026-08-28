interface PhoneFrameProps {
  /**
   * The story to show inside the frame. Must be a *different* story from the
   * one rendering the frame, or it loads itself forever.
   */
  storyId: string
  /** Passed through so the frame follows the toolbar's theme. */
  theme?: string
  width?: number
  height?: number
  /** Shown under the frame. */
  caption?: string
}

/**
 * A pattern story rendered at phone size, inside a real iframe.
 *
 * The iframe is the point. This system's responsive behaviour is expressed in
 * `@media (max-width: …)` rules, and a media query asks the *viewport*, not the
 * element — so shrinking a `<div>` around a story proves nothing, because the
 * story keeps rendering its desktop layout inside the narrow box. An iframe has
 * a viewport of its own, so the breakpoints actually fire and what you see is
 * what a phone gets.
 *
 * Story-only: it points at Storybook's own `iframe.html`, so it has no meaning
 * outside this Storybook and is not part of the system.
 */
export function PhoneFrame({
  storyId,
  theme = 'light',
  width = 390,
  height = 844,
  caption,
}: PhoneFrameProps) {
  const src = `iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story&globals=theme:${encodeURIComponent(theme)}`

  return (
    <figure style={{ margin: 0, display: 'inline-flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          width,
          height,
          flex: 'none',
          overflow: 'hidden',
          border: 'var(--cds-hairline) solid var(--cds-color-rule-strong)',
          borderRadius: 'var(--cds-radius-lg)',
          boxShadow: 'var(--cds-shadow-md)',
          background: 'var(--cds-color-canvas)',
        }}
      >
        <iframe
          src={src}
          title={caption ?? `${storyId} at ${width} by ${height}`}
          width={width}
          height={height}
          loading="lazy"
          style={{ border: 0, display: 'block' }}
        />
      </div>
      <figcaption className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
        {caption ?? `${width} × ${height}`}
      </figcaption>
    </figure>
  )
}
