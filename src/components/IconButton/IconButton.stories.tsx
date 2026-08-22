import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './IconButton'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  args: { icon: <Icon name="filter" />, label: 'Filters' },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton icon={<Icon name="search" />} label="Search" variant="primary" />
      <IconButton icon={<Icon name="search" />} label="Search" variant="accent" />
      <IconButton icon={<Icon name="filter" />} label="Filters" variant="secondary" />
      <IconButton icon={<Icon name="more" />} label="More" variant="ghost" />
      <IconButton icon={<Icon name="close" />} label="Remove" variant="danger" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <IconButton icon={<Icon name="bookmark" size={13} />} label="Save" size="sm" variant="secondary" />
      <IconButton icon={<Icon name="bookmark" />} label="Save" size="md" variant="secondary" />
      <IconButton icon={<Icon name="bookmark" size={18} />} label="Save" size="lg" variant="secondary" />
    </div>
  ),
}

export const Playground: Story = {}
