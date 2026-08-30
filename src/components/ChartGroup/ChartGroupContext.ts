import { createContext } from 'react'
import type { ChartDomain, ChartKey } from '../Chart/chart-types'

/**
 * Two contexts, split by how often they change.
 *
 * Hover updates on every pointer move. Keeping it out of the main context
 * means a pointer crossing one chart re-renders only the charts that read
 * hover — not the legends, not the frames, not anything watching selection.
 * On a dashboard of six charts that is the difference between linked
 * highlighting that feels instant and one that doesn't.
 */
export interface ChartHoverValue {
  hoverKey: ChartKey | null
  setHoverKey: (key: ChartKey | null) => void
}

export interface ChartGroupValue {
  selected: ChartKey[]
  setSelected: (keys: ChartKey[]) => void
  hiddenSeries: string[]
  setHiddenSeries: (keys: string[]) => void
  zoom: ChartDomain | null
  setZoom: (domain: ChartDomain | null) => void
  /** How a datum click changes `selected`. */
  selectionMode: 'toggle' | 'replace' | 'none'
  /** Channels this group actually shares. */
  sync: ('hover' | 'selection' | 'series' | 'zoom')[]
}

export const ChartGroupContext = createContext<ChartGroupValue | null>(null)
export const ChartHoverContext = createContext<ChartHoverValue | null>(null)
