import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ActiveFilters,
  AppShell,
  Badge,
  Button,
  CommandPalette,
  DataTable,
  Drawer,
  EmptyState,
  FacetGroup,
  FacetItem,
  Icon,
  IconButton,
  Kbd,
  Pagination,
  Panel,
  RangeFilter,
  ResultCard,
  ResultList,
  ResultMeta,
  SearchInput,
  SegmentedControl,
  SortControl,
  Stack,
  Tabs,
  Toolbar,
  type ActiveFilter,
  type CommandItem,
  type SortDir,
  type TableColumn,
} from '../index'
import {
  ARTICLES,
  AUTHOR_FACETS,
  LANGUAGE_FACETS,
  SECTION_FACETS,
  SORT_OPTIONS,
  formatDate,
  type Article,
} from './fixtures'

const meta = {
  title: 'Patterns/Search application',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COMMANDS: CommandItem[] = [
  { id: 'new', group: 'Actions', label: 'New search', icon: <Icon name="search" size={14} />, shortcut: 'Cmd+N' },
  { id: 'save', group: 'Actions', label: 'Save this search', icon: <Icon name="bookmark" size={14} />, shortcut: 'Cmd+S' },
  { id: 'export', group: 'Actions', label: 'Export results as CSV', icon: <Icon name="document" size={14} /> },
  { id: 'q1', group: 'Saved searches', label: 'Banking consolidation', description: '1,284 results' },
  { id: 'q2', group: 'Saved searches', label: 'Referendum coverage', description: '312 results' },
]

const TABLE_COLUMNS: Array<TableColumn<Article>> = [
  { key: 'id', header: 'Ref', width: '7rem', cell: row => <span className="cds-mono">{row.id}</span> },
  { key: 'title', header: 'Title', sortable: true, cell: row => <a className="cds-link-quiet" href="#">{row.title}</a> },
  { key: 'section', header: 'Section', width: '8rem', sortable: true, cell: row => row.section },
  { key: 'author', header: 'Author', width: '8rem', hideBelow: 'md', cell: row => row.author },
  { key: 'published', header: 'Published', width: '8rem', sortable: true, cell: row => formatDate(row.published) },
  { key: 'words', header: 'Words', width: '5.5rem', numeric: true, sortable: true, cell: row => row.words.toLocaleString('en-US') },
]

function Masthead({ query, onQuery, onCommand }: { query: string; onQuery: (v: string) => void; onCommand: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        height: 'var(--cds-header-height)',
        padding: '0 24px',
        maxWidth: 'var(--cds-content-max)',
        margin: '0 auto',
      }}
    >
      <span
        className="cds-display"
        style={{ fontSize: 21, color: 'var(--cds-color-brand-mark)', letterSpacing: '-0.02em', flex: 'none' }}
      >
        Archiv
      </span>
      <span className="cds-kicker" style={{ flex: 'none' }}>Document search</span>
      <div style={{ flex: 1, maxWidth: 560 }}>
        <SearchInput size="md" value={query} onValueChange={onQuery} shortcut="/" placeholder="Search 4.6 million documents" />
      </div>
      <Stack direction="row" gap={1} align="center">
        <Button size="sm" variant="ghost" onClick={onCommand}>
          Commands <Kbd keys="Cmd+K" size="sm" />
        </Button>
        <IconButton icon={<Icon name="bookmark" />} label="Saved searches" size="sm" />
        <IconButton icon={<Icon name="info" />} label="Query syntax" size="sm" />
      </Stack>
    </div>
  )
}

/**
 * The whole system working together: masthead, faceted sidebar, applied-filter
 * receipt, result list, table view, pagination and a command palette.
 */
