import type { SVGProps } from 'react'
import { cx } from '../../utils/cx'
import './Icon.css'

/**
 * Every glyph in the system, drawn on a 16-unit grid with a 1.5 hairline
 * stroke so icons sit at the same optical weight as the rules around them.
 */
const PATHS = {
  search: 'M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5ZM11 11l3 3',
  close: 'M4 4l8 8M12 4l-8 8',
  check: 'M3.5 8.5l3 3 6-7',
  dash: 'M4 8h8',
  plus: 'M8 3.5v9M3.5 8h9',
  minus: 'M3.5 8h9',
  'chevron-down': 'M4 6.5l4 4 4-4',
  'chevron-up': 'M4 9.5l4-4 4 4',
  'chevron-left': 'M9.5 12l-4-4 4-4',
  'chevron-right': 'M6.5 4l4 4-4 4',
  'arrow-up': 'M8 13V3M4 7l4-4 4 4',
  'arrow-down': 'M8 3v10M4 9l4 4 4-4',
  'arrow-right': 'M3 8h10M9 4l4 4-4 4',
  sort: 'M4.5 6.5l2-2.5 2 2.5M6.5 4v8M11.5 9.5l-2 2.5-2-2.5M9.5 12V4',
  filter: 'M2.5 4h11M4.5 8h7M6.5 12h3',
  menu: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11',
  more: 'M4 8h.01M8 8h.01M12 8h.01',
  external: 'M9 3h4v4M13 3L7.5 8.5M12 9.5V13H3V4h3.5',
  info: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM8 7.5V11M8 5.2v.4',
  alert: 'M8 2.5 14.5 13.5h-13L8 2.5ZM8 6.5v3M8 11.6v.4',
  calendar: 'M3 4.5h10v9H3v-9ZM3 7.5h10M5.5 2.5v3M10.5 2.5v3',
  clock: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM8 4.75V8l2.25 1.75',
  document: 'M4 2h5l3 3v9H4V2ZM9 2v3h3',
  tag: 'M2.5 8.5 8 3h4.5v4.5L7 13 2.5 8.5ZM10.2 5.8h.01',
  bookmark: 'M4 2.5h8v11l-4-2.75L4 13.5v-11Z',
  sun: 'M8 4.8a3.2 3.2 0 100 6.4 3.2 3.2 0 000-6.4M8 1.3v1.5M8 13.2v1.5M14.7 8h-1.5M2.8 8H1.3M12.74 3.26l-1.06 1.06M4.32 11.68l-1.06 1.06M12.74 12.74l-1.06-1.06M4.32 4.32L3.26 3.26',
  moon: 'M13.4 9.9A6 6 0 116.1 2.6 4.9 4.9 0 0013.4 9.9z',
  monitor: 'M2.2 3.4h11.6v7.2H2.2zM6 13.4h4M8 10.6v2.8',
  refresh: 'M13 8a5 5 0 1 1-1.6-3.7M13 2v3h-3',
  link: 'M6.6 9.4a2.9 2.9 0 0 0 4.1 0l1.8-1.8a2.9 2.9 0 0 0-4.1-4.1l-1 1M9.4 6.6a2.9 2.9 0 0 0-4.1 0L3.5 8.4a2.9 2.9 0 0 0 4.1 4.1l1-1',
  grip: 'M6 3.5h.01M10 3.5h.01M6 8h.01M10 8h.01M6 12.5h.01M10 12.5h.01',

  /* Text formatting. Drawn as letterforms rather than as symbols — a system
     whose whole subject is typography should not explain bold with a swatch. */
  bold: 'M5 3h4a2.5 2.5 0 0 1 0 5H5V3ZM5 8h4.6a2.5 2.5 0 0 1 0 5H5V8Z',
  italic: 'M10 3H6.6M9.4 13H6M9.1 3 6.9 13',
  heading: 'M4 3v10M11 3v10M4 8h7',
  code: 'M6 4.5 2.5 8 6 11.5M10 4.5 13.5 8 10 11.5',
  quote: 'M3 3v10M6.5 5h6.5M6.5 8h6.5M6.5 11h4',
  list: 'M2.5 4.5h.01M2.5 8h.01M2.5 11.5h.01M6 4.5h7.5M6 8h7.5M6 11.5h7.5',
  'list-ordered':
    'M7.4 4h6M7.4 8h6M7.4 12h6M2.7 3.9h.7v2.8M2.6 6.7h1.5M4.1 12.4H2.6c0-.7 1.4-1.3 1.4-2.1s-.7-1-1.4-.7',
} as const

export type IconName = keyof typeof PATHS

/** All icon names, in a stable order — handy for pickers and documentation. */
export const iconNames = Object.keys(PATHS) as IconName[]

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Which glyph to draw. */
  name: IconName
  /** Edge length in pixels. Defaults to 16 — the system's control-icon size. */
  size?: number | string
  /**
   * Accessible label. Omit it (the default) and the icon is hidden from
   * assistive tech, which is correct whenever adjacent text already says what
   * it means. Set it only for an icon carrying meaning on its own.
   */
  label?: string
}

export function Icon({ name, size = 16, label, className, ...rest }: IconProps) {
  const d = PATHS[name]
  return (
    <svg
      className={cx('cds-icon', className)}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  )
}
