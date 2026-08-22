import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { Input } from '../Input/Input'
import { Select } from '../Select/Select'
import { Button } from '../Button/Button'

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
