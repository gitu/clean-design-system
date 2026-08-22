import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
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
