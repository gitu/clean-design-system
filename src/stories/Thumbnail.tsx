/**
 * A listing's lead photograph, as a placeholder.
 *
 * Story-only. The real thing in find-my-place is `ProgressiveImage`, which
 * tracks a download through loading → processing → ready and swaps a blurred
 * placeholder for the full image. That belongs to the product: the system has
 * no opinion about image pipelines, and a search result's thumbnail is one of
 * the few places where a product's own component is obviously right.
 *
 * What the system *does* settle is the box it sits in — a hairline, a sunken
 * ground, square corners, and a fixed ratio so a list of results does not
 * ripple as images arrive.
 */
export function Thumbnail({ count, label }: { count: number; label: string }) {
  return (
    <div
      style={{
        // Shrinks on a phone. `ResultCard` now lets its leading slot shrink,
        // but a fixed-width child would still refuse to.
        width: 'min(7.5rem, 28vw)',
        aspectRatio: '4 / 3',
        flex: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 'var(--cds-space-1)',
        background: 'var(--cds-color-surface-sunken)',
        border: 'var(--cds-hairline) solid var(--cds-color-rule)',
        borderRadius: 'var(--cds-radius-sm)',
      }}
    >
      <span className="cds-sr-only">{`${count} photographs of ${label}`}</span>
      <span
        aria-hidden="true"
        className="cds-numeric"
        style={{
          fontSize: 'var(--cds-text-2xs)',
          color: 'var(--cds-color-text-subtle)',
          background: 'var(--cds-color-surface)',
          padding: '1px var(--cds-space-1)',
          border: 'var(--cds-hairline) solid var(--cds-color-rule)',
        }}
      >
        {count}
      </span>
    </div>
  )
}
