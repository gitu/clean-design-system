import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Calendar,
  DataTable,
  DateRangePicker,
  Divider,
  Drawer,
  EmptyState,
  Icon,
  NavList,
  Panel,
  SegmentedControl,
  Stack,
  Toolbar,
  type CalendarRange,
  type DateRangePreset,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { CALENDAR_ENTRIES, type CalendarEntry } from './fixtures'

const meta = {
  title: 'Patterns/Editorial calendar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const KIND_TONE = {
  embargo: 'warning',
  publication: 'success',
  review: 'info',
  maintenance: 'neutral',
} as const

const KINDS = Object.keys(KIND_TONE) as (keyof typeof KIND_TONE)[]

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/**
 * A month of entries, and the two things a calendar is for: seeing where the
 * work falls, and picking a span to look at.
 *
 * The grid marks days that have entries rather than trying to render them in
 * the cell — six weeks of tiny stacked labels is a shape nobody can scan. The
 * day you pick opens a real list beside it, which is where the detail belongs.
 */
export const Month: Story = {
  render: () => {
    const [selected, setSelected] = useState<string | null>('2024-07-08')
    const [month, setMonth] = useState('2024-07-01')
    const [kinds, setKinds] = useState<string[]>([])
    const [drawerDay, setDrawerDay] = useState<string | null>(null)

    const entries = useMemo(
      () => CALENDAR_ENTRIES.filter(entry => kinds.length === 0 || kinds.includes(entry.kind)),
      [kinds]
    )

    const marked = useMemo(() => [...new Set(entries.map(entry => entry.date))], [entries])
    const forDay = (day: string | null) =>
      day ? entries.filter(entry => entry.date === day) : []
    const dayEntries = forDay(selected)

    const counts = useMemo(() => {
      const map = new Map<string, number>()
      for (const entry of entries) map.set(entry.date, (map.get(entry.date) ?? 0) + 1)
      return map
    }, [entries])

    return (
      <AppShell
        header={
          <Masthead
            section="Editorial calendar"
            actions={
              <Button variant="primary" size="sm">
                <Icon name="plus" size={13} /> New entry
              </Button>
            }
          />
        }
        sidebar={
          <Stack gap={5} style={{ padding: 'var(--cds-space-4)' }}>
            <div>
              <Divider label="Show" />
              <div style={{ marginTop: 'var(--cds-space-3)' }}>
                <NavList
                  size="sm"
                  label="Entry kinds"
                  value={kinds.length === 0 ? 'all' : kinds[0]}
                  onChange={id => setKinds(id === 'all' ? [] : [id])}
                  items={[
                    { id: 'all', label: 'Everything', count: CALENDAR_ENTRIES.length },
                    ...KINDS.map(kind => ({
                      id: kind,
                      label: kind[0]!.toUpperCase() + kind.slice(1),
                      count: CALENDAR_ENTRIES.filter(entry => entry.kind === kind).length,
                    })),
                  ]}
                />
              </div>
            </div>
          </Stack>
        }
        sidebarWidth="15rem"
        maxWidth="1280px"
      >
        <Stack gap={5} className="sb-page">
          <Toolbar
            end={
              <Button
                variant="secondary"
                size="sm"
                className="sb-burger"
                onClick={() => setDrawerDay(selected)}
              >
                Open day
              </Button>
            }
          >
            <span className="cds-kicker">
              {entries.length} entries
            </span>
          </Toolbar>

          <div className="sb-calendar-split">
            <Calendar
              month={month}
              onMonthChange={setMonth}
              value={selected}
              onChange={next => {
                setSelected(next)
                // On a narrow screen the day list is off-screen, so opening a
                // drawer is the only way the tap leads anywhere.
                if (next && window.matchMedia('(max-width: 860px)').matches) setDrawerDay(next)
              }}
              markedDates={marked}
              label="Editorial calendar"
              renderDay={iso => {
                const count = counts.get(iso)
                return count && count > 1 ? count : null
              }}
            />

            <Panel
              variant="ruled"
              padding="md"
              title={selected ? dayFormat.format(new Date(`${selected}T00:00:00Z`)) : 'No day selected'}
              description={
                selected ? `${dayEntries.length} ${dayEntries.length === 1 ? 'entry' : 'entries'}` : undefined
              }
              className="sb-calendar-day"
            >
              {dayEntries.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="Nothing scheduled"
                  description="Pick another day, or add an entry."
                />
              ) : (
                <Stack gap={4} dividers>
                  {dayEntries.map(entry => (
                    <EntryRow key={entry.id} entry={entry} />
                  ))}
                </Stack>
              )}
            </Panel>
          </div>
        </Stack>

        <Drawer
          open={drawerDay !== null}
          onClose={() => setDrawerDay(null)}
          title={drawerDay ? dayFormat.format(new Date(`${drawerDay}T00:00:00Z`)) : ''}
          side="bottom"
          size="md"
        >
          {forDay(drawerDay).length === 0 ? (
            <EmptyState size="sm" title="Nothing scheduled" />
          ) : (
            <Stack gap={4} dividers>
              {forDay(drawerDay).map(entry => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </Stack>
          )}
        </Drawer>
      </AppShell>
    )
  },
}

function EntryRow({ entry }: { entry: CalendarEntry }) {
  return (
    <div style={{ paddingTop: 'var(--cds-space-3)' }}>
      <Stack gap={2}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-3)' }}>
          <Badge tone={KIND_TONE[entry.kind]} size="sm">
            {entry.kind}
          </Badge>
          {entry.time && (
            <span className="cds-numeric cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
              {entry.time}
            </span>
          )}
        </div>
        <p className="cds-body" style={{ margin: 0 }}>
          {entry.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-2)' }}>
          <Avatar name={entry.owner} size="xs" tinted decorative />
          <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-muted)' }}>
            {entry.owner}
          </span>
        </div>
      </Stack>
    </div>
  )
}

