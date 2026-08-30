import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  AreaChart,
  BarChart,
  Badge,
  Breadcrumbs,
  Button,
  ChartFrame,
  ChartGroup,
  ChartLegend,
  DataTable,
  Divider,
  Icon,
  LineChart,
  Panel,
  SegmentedControl,
  Sparkline,
  Stack,
  Tabs,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { QUERY_WEEKS, TOP_QUERIES, type QueryWeek, type TopQuery } from './fixtures'

const meta = {
  title: 'Patterns/Search analytics',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SCOPE_SERIES = [
  { key: 'articles', label: 'Articles', value: (w: QueryWeek) => w.articles },
  { key: 'images', label: 'Images', value: (w: QueryWeek) => w.images },
  { key: 'datasets', label: 'Datasets', value: (w: QueryWeek) => w.datasets },
]

/** `Array.prototype.at` is ES2022; this package targets ES2020. */
const last = <T,>(items: T[]): T | undefined => items[items.length - 1]

const RANGES = [
  { value: '28', label: '28 weeks' },
  { value: '12', label: '12 weeks' },
  { value: '4', label: '4 weeks' },
]

/** A stat tile: the number, the change, and the shape behind it. */
function Stat({
  label,
  value,
  delta,
  trend,
  slot,
  invert,
}: {
  label: string
  value: string
  delta: number
  trend: number[]
  slot: number
  /** For rates where down is good. */
  invert?: boolean
}) {
  const good = invert ? delta < 0 : delta > 0
  return (
    <Panel variant="ruled" padding="md">
      <Stack gap={2}>
        <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
          {label}
        </span>
        <span className="cds-title cds-numeric" style={{ lineHeight: 1.1 }}>
          {value}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span
            className="cds-body-sm cds-numeric"
            style={{ color: good ? 'var(--cds-color-success)' : 'var(--cds-color-danger)' }}
          >
            <Icon name={delta > 0 ? 'arrow-up' : 'arrow-down'} size={12} />{' '}
            {Math.abs(delta).toFixed(1)}%
          </span>
          <Sparkline
            data={trend}
            value={n => n}
            label={`${label}, trend`}
            summary={`${good ? 'improving' : 'worsening'} by ${Math.abs(delta).toFixed(1)} per cent`}
            color={`var(--cds-color-series-${slot})`}
            kind="area"
            endpoint
          />
        </div>
      </Stack>
    </Panel>
  )
}

/**
 * The whole chart family working as one screen: linked hover, click-to-filter
 * that reaches a table, legend toggling, drill-down and a brushed time series.
 *
 * This story is the acceptance test for `ChartGroup`. Wiring the bar chart to
 * the table below it is four lines — `selected` and `onSelectionChange` on the
 * group, and a `filter` over the rows. If it ever needs more than that, the
 * contract is wrong.
 */
export const Dashboard: Story = {
  render: () => {
    const [range, setRange] = useState('28')
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([])
    const [selectedQueries, setSelectedQueries] = useState<string[]>([])
    const [hoverKey, setHoverKey] = useState<string | null>(null)
    const [drill, setDrill] = useState<string | null>(null)
    const [tab, setTab] = useState('volume')

    const weeks = useMemo(() => QUERY_WEEKS.slice(-Number(range)), [range])

    // Cross-filtering, in full. The bar chart writes into `selectedQueries`
    // through the group; the table reads the same array.
    const queries = useMemo(
      () =>
        selectedQueries.length === 0
          ? TOP_QUERIES
          : TOP_QUERIES.filter(q => selectedQueries.includes(q.query)),
      [selectedQueries]
    )

    const hovered = hoverKey ? weeks.find(w => w.week === hoverKey) : undefined

    const columns: TableColumn<TopQuery>[] = [
      { key: 'query', header: 'Query', cell: row => <span className="cds-mono">{row.query}</span> },
      {
        key: 'searches',
        header: 'Searches',
        align: 'end',
        numeric: true,
        sortable: true,
        cell: row => row.searches.toLocaleString('en-US'),
      },
      {
        key: 'zero',
        header: 'Zero-result',
        align: 'end',
        numeric: true,
        cell: row => (
          <span style={{ color: row.zeroRate > 10 ? 'var(--cds-color-danger)' : undefined }}>
            {row.zeroRate.toFixed(1)}%
          </span>
        ),
      },
      {
        key: 'ctr',
        header: 'Click-through',
        align: 'end',
        numeric: true,
        hideBelow: 'md',
        cell: row => `${row.clickThrough.toFixed(1)}%`,
      },
      {
        key: 'trend',
        header: '7 weeks',
        width: '8rem',
        cell: row => (
          <Sparkline data={row.trend} value={n => n} label={`${row.query}, seven-week trend`} />
        ),
      },
    ]

    return (
      <AppShell
        header={
          <Masthead
            section="Search analytics"
            actions={
              <>
                <SegmentedControl options={RANGES} value={range} onChange={setRange} size="sm" />
                <Button variant="secondary" size="sm">
                  <Icon name="external" size={13} /> Export
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
            <Stat
              label="Searches"
              value={(last(weeks)?.searches ?? 0).toLocaleString('en-US')}
              delta={12.4}
              trend={weeks.map(w => w.searches)}
              slot={1}
            />
            <Stat
              label="Zero-result rate"
              value={`${last(weeks)?.zeroResults ?? 0}%`}
              delta={-2.1}
              trend={weeks.map(w => w.zeroResults)}
              slot={2}
              invert
            />
            <Stat
              label="p95 latency"
              value={`${last(weeks)?.latencyP95 ?? 0} ms`}
              delta={-8.6}
              trend={weeks.map(w => w.latencyP95 ?? 0)}
              slot={3}
              invert
            />
            <Stat
              label="Click-through"
              value={`${last(weeks)?.clickThrough ?? 0}%`}
              delta={5.2}
              trend={weeks.map(w => w.clickThrough)}
              slot={4}
            />
          </div>

          <ChartGroup
            columns={2}
            hoverKey={hoverKey}
            onHoverChange={setHoverKey}
            hiddenSeries={hiddenSeries}
            onHiddenSeriesChange={setHiddenSeries}
            selected={selectedQueries}
            onSelectionChange={setSelectedQueries}
            selectionMode="toggle"
          >
            <ChartFrame
              title="Searches by scope"
              description="Weekly, all sources"
              legend={
                <ChartLegend
                  items={SCOPE_SERIES.map((s, i) => ({
                    key: s.key,
                    label: s.label,
                    color: `var(--cds-color-series-${i + 1})`,
                    value: hovered ? s.value(hovered).toLocaleString('en-US') : undefined,
                  }))}
                  hiddenKeys={hiddenSeries}
                  onHiddenChange={setHiddenSeries}
                />
              }
              footnote="Source: query log, sampled at 100%"
            >
              <Tabs
                items={[
                  { value: 'volume', label: 'Volume' },
                  { value: 'share', label: 'Share' },
                ]}
                value={tab}
                onChange={setTab}
                size="sm"
              >
                <AreaChart
                  label="Searches by scope"
                  data={weeks}
                  x={w => new Date(w.week)}
                  datumKey={w => w.week}
                  series={SCOPE_SERIES}
                  stackOffset={tab === 'share' ? 'expand' : 'none'}
                  height={220}
                  sync={['hover', 'series']}
                />
              </Tabs>
            </ChartFrame>

            <ChartFrame
              title="Searches against target"
              description="A dashed stroke is a target, not a measurement"
            >
              <LineChart
                label="Searches against target"
                data={weeks}
                x={w => new Date(w.week)}
                datumKey={w => w.week}
                series={[
                  { key: 'searches', label: 'Actual', value: w => w.searches },
                  { key: 'target', label: 'Target', value: w => w.target, dashed: true },
                ]}
                height={220}
                sync={['hover']}
              />
            </ChartFrame>

            <ChartFrame
              title={drill ? `Inside “${drill}”` : 'Top queries'}
              description="Click a bar to filter the table"
              breadcrumbs={
                drill ? (
                  <Breadcrumbs
                    items={[
                      { label: 'All queries', onClick: () => setDrill(null) },
                      { label: drill },
                    ]}
                  />
                ) : undefined
              }
              actions={
                selectedQueries.length > 0 ? (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedQueries([])}>
                    Clear filter
                  </Button>
                ) : undefined
              }
            >
              <BarChart
                label="Top queries by volume"
                data={TOP_QUERIES}
                x={q => q.query}
                datumKey={q => q.query}
                series={[{ key: 'searches', label: 'Searches', value: q => q.searches }]}
                layout="horizontal"
                height={260}
                valueLabels
                sync={['selection']}
                onDatumClick={event => event.source === 'keyboard' && setDrill(event.key)}
              />
            </ChartFrame>

            <ChartFrame
              title="Zero-result rate"
              description="Lower is better; the reindex lands in week 27"
            >
              <LineChart
                label="Zero-result rate by week"
                data={weeks}
                x={w => new Date(w.week)}
                datumKey={w => w.week}
                series={[{ key: 'zero', label: 'Zero-result', value: w => w.zeroResults }]}
                formatValue={n => `${n}%`}
                height={260}
                sync={['hover']}
              />
            </ChartFrame>
          </ChartGroup>

          <div>
            <Divider label={selectedQueries.length > 0 ? 'Filtered queries' : 'All queries'} />
            <div style={{ marginTop: 'var(--cds-space-4)' }}>
              <DataTable
                columns={columns}
                rows={queries}
                rowKey={row => row.query}
                label="Top queries"
                density="compact"
                empty={<span className="cds-body-sm">No queries match the current filter.</span>}
              />
            </div>
          </div>

          {selectedQueries.length > 0 && (
            <p className="cds-body-sm">
              <Badge tone="info" size="sm">
                {selectedQueries.length} selected
              </Badge>{' '}
              The bar chart and this table share one `selected` array through `ChartGroup`.
            </p>
          )}
        </Stack>
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
  parameters: {
    layout: 'padded',
    // The frame is a scaled-down copy of another story; running axe over it
    // would double-report that story's own results.
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-search-analytics--dashboard"
      theme={String(context.globals.theme ?? 'light')}
      caption="Dashboard at 390 x 844"
    />
  ),
}
