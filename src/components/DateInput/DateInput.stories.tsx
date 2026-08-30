import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DateInput } from './DateInput'
import { Field } from '../Field/Field'
import type { IsoDate } from '../Calendar/calendar-utils'

const meta = {
  title: 'Forms/DateInput',
  component: DateInput,
  args: { value: null, onChange: () => {} },
} satisfies Meta<typeof DateInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Every story pins "today", so relative input and the calendar's month are the
 * same on any day the docs are read.
 */
const TODAY = '2024-07-08'

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-08')
    return (
      <div style={{ maxWidth: 260 }}>
        <Field label="Published" hint="Type it, or pick it off the calendar.">
          <DateInput value={value} onChange={setValue} today={TODAY} />
        </Field>
      </div>
    )
  },
}

/**
 * The shorthands, asserted.
 *
 * This is the whole argument for the component: `+3d` is three keystrokes and
 * four clicks in a month grid. If these stop working the field is just a text
 * box with a picture of a calendar on it.
 */
export const Shorthand: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>(null)
    return (
      <div style={{ maxWidth: 320 }}>
        <Field
          label="Due"
          hint="Understands 8.7., 8 Jul, today, tomorrow, +3d, -1w and friday."
        >
          <DateInput value={value} onChange={setValue} today={TODAY} />
        </Field>
        <p className="cds-body-sm cds-numeric" style={{ marginTop: 8, color: 'var(--cds-color-text-muted)' }}>
          Value: <span data-testid="value">{value ?? '—'}</span>
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Due')
    const value = () => canvas.getByTestId('value').textContent

    await userEvent.type(input, '+3d{Enter}')
    await expect(value()).toBe('2024-07-11')

    await userEvent.clear(input)
    await userEvent.type(input, '8.7.{Enter}')
    await expect(value()).toBe('2024-07-08')

    await userEvent.clear(input)
    await userEvent.type(input, 'friday{Enter}')
    await expect(value()).toBe('2024-07-12')

    // A date it cannot read is kept, not thrown away — and it says so.
    await userEvent.clear(input)
    await userEvent.type(input, 'someday{Enter}')
    await expect(input).toHaveValue('someday')
    await expect(input).toBeInvalid()
    await expect(canvas.getByText(/Not a date we recognise/)).toBeInTheDocument()
  },
}

/** A window with days shut inside it — an embargo the desk cannot publish into. */
export const Restricted: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-15')
    return (
      <div style={{ maxWidth: 260 }}>
        <Field label="Embargo lifts" hint="Weekdays between 8 and 31 July.">
          <DateInput
            value={value}
            onChange={setValue}
            today={TODAY}
            min="2024-07-08"
            max="2024-07-31"
            disabledDates={['2024-07-13', '2024-07-14', '2024-07-20', '2024-07-21', '2024-07-27', '2024-07-28']}
            markedDates={['2024-07-18']}
          />
        </Field>
      </div>
    )
  },
}

export const Sizes: Story = {
  render: () => {
    const [value, setValue] = useState<IsoDate | null>('2024-07-08')
    return (
      <div style={{ display: 'grid', gap: 12, maxWidth: 260 }}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <DateInput
            key={size}
            value={value}
            onChange={setValue}
            today={TODAY}
            size={size}
            label={`Date, ${size}`}
          />
        ))}
      </div>
    )
  },
}

export const States: Story = {
  // WCAG 2.2 SC 1.4.3 exempts text that is part of an inactive control, and a
  // disabled row is the point of this story — so the contrast rule is scoped
  // away from it rather than switched off wholesale. Same as `Input`.
  parameters: { a11y: { context: { exclude: ['.is-disabled'] } } },
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 280 }}>
      <Field label="Empty">
        <DateInput value={null} onChange={() => {}} today={TODAY} />
      </Field>
      <Field label="Required" error="Pick a publication date." required>
        <DateInput value={null} onChange={() => {}} today={TODAY} />
      </Field>
      <Field label="Locked" disabled>
        <DateInput value="2024-07-08" onChange={() => {}} today={TODAY} disabled />
      </Field>
      <Field label="Typed only" hint="No calendar button.">
        <DateInput value="2024-07-08" onChange={() => {}} today={TODAY} hideCalendar />
      </Field>
    </div>
  ),
}
