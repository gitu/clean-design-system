import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResultCard } from './ResultCard'
import { Badge } from '../Badge/Badge'
import { Checkbox } from '../Checkbox/Checkbox'
import { ARTICLES, formatDate } from '../../stories/fixtures'

const article = ARTICLES[0]!

const meta = {
  title: 'Search/ResultCard',
  component: ResultCard,
  args: {
    title: article.title,
    snippet: article.snippet,
    kicker: article.section,
    query: 'swiss banking',
    href: '#',
    meta: [formatDate(article.published), article.author, `${article.words} words`, article.id],
  },
} satisfies Meta<typeof ResultCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <div style={{ maxWidth: 720 }}><ResultCard {...args} /></div>,
}

export const WithTagsAndScore: Story = {
  render: args => (
    <div style={{ maxWidth: 720 }}>
      <ResultCard
        {...args}
        tags={
          <>
            <Badge tone="success" size="sm">Indexed</Badge>
            <Badge tone="neutral" size="sm">EN</Badge>
          </>
        }
        trailing={
          <span className="cds-numeric cds-text-subtle" style={{ fontSize: 12 }}>
            0.97
          </span>
        }
      />
    </div>
  ),
}

export const Selectable: Story = {
  render: args => (
    <div style={{ maxWidth: 720 }}>
      <ResultCard {...args} selected leading={<Checkbox size="sm" defaultChecked aria-label="Select result" />} />
    </div>
  ),
}

export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      {ARTICLES.slice(0, 4).map(a => (
        <ResultCard
          key={a.id}
          density="compact"
          title={a.title}
          snippet={a.snippet}
          kicker={a.section}
          query="swiss banking"
          href="#"
          meta={[formatDate(a.published), a.author]}
        />
      ))}
    </div>
  ),
}

export const Minimal: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ResultCard title="quarterly-report-2024-q3.pdf" meta={['2.4 MB', 'PDF', 'Uploaded 12 Nov 2024']} href="#" />
    </div>
  ),
}

export const Playground: Story = {
  render: args => <div style={{ maxWidth: 720 }}><ResultCard {...args} /></div>,
}
