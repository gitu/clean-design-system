import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SortControl, type SortDirection } from './SortControl'
import { SORT_OPTIONS } from '../../stories/fixtures'

const meta = {
  title: 'Search/SortControl',
  component: SortControl,
  args: { options: SORT_OPTIONS, value: 'relevance', onChange: () => {} },
} satisfies Meta<typeof SortControl>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('published')
    const [direction, setDirection] = useState<SortDirection>('desc')
    return (
      <SortControl
        options={SORT_OPTIONS}
        value={value}
        direction={direction}
        onChange={(next, dir) => {
          setValue(next)
          setDirection(dir)
        }}
      />
    )
  },
}

export const RelevanceHasNoDirection: Story = {
  name: 'Relevance has no direction',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <SortControl options={SORT_OPTIONS} value="relevance" onChange={() => {}} />
      <SortControl options={SORT_OPTIONS} value="published" onChange={() => {}} />
    </div>
  ),
}

export const Playground: Story = {}
