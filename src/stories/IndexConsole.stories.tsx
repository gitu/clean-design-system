import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  AreaChart,
  BarChart,
  Badge,
  Button,
  ChartFrame,
  ChartLegend,
  DataTable,
  Divider,
  Drawer,
  EmptyState,
  Icon,
  Panel,
  Progress,
  Sparkline,
  Stack,
  Tabs,
  Toolbar,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { CRAWL_JOBS, INGEST_DAYS, type CrawlJob, type IngestDay } from './fixtures'

const meta = {
  title: 'Patterns/Index console',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const STATUS_TONE = {
  running: 'info',
  queued: 'neutral',
  done: 'success',
  failed: 'danger',
} as const

const INGEST_SERIES = [
  { key: 'indexed', label: 'Indexed', value: (d: IngestDay) => d.indexed },
  { key: 'updated', label: 'Updated', value: (d: IngestDay) => d.updated },
  { key: 'deleted', label: 'Deleted', value: (d: IngestDay) => d.deleted },
]

const time = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * The operational side of a search product: what is being ingested, what is
 * stuck, and what broke.
 *
 * This is the screen that pushed `Progress` into the system — a crawl job is
 * the canonical case for a determinate bar, and "queued" is the canonical case
 * for an indeterminate one.
 */
export const Console: Story = {
  name: 'Console',
  render: () => {
    const [tab, setTab] = useState('jobs')
    const [openJob, setOpenJob] = useState<CrawlJob | null>(null)
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([])

    const running = useMemo(() => CRAWL_JOBS.filter(j => j.status === 'running'), [])
    const failed = useMemo(() => CRAWL_JOBS.filter(j => j.status === 'failed'), [])
    const totalDocs = CRAWL_JOBS.reduce((sum, j) => sum + j.documents, 0)

    const columns: Array<TableColumn<CrawlJob>> = [
      {
        key: 'id',
        header: 'Job',
        width: '6.5rem',
        numeric: true,
        align: 'start',
        cell: row => <span className="cds-mono">{row.id}</span>,
      },
      { key: 'source', header: 'Source', cell: row => row.source },
      {
        key: 'status',
        header: 'Status',
        width: '7rem',
        cell: row => (
          <Badge tone={STATUS_TONE[row.status]} size="sm">
            {row.status}
          </Badge>
        ),
      },
      {
        key: 'progress',
        header: 'Progress',
        width: '10rem',
        cell: row =>
          row.status === 'queued' ? (
            <Progress label={`${row.source} queued`} size="sm" />
          ) : (
            <Progress
              label={`${row.source} progress`}
              value={row.progress}
              size="sm"
              tone={row.status === 'failed' ? 'danger' : row.status === 'done' ? 'success' : 'accent'}
            />
          ),
      },
      {
        key: 'documents',
        header: 'Documents',
        width: '7rem',
        align: 'end',
        numeric: true,
        sortable: true,
        cell: row => row.documents.toLocaleString('en-US'),
      },
      {
        key: 'throughput',
        header: 'Throughput',
        width: '7rem',
        hideBelow: 'md',
        cell: row => (
          <Sparkline
            data={row.throughput}
            value={n => n}
            label={`${row.source} throughput`}
            color={row.status === 'failed' ? 'var(--cds-color-danger)' : undefined}
          />
        ),
      },
      {
        key: 'started',
        header: 'Started',
        width: '6rem',
        numeric: true,
        align: 'end',
        hideBelow: 'lg',
        cell: row => time.format(new Date(row.started)),
      },
    ]

    return (
      <AppShell
        header={
          <Masthead
            section="Index console"
            actions={
              <>
                <Button variant="secondary" size="sm">
                  <Icon name="refresh" size={13} /> Reindex
                </Button>
                <Button variant="primary" size="sm">
                  Add source
                </Button>
              </>
            }
          />
        }
        sidebarHidden
        maxWidth="1280px"
      >
        <Stack gap={6} className="sb-page">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              gap: 'var(--cds-space-4)',
            }}
          >
            <Panel variant="ruled" padding="md">
              <Stack gap={1}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Documents indexed
                </span>
                <span className="cds-title cds-numeric">{totalDocs.toLocaleString('en-US')}</span>
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={2}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Jobs running
                </span>
                <span className="cds-title cds-numeric">{running.length}</span>
                <Progress label="Overall crawl progress" value={75} size="sm" />
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={1}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Failed today
                </span>
                <span
                  className="cds-title cds-numeric"
                  style={{ color: failed.length ? 'var(--cds-color-danger)' : undefined }}
                >
                  {failed.length}
                </span>
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={2}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Next scheduled
                </span>
                <span className="cds-title">03:00 UTC</span>
                <Progress label="Time until next crawl" size="sm" tone="warning" />
              </Stack>
            </Panel>
          </div>

          <Tabs
            items={[
              { value: 'jobs', label: 'Jobs', count: CRAWL_JOBS.length },
              { value: 'throughput', label: 'Throughput' },
              { value: 'errors', label: 'Errors', count: failed.length },
            ]}
            value={tab}
            onChange={setTab}
          >
            {tab === 'jobs' && (
              <Stack gap={4} style={{ marginTop: 'var(--cds-space-4)' }}>
                <Toolbar end={<span className="cds-body-sm">Click a row for detail</span>}>
                  <span className="cds-kicker">Crawl jobs</span>
                </Toolbar>
                <DataTable
                  columns={columns}
                  rows={CRAWL_JOBS}
                  rowKey={row => row.id}
                  label="Crawl jobs"
                  density="compact"
                  onRowClick={row => setOpenJob(row)}
                  activeKey={openJob?.id}
                />
              </Stack>
            )}

            {tab === 'throughput' && (
              <div
                style={{
                  marginTop: 'var(--cds-space-4)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 'var(--cds-space-6)',
                }}
              >
                <ChartFrame
                  title="Ingest by operation"
                  description="Documents per day, last eight days"
                  legend={
                    <ChartLegend
                      items={INGEST_SERIES.map((s, i) => ({
                        key: s.key,
                        label: s.label,
                        color: `var(--cds-color-series-${i + 1})`,
                      }))}
                      hiddenKeys={hiddenSeries}
                      onHiddenChange={setHiddenSeries}
                      swatch="square"
                    />
                  }
                  footnote="Weekend dip is expected — most sources publish on weekdays"
                >
                  <AreaChart
                    label="Ingest by operation"
                    data={INGEST_DAYS}
                    x={d => new Date(d.day)}
                    datumKey={d => d.day}
                    series={INGEST_SERIES}
                    hiddenSeries={hiddenSeries}
                    onHiddenSeriesChange={setHiddenSeries}
                    height={240}
                  />
                </ChartFrame>

                <ChartFrame title="Documents by source" description="Total in the index">
                  <BarChart
                    label="Documents by source"
                    data={CRAWL_JOBS}
                    x={j => j.source}
                    datumKey={j => j.id}
                    series={[{ key: 'documents', label: 'Documents', value: j => j.documents }]}
                    layout="horizontal"
                    height={240}
                    valueLabels
                  />
                </ChartFrame>
              </div>
            )}

            {tab === 'errors' && (
              <div style={{ marginTop: 'var(--cds-space-4)' }}>
                {failed.length === 0 ? (
                  <EmptyState title="Nothing failed today" description="The last error was six days ago." />
                ) : (
                  <Stack gap={4} dividers>
                    {failed.map(job => (
                      <div key={job.id} style={{ paddingTop: 'var(--cds-space-3)' }}>
                        <Stack gap={2}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-3)' }}>
                            <Badge tone="danger" size="sm">
                              failed
                            </Badge>
                            <span className="cds-mono" style={{ fontSize: 12 }}>
                              {job.id}
                            </span>
                            <span className="cds-body-sm">{job.source}</span>
                          </div>
                          <p className="cds-body">{job.error}</p>
                          <div style={{ display: 'flex', gap: 'var(--cds-space-2)' }}>
                            <Button variant="secondary" size="sm">
                              Retry
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setOpenJob(job)}>
                              Open job
                            </Button>
                          </div>
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                )}
              </div>
            )}
          </Tabs>
        </Stack>

        <Drawer
          open={openJob !== null}
          onClose={() => setOpenJob(null)}
          title={openJob ? `${openJob.source}` : ''}
          description={openJob ? `Job ${openJob.id}` : undefined}
          size="md"
          footer={
            <div style={{ display: 'flex', gap: 'var(--cds-space-2)' }}>
              <Button variant="secondary" size="sm">
                Pause
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setOpenJob(null)}>
                Close
              </Button>
            </div>
          }
        >
          {openJob && (
            <Stack gap={5}>
              <Progress
                label="Crawl progress"
                showLabel
                value={openJob.status === 'queued' ? undefined : openJob.progress}
                tone={openJob.status === 'failed' ? 'danger' : 'accent'}
              />
              <div>
                <Divider label="Throughput" />
                <div style={{ marginTop: 'var(--cds-space-3)' }}>
                  <BarChart
                    label={`${openJob.source} throughput per hour`}
                    data={openJob.throughput.map((value, hour) => ({ hour: `${hour}h`, value }))}
                    x={d => d.hour}
                    series={[{ key: 'value', label: 'Documents', value: d => d.value }]}
                    height={160}
                    animate={false}
                  />
                </div>
              </div>
              {openJob.error && (
                <Panel variant="sunken" padding="sm" title="Last error">
                  <p className="cds-body-sm">{openJob.error}</p>
                </Panel>
              )}
            </Stack>
          )}
        </Drawer>
      </AppShell>
    )
  },
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
  name: 'Mobile',
  parameters: {
    layout: 'padded',
    // The frame is a scaled-down copy of another story; running axe over it
    // would double-report that story's own results.
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-index-console--console"
      theme={String(context.globals.theme ?? 'light')}
      caption="Console at 390 x 844"
    />
  ),
}
