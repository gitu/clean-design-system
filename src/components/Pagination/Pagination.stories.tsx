import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination } from './Pagination'

const meta = {
  title: 'Search/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 12, onChange: () => {} },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(6)
    return <Pagination page={page} pageCount={212} onChange={setPage} />
  },
}

export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Each is a nav landmark, so each needs its own name to stay
          distinguishable in a landmarks list. */}
      <Pagination page={1} pageCount={212} onChange={() => {}} label="First page" />
      <Pagination page={7} pageCount={212} onChange={() => {}} label="Middle pages" />
      <Pagination page={212} pageCount={212} onChange={() => {}} label="Last page" />
      <Pagination page={3} pageCount={5} onChange={() => {}} label="Few pages" />
    </div>
  ),
}

export const Compact: Story = {
  args: { page: 4, pageCount: 40, compact: true, size: 'sm' },
}

export const Playground: Story = {}
