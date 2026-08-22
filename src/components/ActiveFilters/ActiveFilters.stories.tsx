import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActiveFilters, type ActiveFilter } from './ActiveFilters'

const FILTERS: ActiveFilter[] = [
  { id: 'section-finance', facet: 'Section', value: 'Finance' },
  { id: 'section-economy', facet: 'Section', value: 'Economy' },
  { id: 'author-brunner', facet: 'Author', value: 'M. Brunner' },
  { id: 'lang-en', facet: 'Language', value: 'English' },
  { id: 'year', facet: 'Published', value: '2020 – 2024' },
]

const meta = {
  title: 'Search/ActiveFilters',
  component: ActiveFilters,
  args: { filters: FILTERS },
} satisfies Meta<typeof ActiveFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => {
    const [filters, setFilters] = useState(FILTERS)
    return (
      <ActiveFilters
        filters={filters}
        onRemove={id => setFilters(f => f.filter(x => x.id !== id))}
        onClearAll={() => setFilters([])}
      />
    )
  },
}

export const Overflowing: Story = {
  args: { maxVisible: 3, onRemove: () => {}, onClearAll: () => {} },
}

export const WithoutFacetNames: Story = {
  args: {
    filters: [
      { id: '1', value: 'banking' },
      { id: '2', value: 'referendum' },
      { id: '3', value: 'zurich' },
    ],
    label: 'Terms',
    onRemove: () => {},
  },
}

export const Playground: Story = { args: { onRemove: () => {}, onClearAll: () => {} } }
