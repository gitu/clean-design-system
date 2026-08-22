import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from './Stack'
import { Button } from '../Button/Button'
import { Badge } from '../Badge/Badge'

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

const Box = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '8px 12px',
      background: 'var(--cds-color-surface-sunken)',
      border: '1px solid var(--cds-color-rule)',
      borderRadius: 2,
      fontSize: 13,
    }}
  >
    {children}
  </div>
)

export const Column: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <Box>First</Box>
      <Box>Second</Box>
      <Box>Third</Box>
    </Stack>
  ),
}

export const Row: Story = {
  render: () => (
    <Stack direction="row" gap={2} align="center">
      <Button size="sm" variant="primary">Apply</Button>
      <Button size="sm" variant="ghost">Reset</Button>
      <Badge tone="accent">3 filters</Badge>
    </Stack>
  ),
}

export const WithDividers: Story = {
  render: () => (
    <Stack gap={4} dividers style={{ maxWidth: 420 }}>
      <div>
        <p className="cds-kicker">Section</p>
        <p className="cds-body-sm">Finance, Economy</p>
      </div>
      <div>
        <p className="cds-kicker">Author</p>
        <p className="cds-body-sm">M. Brunner</p>
      </div>
      <div>
        <p className="cds-kicker">Published</p>
        <p className="cds-body-sm">2020 – 2024</p>
      </div>
    </Stack>
  ),
}

export const Playground: Story = {
  args: { direction: 'row', gap: 4 },
  render: args => (
    <Stack {...args}>
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Stack>
  ),
}
