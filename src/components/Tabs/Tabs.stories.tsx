import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Tabs } from './Tabs'
import { Icon } from '../Icon/Icon'

const ITEMS = [
  { value: 'all', label: 'All', count: 4231 },
  { value: 'articles', label: 'Articles', count: 3187 },
  { value: 'images', label: 'Images', count: 742 },
  { value: 'data', label: 'Datasets', count: 288 },
  { value: 'audio', label: 'Audio', count: 14 },
  { value: 'video', label: 'Video', count: 0, disabled: true },
]

const meta = {
  title: 'Layout/Tabs',
  component: Tabs,
  args: { items: ITEMS, label: 'Result types' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Underline: Story = {
  render: args => {
    const [value, setValue] = useState('all')
    return (
      <Tabs {...args} value={value} onChange={setValue}>
        <p className="cds-body">Showing the “{value}” scope.</p>
      </Tabs>
    )
  },
}

export const Enclosed: Story = {
  args: { variant: 'enclosed' },
  render: args => (
    <Tabs {...args}>
      <p className="cds-body">Enclosed tabs read as filed folders — useful for saved views.</p>
    </Tabs>
  ),
}

export const WithIcons: Story = {
  args: {
    size: 'sm',
    items: [
      { value: 'results', label: 'Results', icon: <Icon name="search" size={14} />, count: 4231 },
      { value: 'saved', label: 'Saved', icon: <Icon name="bookmark" size={14} />, count: 12 },
      { value: 'history', label: 'History', icon: <Icon name="clock" size={14} /> },
    ],
  },
}

export const FullWidth: Story = {
  args: { fullWidth: true, items: ITEMS.slice(0, 4) },
}

/**
 * More tabs than fit.
 *
 * The tablist scrolls and its scrollbar is hidden, which on a narrow window
 * left a row cut off mid-word with nothing to say there was more — reachable
 * by arrow key or a swipe, but only if you already knew to try. The edge
 * with more beyond it is faded now.
 *
 * Rendered in a deliberately narrow box so the case is visible in the
 * Storybook canvas rather than only on a phone.
 */
export const Overflowing: Story = {
  render: args => {
    const [value, setValue] = useState('all')
    return (
      <div style={{ maxWidth: 320 }}>
        <Tabs {...args} value={value} onChange={setValue}>
          <p className="cds-body">Showing the “{value}” scope.</p>
        </Tabs>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('tablist')

    // Only the trailing edge to begin with: nothing is off the start yet.
    await waitFor(() => expect(list).toHaveAttribute('data-overflow-end'))
    await expect(list).not.toHaveAttribute('data-overflow-start')

    list.scrollLeft = list.scrollWidth
    await waitFor(() => expect(list).toHaveAttribute('data-overflow-start'))
    await expect(list).not.toHaveAttribute('data-overflow-end')
  },
}
