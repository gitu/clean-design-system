import type { Meta, StoryObj } from '@storybook/react-vite'
import { AreaChart } from './AreaChart'
import { QUERY_WEEKS, type QueryWeek } from '../../stories/fixtures'

const SERIES = [
  { key: 'articles', label: 'Articles', value: (w: QueryWeek) => w.articles },
  { key: 'images', label: 'Images', value: (w: QueryWeek) => w.images },
  { key: 'datasets', label: 'Datasets', value: (w: QueryWeek) => w.datasets },
]

const meta = {
  title: 'Charts/AreaChart',
  component: AreaChart,
  args: {
    data: QUERY_WEEKS,
    x: (w: QueryWeek) => new Date(w.week),
    datumKey: (w: QueryWeek) => w.week,
    label: 'Searches by scope',
    series: SERIES,
    animate: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AreaChart<QueryWeek>>

export default meta
type Story = StoryObj<typeof AreaChart<QueryWeek>>

/** Stacked by default — the bands read as parts of a whole. */
export const Stacked: Story = {}

/** `expand` normalises each column to 100%: share over time, not volume. */
export const Share: Story = {
  args: { stackOffset: 'expand', label: 'Share of searches by scope' },
}

/** Unstacked only makes sense for a couple of series that genuinely overlap. */
export const Overlapping: Story = {
  args: {
    stacked: false,
    label: 'Articles against target',
    series: [
      { key: 'articles', label: 'Articles', value: (w: QueryWeek) => w.articles },
      { key: 'target', label: 'Target', value: (w: QueryWeek) => w.target },
    ],
  },
}

export const Playground: Story = { args: { animate: true, height: 320 } }
