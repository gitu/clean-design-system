import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavList } from './NavList'
import { Icon } from '../Icon/Icon'
import { Stack } from '../Stack/Stack'

const PAGES = [
  { id: 'all', label: 'All documents', group: 'Browse', count: 359065, href: '#' },
  { id: 'recent', label: 'Recently added', group: 'Browse', count: 1284, href: '#' },
  { id: 'saved', label: 'Saved searches', group: 'Browse', count: 12, href: '#' },
  { id: 'collections', label: 'Collections', group: 'Curation', count: 7, href: '#' },
  { id: 'embargoed', label: 'Embargoed', group: 'Curation', count: 3, href: '#' },
  { id: 'billing', label: 'Billing', group: 'Curation', href: '#', disabled: true },
]

const meta = {
  title: 'Layout/NavList',
  component: NavList,
  args: { items: PAGES, value: 'all', label: 'Library pages' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof NavList>

export default meta
type Story = StoryObj<typeof meta>

/** The sidebar case. Groups section the list; the current page gets a rule. */
export const Vertical: Story = {
  render: args => {
    const [value, setValue] = useState('all')
    return (
      <div style={{ maxWidth: 264 }}>
        <NavList {...args} value={value} onChange={setValue} />
      </div>
    )
  },
}

/** The header case. Groups are dropped — a bar is no place for section titles. */
export const Horizontal: Story = {
  render: args => {
    const [value, setValue] = useState('library')
    return (
      <NavList
        {...args}
        items={[
          { id: 'library', label: 'Library' },
          { id: 'ingest', label: 'Ingest' },
          { id: 'settings', label: 'Settings' },
        ]}
        orientation="horizontal"
        value={value}
        onChange={setValue}
        label="Areas"
      />
    )
  },
}

export const WithIcons: Story = {
  render: args => (
    <div style={{ maxWidth: 264 }}>
      <NavList
        {...args}
        items={[
          { id: 'all', label: 'All documents', icon: <Icon name="document" size={15} />, count: 359065 },
          { id: 'saved', label: 'Saved searches', icon: <Icon name="bookmark" size={15} />, count: 12 },
          { id: 'tags', label: 'Tags', icon: <Icon name="tag" size={15} />, count: 48 },
          { id: 'recent', label: 'Recent', icon: <Icon name="clock" size={15} /> },
        ]}
      />
    </div>
  ),
}

export const Sizes: Story = {
  render: args => (
    <Stack direction="row" gap={8}>
      <div style={{ width: 240 }}>
        <NavList {...args} size="sm" label="Small" />
      </div>
      <div style={{ width: 240 }}>
        <NavList {...args} size="md" label="Medium" />
      </div>
    </Stack>
  ),
}

/**
 * Items with an `href` render as links, so middle-click and "open in new tab"
 * behave — `onChange` still intercepts an ordinary click.
 */
export const Playground: Story = {
  render: args => (
    <div style={{ maxWidth: 264 }}>
      <NavList {...args} />
    </div>
  ),
}
