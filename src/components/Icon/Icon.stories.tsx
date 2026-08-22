import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon, iconNames } from './Icon'

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  parameters: { layout: 'padded' },
  args: { name: 'search', size: 16 },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllGlyphs: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: 4,
      }}
    >
      {iconNames.map(name => (
        <div
          key={name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            border: '1px solid var(--cds-color-rule)',
            borderRadius: 2,
          }}
        >
          <Icon name={name} size={16} />
          <span style={{ fontSize: 11, color: 'var(--cds-color-text-muted)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {[12, 14, 16, 20, 24, 32].map(size => (
        <Icon key={size} name="search" size={size} />
      ))}
    </div>
  ),
}
