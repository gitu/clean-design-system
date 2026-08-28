import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { TimeInput } from './TimeInput'
import { Field } from '../Field/Field'
import type { TimeString } from './time-parse'

const meta = {
  title: 'Forms/TimeInput',
  component: TimeInput,
  args: { value: null, onChange: () => {} },
} satisfies Meta<typeof TimeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<TimeString | null>('06:00')
    return (
      <div style={{ maxWidth: 220, minHeight: 320 }}>
        <Field label="Publishes at" hint="Half-hour steps, or type any time.">
          <TimeInput value={value} onChange={setValue} />
        </Field>
      </div>
    )
  },
}

/**
 * What people type when they are not thinking about the field.
 *
 * `930` is the interesting one: it has to be read as 9:30 rather than as hour
 * 930, which is why it gets a parsing pass of its own rather than a looser
 * pattern that would also swallow nonsense.
 */
export const Shorthand: Story = {
  render: () => {
    const [value, setValue] = useState<TimeString | null>(null)
    return (
      <div style={{ maxWidth: 320, minHeight: 340 }}>
        <Field label="Time" hint="Understands 930, 9.30, 9h30, 9am, noon and 21:00.">
          <TimeInput value={value} onChange={setValue} />
        </Field>
        <p className="cds-body-sm cds-numeric" style={{ marginTop: 8, color: 'var(--cds-color-text-muted)' }}>
          Value: <span data-testid="value">{value ?? '—'}</span>
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Time')
    const value = () => canvas.getByTestId('value').textContent

    await userEvent.type(input, '930{Enter}')
    expect(value()).toBe('09:30')

    await userEvent.clear(input)
    await userEvent.type(input, '9pm{Enter}')
    expect(value()).toBe('21:00')

    await userEvent.clear(input)
    await userEvent.type(input, 'noon{Enter}')
    expect(value()).toBe('12:00')

    await userEvent.clear(input)
    await userEvent.type(input, 'half nine{Enter}')
    expect(input).toBeInvalid()
    expect(canvas.getByText(/Not a time we recognise/)).toBeInTheDocument()
  },
}

/**
 * Twelve-hour display, twenty-four-hour value.
 *
 * The two fields below share one piece of state. `hour12` decides what the
 * reader sees; the value handed to the form is `HH:mm` either way, so nothing
 * downstream has to know which way the field was rendered.
 */
export const TwelveHour: Story = {
  render: () => {
    const [value, setValue] = useState<TimeString | null>('17:30')
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 260, minHeight: 380 }}>
        <Field label="Shown as 12-hour">
          <TimeInput value={value} onChange={setValue} hour12 />
        </Field>
        <Field label="Shown as 24-hour">
          <TimeInput value={value} onChange={setValue} />
        </Field>
        <p className="cds-body-sm cds-numeric" style={{ color: 'var(--cds-color-text-muted)' }}>
          Stored: {value ?? '—'}
        </p>
      </div>
    )
  },
}

/** A working day at fifteen-minute steps, with a zone label fused to the edge. */
export const Constrained: Story = {
  render: () => {
    const [value, setValue] = useState<TimeString | null>('09:15')
    return (
      <div style={{ maxWidth: 260, minHeight: 340 }}>
        <Field label="Review slot" hint="Between 08:00 and 18:00.">
          <TimeInput value={value} onChange={setValue} step={15} min="08:00" max="18:00" suffix="CET" />
        </Field>
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
    <div style={{ display: 'grid', gap: 20, maxWidth: 260 }}>
      <Field label="Empty">
        <TimeInput value={null} onChange={() => {}} hideList />
      </Field>
      <Field label="Required" error="A time is required." required>
        <TimeInput value={null} onChange={() => {}} hideList />
      </Field>
      <Field label="Locked" disabled>
        <TimeInput value="06:00" onChange={() => {}} disabled hideList />
      </Field>
    </div>
  ),
}
