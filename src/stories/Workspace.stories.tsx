import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  Divider,
  Drawer,
  EmptyState,
  Icon,
  IconButton,
  Input,
  Field,
  NavList,
  Panel,
  Progress,
  Sparkline,
  Stack,
  Switch,
  Toolbar,
  type NavItem,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { ARTICLES, CRAWL_JOBS, formatDate, type Article, type CrawlJob } from './fixtures'

const meta = {
  title: 'Patterns/Workspace',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The top level — the products inside the workspace. */
const AREAS: NavItem[] = [
  { id: 'library', label: 'Library' },
  { id: 'ingest', label: 'Ingest' },
  { id: 'settings', label: 'Settings' },
]

/** The pages inside each area. `group` sections the sidebar. */
const PAGES: Record<string, NavItem[]> = {
  library: [
    { id: 'library/all', label: 'All documents', group: 'Browse', count: 359065, href: '#' },
    { id: 'library/recent', label: 'Recently added', group: 'Browse', count: 1284, href: '#' },
    { id: 'library/saved', label: 'Saved searches', group: 'Browse', count: 12, href: '#' },
    { id: 'library/collections', label: 'Collections', group: 'Curation', count: 7, href: '#' },
    { id: 'library/embargoed', label: 'Embargoed', group: 'Curation', count: 3, href: '#' },
    { id: 'library/trash', label: 'Trash', group: 'Curation', count: 0, href: '#' },
  ],
  ingest: [
    { id: 'ingest/jobs', label: 'Crawl jobs', group: 'Pipeline', count: 6, href: '#' },
    { id: 'ingest/sources', label: 'Sources', group: 'Pipeline', count: 6, href: '#' },
    { id: 'ingest/schedule', label: 'Schedule', group: 'Pipeline', href: '#' },
    { id: 'ingest/errors', label: 'Errors', group: 'Health', count: 1, href: '#' },
  ],
  settings: [
    { id: 'settings/general', label: 'General', group: 'Workspace', href: '#' },
    { id: 'settings/members', label: 'Members', group: 'Workspace', count: 14, href: '#' },
    { id: 'settings/tokens', label: 'API tokens', group: 'Access', count: 3, href: '#' },
    { id: 'settings/audit', label: 'Audit log', group: 'Access', href: '#' },
    { id: 'settings/billing', label: 'Billing', group: 'Access', href: '#', disabled: true },
  ],
}

const TITLES: Record<string, string> = Object.fromEntries(
  Object.values(PAGES)
    .flat()
    .map(page => [page.id, typeof page.label === 'string' ? page.label : page.id])
)

/**
 * Several pages, two levels of navigation, and one burger.
 *
 * The two navs answer different questions and so look different: the header
 * bar is *which product*, the sidebar is *which page inside it*. Below 860px
 * `AppShell` drops the sidebar on its own, so both fold into a `Drawer` behind
 * a single menu button rather than being stacked on top of the content. The
 * burger appears at exactly that width, so it never sits beside the sidebar it
 * would open.
 */
export const MultiPage: Story = {
  name: 'Multi-page with navigation',
  render: () => {
    const [area, setArea] = useState('library')
    const [page, setPage] = useState('library/all')
    const [menuOpen, setMenuOpen] = useState(false)

    const pages = PAGES[area] ?? []

    const goToArea = (next: string) => {
      setArea(next)
      // Landing on an area means landing on its first page.
      const first = PAGES[next]?.[0]
      if (first) setPage(first.id)
      setMenuOpen(false)
    }

    const goToPage = (next: string) => {
      setPage(next)
      setMenuOpen(false)
    }

    const sidebar = (
      <Stack gap={5} style={{ padding: 'var(--cds-space-4)' }}>
        <NavList
          items={pages}
          value={page}
          onChange={goToPage}
          label={`${area} pages`}
          size="sm"
        />
        <div>
          <Divider label="Storage" />
          <Stack gap={2} style={{ paddingTop: 'var(--cds-space-3)' }}>
            <Progress label="Used" value={62} showLabel valueLabel="6.2 of 10 GB" size="sm" />
          </Stack>
        </div>
      </Stack>
    )

    return (
      <AppShell
        header={
          <Stack gap={0}>
            <Masthead
              section="Workspace"
              actions={
                <>
                  <Button variant="secondary" size="sm">
                    Invite
                  </Button>
                  {/* The burger. Hidden above the width at which AppShell keeps
                      the sidebar, so it never sits beside the thing it opens. */}
                  <span className="sb-burger">
                    <IconButton
                      icon={<Icon name="menu" size={16} />}
                      label="Open navigation"
                      variant="secondary"
                      size="sm"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen(true)}
                    />
                  </span>
                </>
              }
            >
              {/* The primary nav sits in the masthead on a wide screen and
                  moves into the drawer on a narrow one. */}
              <span className="sb-primary-nav">
                <NavList
                  items={AREAS}
                  value={area}
                  onChange={goToArea}
                  orientation="horizontal"
                  label="Areas"
                  size="sm"
                />
              </span>
            </Masthead>
          </Stack>
        }
        sidebar={sidebar}
        sidebarWidth="17rem"
        maxWidth="1440px"
      >
        <Stack gap={5} className="sb-page">
          <Breadcrumbs
            items={[
              { label: AREAS.find(a => a.id === area)?.label ?? area, onClick: () => {} },
              { label: TITLES[page] ?? page },
            ]}
          />
          <PageBody page={page} />
        </Stack>

        {/* Narrow screens: both navs, in one drawer, behind one button. */}
        <Drawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title="Navigation"
          side="start"
          size="sm"
        >
          <Stack gap={5}>
            <NavList items={AREAS} value={area} onChange={goToArea} label="Areas" />
            <Divider />
            <NavList items={pages} value={page} onChange={goToPage} label="Pages" size="sm" />
          </Stack>
        </Drawer>
      </AppShell>
    )
  },
}

