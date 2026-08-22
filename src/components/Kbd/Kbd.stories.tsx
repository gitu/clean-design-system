import type { Meta, StoryObj } from '@storybook/react-vite'
import { Kbd } from './Kbd'

const meta = {
  title: 'Primitives/Kbd',
  component: Kbd,
  args: { keys: 'Cmd+K' },
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>

export const Examples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Kbd keys="/" />
      <Kbd keys="Cmd+K" />
      <Kbd keys="Shift+Enter" />
      <Kbd keys={['↑', '↓']} />
      <Kbd keys="Esc" size="sm" />
    </div>
  ),
}

export const Playground: Story = {}
