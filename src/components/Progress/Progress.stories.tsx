import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Primitives/Progress',
  component: Progress,
  args: { label: 'Crawl progress', value: 62 },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Determinate: Story = { args: { showLabel: true } }

/**
 * Omit `value` when the work has no measurable end. Under reduced motion the
 * sweep becomes a pulse — and stays partial, because a full bar would read as
 * "finished", which is the opposite of what it means.
 */
export const Indeterminate: Story = {
  args: { value: undefined, showLabel: true, label: 'Queued' },
}

export const Tones: Story = {
  render: args => (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <Progress {...args} tone="accent" label="Running" value={62} showLabel />
      <Progress {...args} tone="success" label="Complete" value={100} showLabel />
      <Progress {...args} tone="warning" label="Throttled" value={41} showLabel />
      <Progress {...args} tone="danger" label="Failed" value={34} showLabel />
    </Stack>
  ),
}

export const Sizes: Story = {
  render: args => (
    <Stack gap={4} style={{ maxWidth: 360 }}>
      <Progress {...args} size="sm" label="Small" />
      <Progress {...args} size="md" label="Medium" />
    </Stack>
  ),
}

/** The readout can say something more useful than a percentage. */
export const CustomValueLabel: Story = {
  args: { showLabel: true, value: 62, max: 100, valueLabel: '114,206 of 184,203' },
}

export const Playground: Story = { args: { showLabel: true } }
