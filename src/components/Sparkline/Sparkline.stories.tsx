import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sparkline } from './Sparkline'
import { Stack } from '../Stack/Stack'
import { DataTable } from '../DataTable/DataTable'
import type { Column } from '../DataTable/DataTable'

const WEEKS = [820, 906, 874, 1012, 1140, 1098, 1264, 1210, 1388, 1440, 1402, 1596]
const VOLATILE = [12, 48, 19, 62, 8, 71, 33, 55, 21, 68, 40, 79]
const WITH_GAP = [30, 34, 41, null, null, 52, 58, 55, 61, 70]
const FLAT = [40, 40, 40, 40, 40, 40, 40]

const meta = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  args: {
    data: WEEKS,
    value: (n: number) => n,
    label: 'Queries per week',
    summary: 'up 95 per cent over twelve weeks',
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Sparkline<number>>

export default meta

// Typed against the component rather than `typeof meta`: `satisfies` widens the
// generic back to `unknown`, so `args.data` would not survive a spread.
type Story = StoryObj<typeof Sparkline<number>>

/** The three shapes. `line` is the default and the one to reach for. */
export const Kinds: Story = {
  render: args => (
    <Stack gap={4}>
      <Row label="line">
        <Sparkline {...args} kind="line" />
      </Row>
      <Row label="area">
        <Sparkline {...args} kind="area" />
      </Row>
      <Row label="bar">
        <Sparkline {...args} kind="bar" />
      </Row>
    </Stack>
  ),
}

/**
 * A sparkline is word-sized on purpose — it belongs beside a number, in a
 * sentence, or in a table cell, and it should sit on the baseline without
 * disturbing the line height.
 */
export const InRunningText: Story = {
  render: args => (
    <p className="cds-body" style={{ maxWidth: '54ch' }}>
      Query volume has climbed steadily since the September reindex{' '}
      <Sparkline {...args} width={64} height={16} /> while the zero-result rate{' '}
      <Sparkline
        {...args}
        data={[9.1, 8.4, 8.8, 7.2, 6.9, 6.1, 5.4, 5.6, 4.8, 4.2, 4.4, 3.9]}
        label="Zero-result rate"
        summary="down from 9.1 to 3.9 per cent"
        width={64}
        height={16}
      />{' '}
      has fallen by more than half.
    </p>
  ),
}

/** The case it was built for: a trend column in a dense table. */
export const InATable: Story = {
  render: () => {
    interface Source {
      id: string
      name: string
      documents: number
      trend: number[]
    }
    const rows: Source[] = [
      { id: 'nzz', name: 'NZZ archive', documents: 184203, trend: [12, 18, 15, 22, 28, 31, 44] },
      { id: 'wire', name: 'Agency wire', documents: 96410, trend: [60, 52, 55, 41, 38, 30, 24] },
      { id: 'gazette', name: 'Federal gazette', documents: 41288, trend: [8, 9, 8, 11, 10, 12, 12] },
      { id: 'photo', name: 'Photo desk', documents: 22940, trend: [30, 31, 29, 32, 30, 31, 30] },
    ]
    const columns: Column<Source>[] = [
      { key: 'name', header: 'Source', cell: row => row.name },
      {
        key: 'documents',
        header: 'Documents',
        align: 'end',
        numeric: true,
        cell: row => row.documents.toLocaleString('en-US'),
      },
      {
        key: 'trend',
        header: 'Ingest, 7 days',
        width: '9rem',
        cell: row => (
          <Sparkline
            data={row.trend}
            value={n => n}
            label={`${row.name} ingest, last seven days`}
            endpoint
          />
        ),
      },
    ]
    return <DataTable columns={columns} rows={rows} rowKey={row => row.id} label="Sources" />
  },
}

/**
 * `null` breaks the line rather than drawing through zero — a day with no data
 * and a day with no queries are different facts.
 */
export const GapsAndFlatSeries: Story = {
  render: args => (
    <Stack gap={4}>
      <Row label="gap">
        <Sparkline
          {...args}
          data={WITH_GAP}
          value={n => n}
          label="Ingest with an outage"
          summary="two days missing"
        />
      </Row>
      <Row label="flat">
        <Sparkline {...args} data={FLAT} label="A flat series" summary="unchanged" />
      </Row>
      <Row label="volatile">
        <Sparkline {...args} data={VOLATILE} label="A volatile series" />
      </Row>
      <Row label="two points">
        <Sparkline {...args} data={[10, 40]} label="Two points" />
      </Row>
      <Row label="one point">
        <Sparkline {...args} data={[10]} label="A single point — nothing to draw" />
      </Row>
      <Row label="empty">
        <Sparkline {...args} data={[]} label="No data" />
      </Row>
    </Stack>
  ),
}

/** Colour comes from `currentColor`, so a series token drops straight in. */
export const Colour: Story = {
  render: args => (
    <Stack gap={3}>
      {[1, 2, 3, 4, 5, 6].map(slot => (
        <Row key={slot} label={`series-${slot}`}>
          <Sparkline {...args} kind="area" color={`var(--cds-color-series-${slot})`} endpoint />
        </Row>
      ))}
      <Row label="inherits">
        <span className="cds-text-muted">
          <Sparkline {...args} color={undefined} style={{ color: 'inherit' }} />
        </span>
      </Row>
    </Stack>
  ),
}

export const Playground: Story = {
  args: { kind: 'area', endpoint: true, width: 160, height: 40 },
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <code className="cds-mono" style={{ fontSize: 11, width: 80, flex: 'none' }}>
        {label}
      </code>
      {children}
    </div>
  )
}
