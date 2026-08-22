import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FacetGroup } from './FacetGroup'
import { FacetItem } from '../FacetItem/FacetItem'
import { SECTION_FACETS, AUTHOR_FACETS, LANGUAGE_FACETS } from '../../stories/fixtures'

const meta = {
  title: 'Search/FacetGroup',
  component: FacetGroup,
  parameters: { layout: 'padded' },
  args: { title: 'Section', children: null },
} satisfies Meta<typeof FacetGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 264 }}>
      <FacetGroup title="Section" selectedCount={2} onClear={() => {}}>
        {SECTION_FACETS.slice(0, 5).map(f => (
          <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
        ))}
      </FacetGroup>
    </div>
  ),
}

export const Sidebar: Story = {
  render: () => {
    const [filter, setFilter] = useState('')
    const authors = AUTHOR_FACETS.filter(a =>
      a.label.toLowerCase().includes(filter.toLowerCase())
    )
    return (
      <div style={{ maxWidth: 264 }}>
        <FacetGroup title="Section" selectedCount={2} onClear={() => {}} maxVisible={5}>
          {SECTION_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
          ))}
        </FacetGroup>

        <FacetGroup title="Author" searchable onSearchChange={setFilter} maxVisible={4}>
          {authors.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
          ))}
        </FacetGroup>

        <FacetGroup title="Language" defaultOpen={false}>
          {LANGUAGE_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} />
          ))}
        </FacetGroup>
      </div>
    )
  },
}

export const Collapsed: Story = {
  render: () => (
    <div style={{ maxWidth: 264 }}>
      <FacetGroup title="Section" defaultOpen={false} selectedCount={3} onClear={() => {}}>
        {SECTION_FACETS.slice(0, 3).map(f => (
          <FacetItem key={f.value} label={f.label} count={f.count} />
        ))}
      </FacetGroup>
    </div>
  ),
}