export const FullApplication: Story = {
  name: 'Full application',
  render: () => {
    const [query, setQuery] = useState('swiss banking')
    const [view, setView] = useState('list')
    const [page, setPage] = useState(1)
    const [paletteOpen, setPaletteOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const [sort, setSort] = useState<{ key: string; direction: SortDir }>({
      key: 'published',
      direction: 'desc',
    })
    const [filters, setFilters] = useState<ActiveFilter[]>([
      { id: 'section-finance', facet: 'Section', value: 'Finance' },
      { id: 'section-economy', facet: 'Section', value: 'Economy' },
      { id: 'lang-en', facet: 'Language', value: 'English' },
    ])

    const results = useMemo(
      () => (query.trim() ? ARTICLES : []),
      [query]
    )

    const sidebar = (
      <>
        <FacetGroup title="Section" selectedCount={2} onClear={() => {}} maxVisible={6}>
          {SECTION_FACETS.map(f => (
            <FacetItem
              key={f.value}
              label={f.label}
              count={f.count}
              defaultChecked={f.value === 'finance' || f.value === 'economy'}
              onOnly={() => {}}
            />
          ))}
        </FacetGroup>

        <FacetGroup title="Author" searchable maxVisible={5}>
          {AUTHOR_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
          ))}
        </FacetGroup>

        <FacetGroup title="Language" selectedCount={1} onClear={() => {}}>
          {LANGUAGE_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} defaultChecked={f.value === 'en'} />
          ))}
        </FacetGroup>

        <FacetGroup title="Published">
          <RangeFilter
            type="date"
            applyOn="blur"
            defaultValue={{ min: '2020-01-01', max: '' }}
            presets={[
              { label: 'Last 30 days', value: { min: '2024-10-23', max: '' } },
              { label: 'This year', value: { min: '2024-01-01', max: '' } },
            ]}
          />
        </FacetGroup>

        <FacetGroup title="Length">
          <RangeFilter type="number" unit="w" />
        </FacetGroup>
      </>
    )

    return (
      <>
        <AppShell
          header={<Masthead query={query} onQuery={setQuery} onCommand={() => setPaletteOpen(true)} />}
          sidebar={sidebar}
        >
          <Stack gap={0}>
            <Tabs
              size="sm"
              label="Result types"
              items={[
                { value: 'all', label: 'All', count: 4231 },
                { value: 'articles', label: 'Articles', count: 3187 },
                { value: 'images', label: 'Images', count: 742 },
                { value: 'data', label: 'Datasets', count: 288 },
              ]}
            />

            <ActiveFilters
              filters={filters}
              onRemove={id => setFilters(f => f.filter(x => x.id !== id))}
              onClearAll={() => setFilters([])}
            />

            <ResultMeta
              total={results.length ? 4231 : 0}
              from={results.length ? 1 : undefined}
              to={results.length ? 6 : undefined}
              took={82}
              query={query}
              actions={
                <>
                  <SortControl
                    options={SORT_OPTIONS}
                    value={sort.key}
                    direction={sort.direction}
                    onChange={(key, direction) => setSort({ key, direction })}
                  />
                  <SegmentedControl
                    size="sm"
                    label="View"
                    value={view}
                    onChange={setView}
                    options={[
                      { value: 'list', label: 'List' },
                      { value: 'table', label: 'Table' },
                    ]}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<Icon name="filter" size={14} />}
                    onClick={() => setDrawerOpen(true)}
                  >
                    Filters
                  </Button>
                </>
              }
            />

            {results.length === 0 ? (
              <EmptyState
                icon={<Icon name="search" size={28} />}
                title={`Nothing matched “${query}”`}
                description="The query ran against 4.6 million documents and found no match."
                suggestions={[
                  'Check the spelling of unusual names and places.',
                  'Remove one or two of the three filters currently applied.',
                  'Widen the date range beyond 2020.',
                ]}
                actions={<Button variant="primary" onClick={() => setFilters([])}>Clear all filters</Button>}
              />
            ) : view === 'list' ? (
              <>
                <ResultList label="Search results">
                  {results.map(a => (
                    <ResultCard
                      key={a.id}
                      title={a.title}
                      snippet={a.snippet}
                      kicker={a.section}
                      query={query}
                      href="#"
                      meta={[formatDate(a.published), a.author, `${a.words.toLocaleString('en-US')} words`, a.id]}
                      tags={
                        a.status !== 'published' ? (
                          <Badge size="sm" tone={a.status === 'embargoed' ? 'warning' : 'danger'} dot>
                            {a.status}
                          </Badge>
                        ) : undefined
                      }
                      trailing={
                        <span className="cds-numeric" style={{ fontSize: 12, color: 'var(--cds-color-text-subtle)' }}>
                          {a.score.toFixed(2)}
                        </span>
                      }
                    />
                  ))}
                </ResultList>
                <Pagination page={page} pageCount={212} onChange={setPage} />
              </>
            ) : (
              <>
                {selected.length > 0 && (
                  <Toolbar
                    border="bottom"
                    size="sm"
                    label="Bulk actions"
                    end={
                      <IconButton
                        icon={<Icon name="close" />}
                        label="Cancel selection"
                        size="sm"
                        onClick={() => setSelected([])}
                      />
                    }
                  >
                    <span className="cds-ui-sm cds-numeric">{selected.length} selected</span>
                    <Button size="sm" variant="secondary">Export</Button>
                    <Button size="sm" variant="secondary">Add to collection</Button>
                  </Toolbar>
                )}
                <DataTable
                  label="Documents"
                  columns={TABLE_COLUMNS}
                  rows={results}
                  rowKey={row => row.id}
                  sort={sort}
                  onSortChange={(key, direction) => setSort({ key, direction })}
                  selected={selected}
                  onSelectionChange={setSelected}
                />
                <Pagination page={page} pageCount={212} onChange={setPage} />
              </>
            )}
          </Stack>
        </AppShell>

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          items={COMMANDS}
          hotkey="mod+k"
        />

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filters"
          description="4,231 results match the current query"
          footer={
            <>
              <Button variant="ghost" onClick={() => setFilters([])}>Clear all</Button>
              <Button variant="primary" onClick={() => setDrawerOpen(false)}>Apply</Button>
            </>
          }
        >
          {sidebar}
        </Drawer>
      </>
    )
  },
}

/** The landing screen, before anyone has searched for anything. */
export const LandingScreen: Story = {
  name: 'Landing screen',
  render: () => (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cds-color-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Stack gap={6} style={{ width: '100%', maxWidth: 640 }}>
        <Stack gap={2}>
          <span className="cds-display" style={{ color: 'var(--cds-color-brand-mark)' }}>Archiv</span>
          <div style={{ height: 3, background: 'var(--cds-color-accent)', width: 64 }} />
          <p className="cds-lede" style={{ marginTop: 8 }}>
            4.6 million documents from 1780 to today. Start with a name, a place or a phrase.
          </p>
        </Stack>

        <SearchInput size="xl" placeholder="What are you looking for?" submitLabel="Search" />

        <Panel variant="sunken" padding="md" title="Recent searches">
          <Stack gap={2}>
            {['swiss private banking', 'referendum turnout 2024', 'alpine rail freight'].map(q => (
              <a key={q} className="cds-link cds-ui-sm" href="#">{q}</a>
            ))}
          </Stack>
        </Panel>
      </Stack>
    </div>
  ),
}
