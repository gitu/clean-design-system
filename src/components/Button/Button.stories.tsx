import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: { layout: 'padded' },
  args: { children: 'Search archive' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button {...args} variant="primary">Apply filters</Button>
      <Button {...args} variant="accent">Search</Button>
      <Button {...args} variant="secondary">Export</Button>
      <Button {...args} variant="ghost">Reset</Button>
      <Button {...args} variant="danger">Delete saved search</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button size="sm" variant="secondary">Small</Button>
      <Button size="md" variant="secondary">Medium</Button>
      <Button size="lg" variant="secondary">Large</Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary" iconStart={<Icon name="search" />}>Search</Button>
      <Button variant="secondary" iconStart={<Icon name="filter" />}>Filters</Button>
      <Button variant="secondary" iconEnd={<Icon name="chevron-down" />}>Sort by date</Button>
      <Button variant="ghost" iconStart={<Icon name="external" />}>Open source</Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button variant="primary">Default</Button>
      <Button variant="primary" loading>Searching</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="secondary" aria-pressed="true">Pressed</Button>
    </div>
  ),
}

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
}
