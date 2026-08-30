import type { HTMLAttributes, ReactNode } from 'react'
import { useMemo } from 'react'
import { cx } from '../../utils/cx'
import { useControllableState } from '../../utils/useControllableState'
import type { ChartDomain, ChartKey } from '../Chart/chart-types'
import { ChartGroupContext, ChartHoverContext } from './ChartGroupContext'
import './ChartGroup.css'

const ALL_CHANNELS: ('hover' | 'selection' | 'series' | 'zoom')[] = [
  'hover',
  'selection',
  'series',
  'zoom',
]

export interface ChartGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The datum under the pointer in any member chart. */
  hoverKey?: ChartKey | null
  defaultHoverKey?: ChartKey | null
  onHoverChange?: (key: ChartKey | null) => void

  /** Datum keys the whole group is filtered to. Empty means no filter. */
  selected?: ChartKey[]
  defaultSelected?: ChartKey[]
  onSelectionChange?: (keys: ChartKey[]) => void

  hiddenSeries?: string[]
  defaultHiddenSeries?: string[]
  onHiddenSeriesChange?: (keys: string[]) => void

  zoom?: ChartDomain | null
  defaultZoom?: ChartDomain | null
  onZoomChange?: (domain: ChartDomain | null) => void

  /** Which channels are shared. Defaults to all four. */
  sync?: ('hover' | 'selection' | 'series' | 'zoom')[]
  /** How a datum click changes `selected`. */
  selectionMode?: 'toggle' | 'replace' | 'none'
  /** Lays members out on a grid. Use `Stack` instead if you want a column. */
  columns?: 1 | 2 | 3
  gap?: 4 | 6 | 8
  children?: ReactNode
}

/**
 * Links several charts so they share a hover, a filter, a hidden-series set and
 * a zoom window.
 *
 * The rest of this system lifts state to the caller, and that still works —
 * pass the props to each chart directly and skip this entirely. What lifting
 * cannot answer is eight interaction props multiplied by however many charts
 * are on the page: cross-filtering four charts by hand is thirty-two props
 * wired identically, which is boilerplate a caller gets wrong.
 *
 * So this follows the one precedent the system already has for shared defaults
 * — `useFieldControl`, where a `Field` supplies what a control's own props do
 * not. Resolution is always own prop → group → the chart's own state, and a
 * chart can opt out per channel with `sync={['hover']}`.
 *
 * Charts in one group share a key space. Two charts over the same weeks should
 * both key on the ISO week; a chart keyed on section and a chart keyed on week
 * are only meaningfully grouped for `series`, and should say so.
 */
export function ChartGroup({
  hoverKey,
  defaultHoverKey = null,
  onHoverChange,
  selected,
  defaultSelected = [],
  onSelectionChange,
  hiddenSeries,
  defaultHiddenSeries = [],
  onHiddenSeriesChange,
  zoom,
  defaultZoom = null,
  onZoomChange,
  sync = ALL_CHANNELS,
  selectionMode = 'toggle',
  columns,
  gap = 6,
  className,
  children,
  ...rest
}: ChartGroupProps) {
  const [hover, setHover] = useControllableState(hoverKey, defaultHoverKey, onHoverChange)
  const [selection, setSelection] = useControllableState(
    selected,
    defaultSelected,
    onSelectionChange
  )
  const [hidden, setHidden] = useControllableState(
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange
  )
  const [window, setWindow] = useControllableState(zoom, defaultZoom, onZoomChange)

  const hoverValue = useMemo(
    () => ({ hoverKey: hover, setHoverKey: setHover }),
    [hover, setHover]
  )

  const groupValue = useMemo(
    () => ({
      selected: selection,
      setSelected: setSelection,
      hiddenSeries: hidden,
      setHiddenSeries: setHidden,
      zoom: window,
      setZoom: setWindow,
      selectionMode,
      sync,
    }),
    [selection, setSelection, hidden, setHidden, window, setWindow, selectionMode, sync]
  )

  return (
    <ChartGroupContext.Provider value={groupValue}>
      <ChartHoverContext.Provider value={hoverValue}>
        <div
          className={cx(
            'cds-chart-group',
            columns && `cds-chart-group--cols-${columns}`,
            `cds-chart-group--gap-${gap}`,
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </ChartHoverContext.Provider>
    </ChartGroupContext.Provider>
  )
}
