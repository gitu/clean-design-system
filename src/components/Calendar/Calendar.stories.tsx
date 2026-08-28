import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar, type CalendarRange } from './Calendar'
import type { IsoDate } from './calendar-utils'

const meta = {
  title: 'Forms/Calendar',
  component: Calendar,
  args: { label: 'Date' },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-08')
    return <Calendar value={value} onChange={setValue} month="2024-07-01" label="Publication date" />
  },
}

/** Two months, because a span usually crosses one. */
export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ start: '2024-07-04', end: '2024-07-18' })
    return (
      <Calendar
        mode="range"
        range={range}
        onRangeChange={setRange}
        months={2}
        month="2024-07-01"
        label="Reporting period"
      />
    )
  },
}

/**
 * Days shut, days marked, and a window outside which nothing is selectable.
 *
 * Marked and disabled are different claims — "something happens here" and "you
 * cannot choose this" — so they are drawn differently rather than sharing one
 * grey.
 */
export const Constrained: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-16')
    return (
      <Calendar
        value={value}
        onChange={setValue}
        month="2024-07-01"
        min="2024-07-08"
        max="2024-07-31"
        disabledDates={['2024-07-13', '2024-07-14', '2024-07-20', '2024-07-21']}
        markedDates={['2024-07-11', '2024-07-18', '2024-07-25']}
        label="Embargo lifts"
      />
    )
  },
}

/** A count under the day — how the editorial calendar shows a busy Tuesday. */
export const WithDayContent: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-09')
    const counts: Record<string, number> = {
      '2024-07-09': 3,
      '2024-07-10': 2,
      '2024-07-12': 4,
      '2024-07-18': 2,
    }
    return (
      <Calendar
        value={value}
        onChange={setValue}
        month="2024-07-01"
        markedDates={Object.keys(counts)}
        renderDay={iso => counts[iso] ?? null}
        label="Schedule"
      />
    )
  },
}

/** Sunday-first, and a different locale for the month and weekday names. */
export const Locale: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-08')
    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <Calendar value={value} onChange={setValue} month="2024-07-01" weekStartsOn={0} label="Sunday first" />
        <Calendar value={value} onChange={setValue} month="2024-07-01" locale="de-CH" label="Deutsch" />
      </div>
    )
  },
}
