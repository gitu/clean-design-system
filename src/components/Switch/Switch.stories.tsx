import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './Switch'

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { label: 'Live results' },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled" disabled />
      <Switch
        label="Search as you type"
        description="Re-runs the query after each keystroke."
        defaultChecked
      />
      <div style={{ maxWidth: 320 }}>
        <Switch label="Label first" labelPosition="start" defaultChecked />
      </div>
    </div>
  ),
}

export const Playground: Story = {}
