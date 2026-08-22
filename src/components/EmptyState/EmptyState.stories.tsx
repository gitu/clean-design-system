import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Data/EmptyState',
  component: EmptyState,
  args: { title: 'No results' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const NoResults: Story = {
  args: {
    icon: <Icon name="search" size={28} />,
    title: 'Nothing matched “interest rate swaps”',
    description: 'The query ran against 4.6 million documents in 0.21 seconds and found no match.',
    suggestions: [
      'Check the spelling of unusual names and places.',
      'Remove one or two of the five filters currently applied.',
      'Widen the date range — it is currently limited to 2024.',
    ],
    actions: (
      <>
        <Button variant="primary">Clear all filters</Button>
        <Button variant="ghost">Search everything</Button>
      </>
    ),
  },
}

export const FirstRun: Story = {
  args: {
    title: 'Search the archive',
    description: '4.6 million documents from 1780 to today. Start with a name, a place or a phrase.',
    actions: <Button variant="secondary" iconStart={<Icon name="info" />}>Query syntax</Button>,
  },
}

export const Small: Story = {
  args: { size: 'sm', title: 'No saved searches yet', description: 'Save a search to return to it later.' },
}

export const Playground: Story = {}
