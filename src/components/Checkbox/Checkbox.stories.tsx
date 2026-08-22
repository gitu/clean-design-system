import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Include archived documents' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" indeterminate checked readOnly />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled, checked" disabled defaultChecked />
      <Checkbox
        label="With a description"
        description="Adds roughly 40,000 documents to the result set."
        defaultChecked
      />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Checkbox size="sm" label="Small — the density used inside facet lists" defaultChecked />
      <Checkbox size="md" label="Medium — the default for forms" defaultChecked />
    </div>
  ),
}

export const Playground: Story = {}