const PRESETS: DateRangePreset[] = [
  { id: 'week', label: 'This week', range: () => ({ start: '2024-07-08', end: '2024-07-14' }) },
  { id: 'month', label: 'This month', range: () => ({ start: '2024-07-01', end: '2024-07-31' }) },
  { id: 'quarter', label: 'This quarter', range: () => ({ start: '2024-07-01', end: '2024-09-30' }) },
  { id: 'half', label: 'Year to date', range: () => ({ start: '2024-01-01', end: '2024-07-31' }) },
]

/**
 * Picking a span, and what it narrows.
 *
 * The picker closes on the second click rather than making you confirm — a
 * range is complete the moment it has two ends, and a dialog that then asks
 * "are you sure" is asking about nothing.
 */
export const SelectRange: Story = {
  name: 'Select a range',
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ start: '2024-07-04', end: '2024-07-18' })
    const [density, setDensity] = useState('comfortable')

    const rows = useMemo(
      () =>
        CALENDAR_ENTRIES.filter(entry => {
          if (!range.start) return true
          if (!range.end) return entry.date === range.start
          return entry.date >= range.start && entry.date <= range.end
        }),
      [range]
    )

    const columns: TableColumn<CalendarEntry>[] = [
      { key: 'date', header: 'Date', width: '7rem', numeric: true, align: 'start', cell: row => row.date },
      { key: 'time', header: 'Time', width: '4.5rem', numeric: true, hideBelow: 'sm', cell: row => row.time ?? '—' },
      { key: 'title', header: 'Entry', cell: row => row.title },
      {
        key: 'kind',
        header: 'Kind',
        width: '7rem',
        cell: row => (
          <Badge tone={KIND_TONE[row.kind]} size="sm">
            {row.kind}
          </Badge>
        ),
      },
      { key: 'owner', header: 'Owner', width: '8rem', hideBelow: 'md', cell: row => row.owner },
    ]

    return (
      <AppShell
        header={<Masthead section="Schedule" />}
        sidebarHidden
        maxWidth="1120px"
      >
        <Stack gap={5} className="sb-page">
          <Toolbar
            end={
              <SegmentedControl
                size="sm"
                value={density}
                onChange={setDensity}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                ]}
              />
            }
          >
            <DateRangePicker
              value={range}
              onChange={setRange}
              presets={PRESETS}
              min="2024-01-01"
              max="2024-12-31"
              label="Scheduled between"
              size="sm"
            />
          </Toolbar>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={row => row.id}
            label="Scheduled entries"
            density={density === 'compact' ? 'compact' : 'comfortable'}
            empty={
              <span className="cds-body-sm">Nothing is scheduled in the selected range.</span>
            }
          />
        </Stack>
      </AppShell>
    )
  },
}

export const Mobile: Story = {
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-editorial-calendar--month"
      theme={String(context.globals.theme ?? 'light')}
      caption="Month at 390 x 844"
    />
  ),
}
