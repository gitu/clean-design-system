import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from './Select'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Forms/Select',
  component: Select,
  args: {
    // Outside a `Field` there is nothing to name the control, so these
    // isolated stories supply the name themselves.
    'aria-label': 'Sort order',
    options: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'date', label: 'Publication date' },
      { value: 'length', label: 'Length' },
    ],
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
      <Select {...args} size="sm" />
      <Select {...args} size="md" />
      <Select {...args} size="lg" />
    </div>
  ),
}

export const Grouped: Story = {
  args: {
    options: [
      { value: 'all', label: 'All collections', group: 'Scope' },
      { value: 'archive', label: 'Newspaper archive', group: 'Scope' },
      { value: 'de', label: 'German', group: 'Language' },
      { value: 'en', label: 'English', group: 'Language' },
      { value: 'fr', label: 'French', group: 'Language' },
    ],
  },
  render: args => (
    <div style={{ maxWidth: 300 }}>
      <Select {...args} />
    </div>
  ),
}

export const Bare: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="cds-kicker">Sort</span>
      <Select {...args} bare size="sm" />
      <Select {...args} bare size="sm" iconStart={<Icon name="filter" size={14} />} />
    </div>
  ),
}

export const Playground: Story = { render: args => <div style={{ maxWidth: 300 }}><Select {...args} /></div> }
