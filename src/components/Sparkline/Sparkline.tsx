import type { HTMLAttributes } from 'react'
import { useId } from 'react'
import { scaleLinear } from '@visx/scale'
import { AreaClosed, LinePath } from '@visx/shape'
import { cx } from '../../utils/cx'
import { useChartSize } from '../Chart/useChartSize'
import './Sparkline.css'

export interface SparklineProps<Datum>
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** One entry per step along the line. Order is the order drawn. */
  data: Datum[]
  /**
   * Reads the plotted number out of a datum. Return `null` for a genuine gap —
   * a gap breaks the line, where zero draws a point at zero. They are not the
   * same thing and a sparkline is small enough that the difference matters.
   */
  value: (datum: Datum, index: number) => number | null
  /**
   * `line` is the default and the quietest. `area` fills beneath it for a
   * trend that carries weight. `bar` suits counts that are genuinely discrete.
   */
  kind?: 'line' | 'area' | 'bar'
  /** Accessible name, e.g. "Queries, last 30 days". Required — see the note below. */
  label: string
  /**
   * Read out after the name, e.g. "up 12 per cent". A sparkline has no axes and
   * no tooltip, so this sentence is the only thing a screen reader can convey.
   */
  summary?: string
  /** Any CSS colour, or a token. Defaults to the surrounding text colour. */
  color?: string
  /** Fixed width. Ignored when `fluid` is set. */
  width?: number
  height?: number
  /**
   * Fill the container's width instead of taking a fixed one.
   *
   * Measured rather than stretched: an SVG scaled with `preserveAspectRatio`
   * would thicken the stroke and distort the shape, which is the one thing a
   * sparkline has to get right. `width` becomes the fallback used for the first
   * render and on a server.
   */
  fluid?: boolean
  /** Mark the final point with a dot — useful when the line ends mid-scale. */
  endpoint?: boolean
}

/**
 * A word-sized chart, for a table cell or the corner of a stat tile. It has no
 * axes, no scale and no interaction by design: it shows a shape, not a reading.
 * When the number matters, put the number next to it.
 *
 * At a fixed width everything is derived from the props on every render, with
 * no measurement and no effect, so it renders identically on a server. `fluid`
 * opts into measuring the container — still server-safe, but the first frame
 * uses `width` as its fallback rather than the eventual size.
 */
export function Sparkline<Datum>({
  data,
  value,
  kind = 'line',
  label,
  summary,
  color,
  width = 88,
  height = 20,
  fluid = false,
  endpoint = false,
  className,
  style,
  ...rest
}: SparklineProps<Datum>) {
  const clipId = useId()
  const { ref, width: measured } = useChartSize(fluid ? undefined : width, width)
  const plotWidth = fluid ? measured : width

  // A stroke centred on the extreme of the range would be half clipped, so the
  // plot is inset by half the stroke width at the top and bottom.
  const inset = 1.5
  const points = data.map((datum, index) => ({ index, value: value(datum, index) }))
  const numbers = points.map(p => p.value).filter((v): v is number => v !== null)

  const hasPlot = numbers.length > 1 && plotWidth > 0 && height > 0
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)

  const x = scaleLinear<number>({
    domain: [0, Math.max(points.length - 1, 1)],
    range: [0, plotWidth],
  })
  const y = scaleLinear<number>({
    // A flat series would collapse to a zero-height domain and divide by zero;
    // pad it so the line sits on the centre line instead of vanishing.
    domain: min === max ? [min - 1, max + 1] : [min, max],
    range: [height - inset, inset],
  })

  const defined = (p: { value: number | null }) => p.value !== null
  const last = points[points.length - 1]

  return (
    <span
      className={cx('cds-sparkline', `cds-sparkline--${kind}`, fluid && 'is-fluid', className)}
      ref={ref}
      style={{ ...style, width: fluid ? '100%' : width, height, color }}
      role="img"
      aria-label={summary ? `${label}. ${summary}` : label}
      {...rest}
    >
      {hasPlot && (
        <svg
          width={plotWidth}
          height={height}
          viewBox={`0 0 ${plotWidth} ${height}`}
          aria-hidden="true"
        >
          {kind === 'bar' ? (
            points.map(point =>
              point.value === null ? null : (
                <rect
                  key={point.index}
                  className="cds-sparkline__bar"
                  x={x(point.index) - Math.max(plotWidth / points.length / 2 - 0.5, 0.5)}
                  y={y(point.value)}
                  width={Math.max(plotWidth / points.length - 1, 1)}
                  height={Math.max(height - inset - y(point.value), 0.5)}
                />
              )
            )
          ) : (
            <>
              {kind === 'area' && (
                <>
                  <clipPath id={clipId}>
                    <rect x={0} y={0} width={plotWidth} height={height} />
                  </clipPath>
                  <AreaClosed
                    className="cds-sparkline__area"
                    data={points}
                    x={p => x(p.index)}
                    y={p => y(p.value ?? 0)}
                    yScale={y}
                    defined={defined}
                    clipPath={`url(#${clipId})`}
                  />
                </>
              )}
              <LinePath
                className="cds-sparkline__line"
                data={points}
                x={p => x(p.index)}
                y={p => y(p.value ?? 0)}
                defined={defined}
              />
            </>
          )}
          {endpoint && last?.value != null && (
            <circle
              className="cds-sparkline__endpoint"
              cx={x(last.index)}
              cy={y(last.value)}
              r={1.75}
            />
          )}
        </svg>
      )}
    </span>
  )
}
