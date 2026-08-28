import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartFrame } from './ChartFrame'
import { ChartLegend } from '../ChartLegend/ChartLegend'
import { LineChart } from '../LineChart/LineChart'
import { DataTable } from '../DataTable/DataTable'
import { Button } from '../Button/Button'
import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs'
import type { Column } from '../DataTable/DataTable'
import { QUERY_WEEKS, type QueryWeek } from '../../stories/fixtures'

const WEEKS = QUERY_WEEKS.slice(-8)

const chart = (
  <LineChart
    label="Searches per week"
    data={WEEKS}
    x={(w: QueryWeek) => new Date(w.week)}
    datumKey={(w: QueryWeek) => w.week}
    series={[{ key: 'searches', label: 'Searches', value: (w: QueryWeek) => w.searches }]}
    height={200}
    animate={false}
  />
)

const columns: Array<Column<QueryWeek>> = [
  { key: 'week', header: 'Week', cell: row => row.week },
  {
    key: 'searches',
    header: 'Searches',
    align: 'end',
    numeric: true,
    cell: row => row.searches.toLocaleString('en-US'),
  },
]

const meta = {
  title: 'Charts/ChartFrame',
  component: ChartFrame,
  args: {
    title: 'Searches per week',
    description: 'All scopes, last eight weeks',
    children: chart,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChartFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Ruled: Story = { args: { variant: 'ruled' } }

export const WithLegendAndFootnote: Story = {
  args: {
    legend: <ChartLegend items={[{ key: 'searches', label: 'Searches', color: 'var(--cds-color-series-1)' }]} />,
    footnote: 'Source: query log, sampled at 100%',
  },
}

/**
 * The data table is a slot, not an import — so a consumer of `LineChart` does
 * not also ship `DataTable`. Every chart already carries a hidden table for
 * screen readers; this one is a design choice on top.
 */
export const WithDataTable: Story = {
  args: {
    table: <DataTable columns={columns} rows={WEEKS} rowKey={row => row.week} density="compact" />,
  },
}

/** Drill-down is the caller swapping data and putting a trail in this slot. */
export const WithDrilldown: Story = {
  args: {
    title: 'Inside “Finance”',
    breadcrumbs: (
      <Breadcrumbs items={[{ label: 'All sections', href: '#' }, { label: 'Finance' }]} />
    ),
    actions: (
      <Button variant="ghost" size="sm">
        Clear
      </Button>
    ),
  },
}
