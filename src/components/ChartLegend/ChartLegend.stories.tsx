import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartLegend } from './ChartLegend'
import { LineChart } from '../LineChart/LineChart'
import { Stack } from '../Stack/Stack'
import { QUERY_WEEKS, type QueryWeek } from '../../stories/fixtures'

const ITEMS = [
  { key: 'articles', label: 'Articles', color: 'var(--cds-color-series-1)' },
  { key: 'images', label: 'Images', color: 'var(--cds-color-series-2)' },
  { key: 'datasets', label: 'Datasets', color: 'var(--cds-color-series-3)' },
]

const meta = {
  title: 'Charts/ChartLegend',
  component: ChartLegend,
  args: { items: ITEMS },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChartLegend>

export default meta
type Story = StoryObj<typeof meta>

/** With no `onHiddenChange` it is static text, not buttons that do nothing. */
export const Static: Story = {}

export const Swatches: Story = {
  render: args => (
    <Stack gap={4}>
      <ChartLegend {...args} swatch="line" />
      <ChartLegend {...args} swatch="square" />
      <ChartLegend {...args} swatch="dot" />
    </Stack>
  ),
}

/** A dashed entry marks a series the chart draws dashed — a target, or a fifth series. */
export const Dashed: Story = {
  args: {
    items: [
      { key: 'actual', label: 'Actual', color: 'var(--cds-color-series-1)' },
      { key: 'target', label: 'Target', color: 'var(--cds-color-series-2)', dashed: true },
    ],
  },
}

/** A readout on the right, wired to whatever the chart is currently showing. */
export const WithValues: Story = {
  args: {
    orientation: 'vertical',
    items: ITEMS.map((item, i) => ({ ...item, value: [29480, 8760, 4100][i]?.toLocaleString('en-US') })),
  },
}

/** Toggling hides the series in the chart it is wired to. */
export const TogglingSeries: Story = {
  render: () => {
    const [hidden, setHidden] = useState<string[]>(['datasets'])
    return (
      <Stack gap={4}>
        <ChartLegend items={ITEMS} hiddenKeys={hidden} onHiddenChange={setHidden} />
        <LineChart
          label="Searches by scope"
          data={QUERY_WEEKS}
          x={(w: QueryWeek) => new Date(w.week)}
          datumKey={(w: QueryWeek) => w.week}
          series={[
            { key: 'articles', label: 'Articles', value: (w: QueryWeek) => w.articles },
            { key: 'images', label: 'Images', value: (w: QueryWeek) => w.images },
            { key: 'datasets', label: 'Datasets', value: (w: QueryWeek) => w.datasets },
          ]}
          hiddenSeries={hidden}
          onHiddenSeriesChange={setHidden}
          height={200}
          animate={false}
        />
      </Stack>
    )
  },
}

export const Playground: Story = { args: { swatch: 'square' } }
