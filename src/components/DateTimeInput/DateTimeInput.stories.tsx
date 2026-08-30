import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { DateTimeInput, type LocalDateTime } from './DateTimeInput'
import { Field } from '../Field/Field'

const meta = {
  title: 'Forms/DateTimeInput',
  component: DateTimeInput,
  args: { value: null, onChange: () => {} },
} satisfies Meta<typeof DateTimeInput>

export default meta
type Story = StoryObj<typeof meta>

const TODAY = '2024-07-08'

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<LocalDateTime | null>('2024-07-12T06:00')
    return (
      <div style={{ maxWidth: 420, minHeight: 360 }}>
        <Field
          label="Embargo lifts"
          hint="Newsroom time. The stored value carries no timezone — 06:00 means 06:00 on the desk."
        >
          <DateTimeInput value={value} onChange={setValue} today={TODAY} zone="CET" />
        </Field>
        <p className="cds-body-sm cds-numeric" style={{ marginTop: 8, color: 'var(--cds-color-text-muted)' }}>
          Value: <span data-testid="value">{value ?? '—'}</span>
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const value = () => canvas.getByTestId('value').textContent

    // Changing one half keeps the other.
    const time = canvas.getByLabelText('Embargo lifts — time')
    await userEvent.clear(time)
    await userEvent.type(time, '18:30{Enter}')
    await expect(value()).toBe('2024-07-12T18:30')

    // Clearing the date clears the moment: a time on its own is not one.
    const date = canvas.getByLabelText('Embargo lifts — date')
    await userEvent.clear(date)
    await userEvent.tab()
    await expect(value()).toBe('—')
  },
}

/** Empty, and with a default time waiting for the date to arrive. */
export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<LocalDateTime | null>(null)
    return (
      <div style={{ maxWidth: 420, minHeight: 360 }}>
        <Field label="Scheduled for" hint="A date on its own publishes at 05:00.">
          <DateTimeInput value={value} onChange={setValue} today={TODAY} defaultTime="05:00" />
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
    <div style={{ display: 'grid', gap: 20, maxWidth: 420 }}>
      <Field label="Required" error="Publication needs a date and a time." required>
        <DateTimeInput value={null} onChange={() => {}} today={TODAY} />
      </Field>
      <Field label="Locked" disabled>
        <DateTimeInput value="2024-07-12T06:00" onChange={() => {}} today={TODAY} disabled zone="CET" />
      </Field>
    </div>
  ),
}
