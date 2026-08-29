import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { Input } from '../Input/Input'
import { Select } from '../Select/Select'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/Field',
  component: Field,
  args: { children: null },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Field
        label="Search within"
        hint="Restricts the query to the selected collection."
        action={<Button variant="ghost" size="sm">Reset</Button>}
      >
        <Select
          options={[
            { value: 'all', label: 'All collections' },
            { value: 'archive', label: 'Newspaper archive' },
            { value: 'wire', label: 'Wire copy' },
          ]}
        />
      </Field>
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      <Field label="Author" orientation="horizontal">
        <Input placeholder="Surname" />
      </Field>
      <Field label="Reference" orientation="horizontal" hint="Case-sensitive.">
        <Input placeholder="A-00000" mono />
      </Field>
      <Field label="Language" orientation="horizontal" error="Pick at least one.">
        <Select placeholder="Choose…" options={[{ value: 'de', label: 'German' }]} />
      </Field>
    </div>
  ),
}

/**
 * A row of fields where only some carry a hint.
 *
 * `align="end"` on the row, not `start`: the hint sits above the control, so a
 * field with one is taller at the top than a field without, and aligning the
 * tops staggers the controls. Every control snaps to one of four heights, so
 * aligning the bottoms lines them up exactly.
 */
export const Row: Story = {
  render: () => (
    <Stack gap={6} style={{ maxWidth: '34rem' }}>
      <Stack gap={2}>
        <span className="cds-kicker">align=&quot;end&quot; — controls line up</span>
        <Stack direction="row" gap={4} align="end" wrap>
          <Field label="Rooms" hint="Half rooms count" style={{ flex: '0 1 9rem' }}>
            <Input type="number" defaultValue="3.5" />
          </Field>
          <Field label="Living space" style={{ flex: '0 1 10rem' }}>
            <Input type="number" suffix="m²" defaultValue="96" />
          </Field>
          <Field label="Floor" style={{ flex: '0 1 8rem' }}>
            <Input type="number" defaultValue="4" />
          </Field>
        </Stack>
      </Stack>

      <Stack gap={2}>
        <span className="cds-kicker">align=&quot;start&quot; — the hint staggers them</span>
        <Stack direction="row" gap={4} align="start" wrap>
          <Field label="Rooms" hint="Half rooms count" style={{ flex: '0 1 9rem' }}>
            <Input type="number" defaultValue="3.5" />
          </Field>
          <Field label="Living space" style={{ flex: '0 1 10rem' }}>
            <Input type="number" suffix="m²" defaultValue="96" />
          </Field>
          <Field label="Floor" style={{ flex: '0 1 8rem' }}>
            <Input type="number" defaultValue="4" />
          </Field>
        </Stack>
      </Stack>
    </Stack>
  ),
}
