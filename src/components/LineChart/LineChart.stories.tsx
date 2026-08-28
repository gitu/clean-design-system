import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChart } from './LineChart'
import { Stack } from '../Stack/Stack'
import { QUERY_WEEKS, type QueryWeek } from '../../stories/fixtures'

const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
  args: {
    data: QUERY_WEEKS,
    x: (w: QueryWeek) => new Date(w.week),
    datumKey: (w: QueryWeek) => w.week,
    label: 'Searches per week',
    series: [{ key: 'searches', label: 'Searches', value: (w: QueryWeek) => w.searches }],
    // Visual-review stories opt out of the reveal so their screenshots are
    // comparable between runs.
    animate: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LineChart<QueryWeek>>

export default meta
type Story = StoryObj<typeof LineChart<QueryWeek>>

/** One series is drawn in the accent — the data is the subject. */
export const Default: Story = {}

/** Three series, well inside what the palette separates by hue alone. */
export const MultipleSeries: Story = {
  args: {
    label: 'Searches by scope',
    series: [
      { key: 'articles', label: 'Articles', value: (w: QueryWeek) => w.articles },
      { key: 'images', label: 'Images', value: (w: QueryWeek) => w.images },
      { key: 'datasets', label: 'Datasets', value: (w: QueryWeek) => w.datasets },
    ],
  },
}

/**
 * A dashed stroke is how a fifth or sixth series stays readable once hue alone
 * has run out — and how a target or forecast reads as not-measured.
 */
export const DashedTarget: Story = {
  args: {
    label: 'Searches against target',
    series: [
      { key: 'searches', label: 'Actual', value: (w: QueryWeek) => w.searches },
      { key: 'target', label: 'Target', value: (w: QueryWeek) => w.target, dashed: true },
    ],
  },
}

/** `null` breaks the line. A week with no telemetry is not a week of zero searches. */
export const Gaps: Story = {
  args: {
    label: 'Latency with a monitoring outage',
    series: [{ key: 'latency', label: 'p95 latency', value: (w: QueryWeek) => w.latencyP95 }],
    formatValue: (n: number) => `${n} ms`,
  },
}

export const Curves: Story = {
  render: args => (
    <Stack gap={6}>
      <LineChart {...args} curve="linear" label="Linear" height={140} />
      <LineChart {...args} curve="monotone" label="Monotone" height={140} />
      <LineChart {...args} curve="step" label="Step" height={140} />
    </Stack>
  ),
}

/** Clicking a point reports it. Selection dims everything else. */
export const ClickToFilter: Story = {
  render: args => {
    const [picked, setPicked] = useState<string | null>(null)
    return (
      <Stack gap={4}>
        <LineChart
          {...args}
          animate={false}
          points="always"
          onDatumClick={event => setPicked(event.key)}
        />
        <p className="cds-body-sm">
          {picked ? `Filtered to the week of ${picked}.` : 'Click a point, or tab in and press Enter.'}
        </p>
      </Stack>
    )
  },
}

export const Empty: Story = {
  args: { data: [], label: 'Nothing indexed yet' },
}

export const Playground: Story = {
  args: { animate: true, points: 'always', height: 320 },
}
