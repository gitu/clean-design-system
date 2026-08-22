import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchInput } from './SearchInput'
import { Select } from '../Select/Select'

const meta = {
  title: 'Search/SearchInput',
  component: SearchInput,
  args: { placeholder: 'Search the archive' },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <SearchInput {...args} size="md" />
      <SearchInput {...args} size="lg" />
      <SearchInput {...args} size="xl" placeholder="What are you looking for?" />
    </div>
  ),
}

export const WithValue: Story = {
  render: args => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
      <SearchInput {...args} defaultValue="swiss private banking" />
      <SearchInput {...args} defaultValue="swiss private banking" loading />
    </div>
  ),
}

export const WithShortcut: Story = {
  render: args => (
    <div style={{ maxWidth: 640 }}>
      <SearchInput {...args} shortcut="Cmd+K" />
    </div>
  ),
}

export const WithSubmitAndScope: Story = {
  name: 'With submit and scope',
  render: () => {
    const [query, setQuery] = useState('referendum turnout')
    return (
      <div style={{ maxWidth: 720 }}>
        <SearchInput
          size="lg"
          value={query}
          onValueChange={setQuery}
          submitLabel="Search"
          scope={
            <Select
              bare
              size="sm"
              aria-label="Collection"
              options={[
                { value: 'all', label: 'All' },
                { value: 'archive', label: 'Archive' },
                { value: 'wire', label: 'Wire' },
              ]}
            />
          }
        />
      </div>
    )
  },
}

export const Playground: Story = {
  render: args => <div style={{ maxWidth: 640 }}><SearchInput {...args} /></div>,
}
