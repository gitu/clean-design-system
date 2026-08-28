import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateRangePicker, type DateRangePreset } from './DateRangePicker'
import { Field } from '../Field/Field'
import type { CalendarRange } from '../Calendar/Calendar'

const meta = {
  title: 'Forms/DateRangePicker',
  component: DateRangePicker,
  args: { value: { start: null, end: null }, onChange: () => {} },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Presets are pinned to a fixed "today" so the docs read the same on any day.
 * A real application would build these from the current date.
 */
const TODAY = '2024-07-08'
const shift = (days: number) => {
  const date = new Date(`${TODAY}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const PRESETS: DateRangePreset[] = [
  { id: '7', label: 'Last 7 days', range: () => ({ start: shift(-6), end: TODAY }) },
  { id: '30', label: 'Last 30 days', range: () => ({ start: shift(-29), end: TODAY }) },
  { id: '90', label: 'Last quarter', range: () => ({ start: shift(-89), end: TODAY }) },
  { id: 'ytd', label: 'Year to date', range: () => ({ start: '2024-01-01', end: TODAY }) },
]

export const Default: Story = {
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ start: '2024-06-09', end: TODAY })
    return (
      <div style={{ minHeight: 460 }}>
        <Field label="Reporting period">
          <DateRangePicker value={range} onChange={setRange} presets={PRESETS} />
        </Field>
      </div>
    )
  },
}

/** Empty, and one month rather than two for a narrow sidebar. */
export const Compact: Story = {
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ start: null, end: null })
    return (
      <div style={{ maxWidth: 240, minHeight: 460 }}>
        <Field label="Filter by date" hint="Leave empty for all time.">
          <DateRangePicker value={range} onChange={setRange} months={1} size="sm" />
        </Field>
      </div>
    )
  },
}

export const Disabled: Story = {
  // WCAG 2.2 SC 1.4.3 exempts text that is part of an inactive control, and a
  // disabled row is the point of this story — so the contrast rule is scoped
  // away from it rather than switched off wholesale. Same as `Input`.
  parameters: { a11y: { context: { exclude: ['.is-disabled'] } } },
  render: () => (
    <Field label="Locked" disabled>
      <DateRangePicker value={{ start: '2024-07-01', end: '2024-07-08' }} onChange={() => {}} disabled />
    </Field>
  ),
}
