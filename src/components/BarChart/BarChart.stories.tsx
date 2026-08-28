import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart } from './BarChart'
import { Stack } from '../Stack/Stack'
import { TOP_QUERIES, type TopQuery } from '../../stories/fixtures'

const SECTIONS = [
  { section: 'Finance', articles: 1284, images: 310, datasets: 96 },
  { section: 'Economy', articles: 967, images: 240, datasets: 140 },
  { section: 'Politics', articles: 812, images: 420, datasets: 61 },
  { section: 'Technology', articles: 604, images: 180, datasets: 210 },
  { section: 'Culture', articles: 419, images: 690, datasets: 24 },
  { section: 'Science', articles: 287, images: 120, datasets: 180 },
]
type Section = (typeof SECTIONS)[number]

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  args: {
    data: SECTIONS,
    x: (row: Section) => row.section,
    label: 'Documents by section',
    series: [{ key: 'articles', label: 'Articles', value: (row: Section) => row.articles }],
    animate: false,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BarChart<Section>>

export default meta
type Story = StoryObj<typeof BarChart<Section>>

export const Vertical: Story = {}

/** The orientation to reach for when categories have real names. */
export const Horizontal: Story = {
  args: { layout: 'horizontal', valueLabels: true, height: 240 },
}

export const Grouped: Story = {
  args: {
    label: 'Documents by section and type',
    series: [
      { key: 'articles', label: 'Articles', value: (row: Section) => row.articles },
      { key: 'images', label: 'Images', value: (row: Section) => row.images },
      { key: 'datasets', label: 'Datasets', value: (row: Section) => row.datasets },
    ],
  },
}

export const Stacked: Story = {
  args: {
    label: 'Documents by section and type',
    stacked: true,
    series: [
      { key: 'articles', label: 'Articles', value: (row: Section) => row.articles },
      { key: 'images', label: 'Images', value: (row: Section) => row.images },
      { key: 'datasets', label: 'Datasets', value: (row: Section) => row.datasets },
    ],
  },
}

/** Bars encode magnitude by length, so the baseline is anchored at zero. */
export const NegativeValues: Story = {
  args: {
    label: 'Net change in indexed documents',
    data: [
      { section: 'Finance', articles: 420, images: 0, datasets: 0 },
      { section: 'Economy', articles: -180, images: 0, datasets: 0 },
      { section: 'Politics', articles: 260, images: 0, datasets: 0 },
      { section: 'Culture', articles: -340, images: 0, datasets: 0 },
    ],
    valueLabels: true,
  },
}

/** Clicking a bar selects it; everything unselected dims. */
export const ClickToFilter: Story = {
  render: () => {
    const [picked, setPicked] = useState<string[]>([])
    return (
      <Stack gap={4}>
        <BarChart
          label="Top queries by volume"
          data={TOP_QUERIES}
          x={(q: TopQuery) => q.query}
          series={[{ key: 'searches', label: 'Searches', value: (q: TopQuery) => q.searches }]}
          layout="horizontal"
          height={260}
          valueLabels
          animate={false}
          selected={picked}
          onSelectionChange={setPicked}
        />
        <p className="cds-body-sm">
          {picked.length ? `Selected: ${picked.join(', ')}` : 'Click a bar, or tab in and press Enter.'}
        </p>
      </Stack>
    )
  },
}

export const Empty: Story = { args: { data: [], label: 'Nothing indexed' } }

export const Playground: Story = { args: { animate: true, height: 320 } }
