/**
 * A five-star team rating.
 *
 * Story-only, and deliberately so. This is the shape of a gap rather than a
 * proposal: find-my-place rates every property 1–5, the system has no rating
 * control and no star in its icon set, and the argument for keeping it that way
 * is that a star rating is not editorial search — it is a domain opinion about
 * one kind of record. Drawing it here costs thirty lines and says exactly what
 * the product would have to own.
 *
 * The stars are decorative; the rating is announced once, as text.
 */
export function Rating({ value, max = 5 }: { value?: number; max?: number }) {
  if (value == null) {
    return (
      <span
        className="cds-ui-sm cds-text-subtle"
        style={{ fontSize: 'var(--cds-text-xs)' }}
      >
        Unrated
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', gap: 1, lineHeight: 1 }}>
      <span className="cds-sr-only">{`Rated ${value} out of ${max}`}</span>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width={12}
          height={12}
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
          fill={i < value ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{
            color:
              i < value ? 'var(--cds-color-text-muted)' : 'var(--cds-color-rule-strong)',
            flex: 'none',
          }}
        >
          <path d="M8 1.75 10 6l4.5.6-3.3 3.1.85 4.55L8 12.1 3.95 14.25 4.8 9.7 1.5 6.6 6 6Z" />
        </svg>
      ))}
    </span>
  )
}
