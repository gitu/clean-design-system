import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 520 }}>
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="block" height={80} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton variant="circle" />
        <Skeleton variant="block" width={180} height={12} />
      </div>
    </div>
  ),
}

export const ResultPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 620 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton variant="block" width="22%" height={10} />
          <Skeleton variant="block" width="68%" height={17} />
          <Skeleton variant="text" lines={2} />
        </div>
      ))}
    </div>
  ),
}

export const Playground: Story = { args: { variant: 'text', lines: 3 } }
