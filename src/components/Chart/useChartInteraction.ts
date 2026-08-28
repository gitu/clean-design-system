import { useCallback, useContext, useState } from 'react'
import { ChartGroupContext, ChartHoverContext } from '../ChartGroup/ChartGroupContext'
import type { ChartDomain, ChartInteractionProps, ChartKey } from './chart-types'

type Channel = 'hover' | 'selection' | 'series' | 'zoom'

/**
 * Resolves the four linked channels for one chart.
 *
 * Order is always: the chart's own prop, then the surrounding `ChartGroup`,
 * then state the chart keeps itself. That is the `useFieldControl` pattern —
 * context supplies a default, an explicit prop always wins — applied four
 * times. The consequence worth knowing is that a chart is never *forced* into
 * a group: passing `hoverKey` takes it back, and `sync` opts out wholesale or
 * per channel.
 */
export function useChartInteraction<Datum>(props: ChartInteractionProps<Datum>) {
  const group = useContext(ChartGroupContext)
  const hoverContext = useContext(ChartHoverContext)

  const [ownHover, setOwnHover] = useState<ChartKey | null>(null)
  const [ownSelected, setOwnSelected] = useState<ChartKey[]>([])
  const [ownHidden, setOwnHidden] = useState<string[]>([])
  const [ownZoom, setOwnZoom] = useState<ChartDomain | null>(null)

  const syncs = useCallback(
    (channel: Channel) => {
      if (props.sync === false) return false
      if (Array.isArray(props.sync)) return props.sync.includes(channel)
      return group?.sync.includes(channel) ?? false
    },
    [props.sync, group]
  )

  const hoverKey =
    props.hoverKey !== undefined
      ? props.hoverKey
      : syncs('hover') && hoverContext
        ? hoverContext.hoverKey
        : ownHover

  const setHoverKey = useCallback(
    (key: ChartKey | null) => {
      if (props.hoverKey === undefined) {
        if (syncs('hover') && hoverContext) hoverContext.setHoverKey(key)
        else setOwnHover(key)
      }
      props.onHoverChange?.(key)
    },
    [props, syncs, hoverContext]
  )

  const selected =
    props.selected !== undefined
      ? props.selected
      : syncs('selection') && group
        ? group.selected
        : ownSelected

  const setSelected = useCallback(
    (keys: ChartKey[]) => {
      if (props.selected === undefined) {
        if (syncs('selection') && group) group.setSelected(keys)
        else setOwnSelected(keys)
      }
      props.onSelectionChange?.(keys)
    },
    [props, syncs, group]
  )

  const hiddenSeries =
    props.hiddenSeries !== undefined
      ? props.hiddenSeries
      : syncs('series') && group
        ? group.hiddenSeries
        : ownHidden

  const setHiddenSeries = useCallback(
    (keys: string[]) => {
      if (props.hiddenSeries === undefined) {
        if (syncs('series') && group) group.setHiddenSeries(keys)
        else setOwnHidden(keys)
      }
      props.onHiddenSeriesChange?.(keys)
    },
    [props, syncs, group]
  )

  const zoom =
    props.zoom !== undefined ? props.zoom : syncs('zoom') && group ? group.zoom : ownZoom

  const setZoom = useCallback(
    (domain: ChartDomain | null) => {
      if (props.zoom === undefined) {
        if (syncs('zoom') && group) group.setZoom(domain)
        else setOwnZoom(domain)
      }
      props.onZoomChange?.(domain)
    },
    [props, syncs, group]
  )

  /**
   * A datum click means "filter to this" — the group decides whether that adds
   * to the current set or replaces it. `none` leaves selection alone and lets
   * `onDatumClick` do whatever the caller wants instead, which is the shape
   * drill-down takes.
   */
  const toggleSelection = useCallback(
    (key: ChartKey) => {
      const mode = group?.selectionMode ?? 'toggle'
      if (mode === 'none') return
      if (mode === 'replace') {
        setSelected(selected.length === 1 && selected[0] === key ? [] : [key])
        return
      }
      setSelected(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key])
    },
    [group, selected, setSelected]
  )

  return {
    hoverKey,
    setHoverKey,
    selected,
    setSelected,
    toggleSelection,
    hiddenSeries,
    setHiddenSeries,
    zoom,
    setZoom,
  }
}
