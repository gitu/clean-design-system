import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from './Divider'

const meta = {
  title: 'Primitives/Divider',
  component: Divider,
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 520 }}>
      <Divider tone="subtle" />
      <Divider tone="default" />
      <Divider tone="strong" />
      <Divider tone="accent" />
    </div>
  ),
}

export const Labelled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520 }}>
      <Divider label="Refine" />
      <Divider label="Archive" align="center" />
      <Divider label="Restricted" tone="accent" />
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: 24 }}>
      <span className="cds-ui-sm">4,231 results</span>
      <Divider orientation="vertical" />
      <span className="cds-ui-sm">0.08s</span>
      <Divider orientation="vertical" />
      <span className="cds-ui-sm">3 filters</span>
    </div>
  ),
}

export const Playground: Story = { args: { label: 'Section' } }
