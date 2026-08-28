import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartGroup } from './ChartGroup'
import { ChartFrame } from '../ChartFrame/ChartFrame'
import { LineChart } from '../LineChart/LineChart'
import { BarChart } from '../BarChart/BarChart'
import { Stack } from '../Stack/Stack'
import { QUERY_WEEKS, TOP_QUERIES, type QueryWeek, type TopQuery } from '../../stories/fixtures'

const WEEKS = QUERY_WEEKS.slice(-12)

const meta = {
  title: 'Charts/ChartGroup',
  component: ChartGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChartGroup>

export default meta
type Story = StoryObj<typeof meta>

const line = (key: string, label: string, value: (w: QueryWeek) => number | null) => (
  <ChartFrame title={label}>
    <LineChart
      label={label}
      data={WEEKS}
      x={w => new Date(w.week)}
      datumKey={w => w.week}
      series={[{ key, label, value }]}
      height={180}
      animate={false}
    />
  </ChartFrame>
)

/**
 * Hovering either chart moves the crosshair in both, because they agree on
 * `datumKey` — the ISO week is the shared vocabulary.
 */
export const LinkedHover: Story = {
  render: () => (
    <ChartGroup columns={2}>
      {line('searches', 'Searches', w => w.searches)}
      {line('zero', 'Zero-result rate', w => w.zeroResults)}
    </ChartGroup>
  ),
}

/** Controlled: the group relays every change, so selection can live in a URL. */
export const Controlled: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([])
    return (
      <Stack gap={4}>
        <ChartGroup selected={selected} onSelectionChange={setSelected} selectionMode="toggle">
          <ChartFrame title="Top queries" description="Click bars to build a selection">
            <BarChart
              label="Top queries"
              data={TOP_QUERIES}
              x={(q: TopQuery) => q.query}
              series={[{ key: 'searches', label: 'Searches', value: (q: TopQuery) => q.searches }]}
              layout="horizontal"
              height={240}
              animate={false}
            />
          </ChartFrame>
        </ChartGroup>
        <p className="cds-body-sm">
          {selected.length ? `Selected: ${selected.join(', ')}` : 'Nothing selected.'}
        </p>
      </Stack>
    )
  },
}

/**
 * `sync` opts a chart out per channel. The right-hand chart keeps its own
 * hover even though it is inside the group.
 */
export const OptingOut: Story = {
  render: () => (
    <ChartGroup columns={2}>
      {line('searches', 'Linked', w => w.searches)}
      <ChartFrame title="Independent" description="sync={false}">
        <LineChart
          label="Independent"
          data={WEEKS}
          x={w => new Date(w.week)}
          datumKey={w => w.week}
          series={[{ key: 'ctr', label: 'Click-through', value: w => w.clickThrough }]}
          height={180}
          animate={false}
          sync={false}
        />
      </ChartFrame>
    </ChartGroup>
  ),
}
