import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartTooltip } from './ChartTooltip'

const ROWS = [
  { key: 'articles', label: 'Articles', value: '29,480', color: 'var(--cds-color-series-1)' },
  { key: 'images', label: 'Images', value: '8,760', color: 'var(--cds-color-series-2)' },
  { key: 'datasets', label: 'Datasets', value: '4,100', color: 'var(--cds-color-series-3)' },
]

const meta: Meta<typeof ChartTooltip> = {
  title: 'Charts/ChartTooltip',
  component: ChartTooltip,
  args: { title: '8 July 2024', rows: ROWS, x: 0.2, y: 0.4 },
  parameters: { layout: 'padded' },
  decorators: [
    // The surface is positioned inside the chart wrapper, so it needs a
    // relatively-positioned box to sit in.
    Story => (
      <div style={{ position: 'relative', height: 220, border: '1px dashed var(--cds-color-rule)' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ChartTooltip>

export const Default: Story = {}

/** Past the midpoint it flips to the other side rather than leaving the plot. */
export const Flipped: Story = { args: { x: 0.8 } }

/** `top` pins it to the plot's top edge — calmer for a multi-series read. */
export const PinnedToTop: Story = { args: { placement: 'top' } }

export const WithFooter: Story = {
  args: { footer: 'Sampled at 100% · updated 4 minutes ago' },
}

export const SingleValue: Story = {
  args: { rows: [{ key: 'searches', label: 'Searches', value: '42,340' }] },
}
