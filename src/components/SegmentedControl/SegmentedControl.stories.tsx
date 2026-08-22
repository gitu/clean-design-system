import type { Meta, StoryObj } from '@storybook/react-vite'
import { SegmentedControl } from './SegmentedControl'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Forms/SegmentedControl',
  component: SegmentedControl,
  args: {
    label: 'Result density',
    options: [
      { value: 'list', label: 'List' },
      { value: 'table', label: 'Table' },
      { value: 'grid', label: 'Grid' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <SegmentedControl {...args} size="sm" />
      <SegmentedControl {...args} size="md" />
    </div>
  ),
}

export const IconOnly: Story = {
  args: {
    label: 'Density',
    options: [
      { value: 'comfortable', label: '', icon: <Icon name="menu" size={14} />, title: 'Comfortable' },
      { value: 'compact', label: '', icon: <Icon name="filter" size={14} />, title: 'Compact' },
    ],
  },
}

export const FullWidth: Story = {
  render: args => (
    <div style={{ maxWidth: 360 }}>
      <SegmentedControl {...args} fullWidth />
    </div>
  ),
}
