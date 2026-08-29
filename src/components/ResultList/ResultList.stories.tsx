import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResultList } from './ResultList'
import { ResultCard } from '../ResultCard/ResultCard'
import { EmptyState } from '../EmptyState/EmptyState'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { ARTICLES, formatDate } from '../../stories/fixtures'

const meta = {
  title: 'Search/ResultList',
  component: ResultList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ResultList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ResultList label="Search results">
        {ARTICLES.map(a => (
          <ResultCard
            key={a.id}
            title={a.title}
            snippet={a.snippet}
            kicker={a.section}
            query="swiss banking"
            href="#"
            meta={[formatDate(a.published), a.author, a.id]}
          />
        ))}
      </ResultList>
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ResultList label="Search results" loading loadingCount={4} />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ResultList
        empty={
          <EmptyState
            icon={<Icon name="search" size={28} />}
            title="Nothing matched “zzzzz”"
            description="The query ran against 4.6 million documents and found no match."
            suggestions={[
              'Check the spelling of unusual names.',
              'Remove one or two filters — three are currently applied.',
              'Widen the date range beyond 2024.',
            ]}
            actions={<Button variant="secondary">Clear all filters</Button>}
          />
        }
      />
    </div>
  ),
}