function PageBody({ page }: { page: string }) {
  if (page === 'library/all' || page === 'library/recent') {
    const columns: TableColumn<Article>[] = [
      { key: 'id', header: 'Reference', width: '7rem', numeric: true, align: 'start', cell: row => <span className="cds-mono">{row.id}</span> },
      { key: 'title', header: 'Title', cell: row => <a className="cds-link-quiet" href={`#${row.id}`}>{row.title}</a> },
      { key: 'section', header: 'Section', width: '8rem', hideBelow: 'sm', cell: row => row.section },
      { key: 'published', header: 'Published', width: '8rem', hideBelow: 'md', cell: row => formatDate(row.published) },
    ]
    return (
      <Stack gap={4}>
        <Toolbar end={<Button variant="secondary" size="sm">Export</Button>}>
          <span className="cds-kicker">{TITLES[page]}</span>
        </Toolbar>
        <DataTable columns={columns} rows={ARTICLES} rowKey={row => row.id} label={TITLES[page] ?? 'Documents'} density="compact" />
      </Stack>
    )
  }

  if (page === 'ingest/jobs') {
    const columns: TableColumn<CrawlJob>[] = [
      { key: 'id', header: 'Job', width: '6.5rem', numeric: true, align: 'start', cell: row => <span className="cds-mono">{row.id}</span> },
      { key: 'source', header: 'Source', cell: row => row.source },
      { key: 'status', header: 'Status', width: '6.5rem', cell: row => <Badge tone={row.status === 'failed' ? 'danger' : row.status === 'done' ? 'success' : 'info'} size="sm">{row.status}</Badge> },
      { key: 'trend', header: 'Throughput', width: '7rem', hideBelow: 'md', cell: row => <Sparkline data={row.throughput} value={n => n} label={`${row.source} throughput`} /> },
    ]
    return <DataTable columns={columns} rows={CRAWL_JOBS} rowKey={row => row.id} label="Crawl jobs" density="compact" />
  }

  if (page === 'settings/general') {
    return (
      <Panel title="Workspace" description="Visible to everyone with access." variant="ruled" padding="lg">
        <Stack gap={5} style={{ maxWidth: '32rem' }}>
          <Field label="Name" hint="Shown in the masthead and on shared links.">
            <Input defaultValue="Archiv" />
          </Field>
          <Field label="Default language">
            <Input defaultValue="German" />
          </Field>
          <Switch defaultChecked label="Index new sources automatically" />
          <Switch label="Require review before publishing" />
        </Stack>
      </Panel>
    )
  }

  if (page === 'library/trash') {
    return <EmptyState title="Trash is empty" description="Documents you delete rest here for 30 days." />
  }

  return (
    <EmptyState
      title={TITLES[page] ?? 'Page'}
      description="This page is a placeholder — the point of the story is the navigation around it."
    />
  )
}

/**
 * The same screen at 390 x 844, in an iframe so the breakpoints actually fire.
 *
 * Shrinking a container would not do it: every responsive rule in this system
 * is a `@media (max-width: ...)` query, and those ask the viewport, not the
 * element — so a narrow `<div>` would still get the desktop layout rendered
 * inside it. An iframe has its own viewport.
 */
export const Mobile: Story = {
  parameters: {
    layout: 'padded',
    // The frame is a scaled-down copy of another story; running axe over it
    // would double-report that story's own results.
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-workspace--multi-page"
      theme={String(context.globals.theme ?? 'light')}
      caption="Multi-page with navigation at 390 x 844"
    />
  ),
}
