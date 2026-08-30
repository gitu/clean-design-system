import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type SortDir } from './DataTable'
import { Badge } from '../Badge/Badge'
import { EmptyState } from '../EmptyState/EmptyState'
import { ARTICLES, formatDate, type Article } from '../../stories/fixtures'

const COLUMNS = [
  {
    key: 'id',
    header: 'Reference',
    width: '7.5rem',
    numeric: true,
    align: 'start' as const,
    cell: (row: Article) => <span className="cds-mono">{row.id}</span>,
  },
  {
    key: 'title',
    header: 'Title',
    sortable: true,
    cell: (row: Article) => (
      <a className="cds-link-quiet" href={`#article-${row.id}`}>
        {row.title}
      </a>
    ),
  },
  { key: 'section', header: 'Section', width: '8rem', sortable: true, cell: (row: Article) => row.section },
  { key: 'author', header: 'Author', width: '8rem', hideBelow: 'md' as const, cell: (row: Article) => row.author },
  {
    key: 'published',
    header: 'Published',
    width: '8rem',
    sortable: true,
    cell: (row: Article) => formatDate(row.published),
  },
  { key: 'words', header: 'Words', width: '5.5rem', numeric: true, sortable: true, cell: (row: Article) => row.words.toLocaleString('en-US') },
  {
    key: 'status',
    header: 'Status',
    width: '7rem',
    hideBelow: 'sm' as const,
    cell: (row: Article) => (
      <Badge
        size="sm"
        tone={row.status === 'published' ? 'success' : row.status === 'embargoed' ? 'warning' : 'danger'}
        dot
      >
        {row.status}
      </Badge>
    ),
  },
]

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
  args: { columns: COLUMNS, rows: ARTICLES, rowKey: (row: Article) => row.id },
} satisfies Meta<typeof DataTable<Article>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [sort, setSort] = useState<{ key: string; direction: SortDir }>({
      key: 'published',
      direction: 'desc',
    })
    return (
      <DataTable
        label="Documents"
        columns={COLUMNS}
        rows={ARTICLES}
        rowKey={row => row.id}
        sort={sort}
        onSortChange={(key, direction) => setSort({ key, direction })}
      />
    )
  },
}

export const Selectable: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['A-38199'])
    return (
      <DataTable
        label="Documents"
        columns={COLUMNS}
        rows={ARTICLES}
        rowKey={row => row.id}
        selected={selected}
        onSelectionChange={setSelected}
        activeKey="A-38199"
      />
    )
  },
}

export const Compact: Story = {
  render: () => (
    <DataTable
      label="Documents"
      density="compact"
      columns={COLUMNS}
      rows={[...ARTICLES, ...ARTICLES].map((a, i) => ({ ...a, id: `${a.id}-${i}` }))}
      rowKey={row => row.id}
    />
  ),
}

export const Loading: Story = {
  render: () => (
    <DataTable label="Documents" columns={COLUMNS} rows={[]} rowKey={row => row.id} loading loadingRows={6} />
  ),
}

export const Empty: Story = {
  render: () => (
    <DataTable
      label="Documents"
      columns={COLUMNS}
      rows={[]}
      rowKey={row => row.id}
      empty={<EmptyState size="sm" title="No documents match these filters" description="Try removing the status filter." />}
    />
  ),
}
