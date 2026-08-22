import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Published' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['soft', 'outline', 'solid'] as const).map(variant => (
        <div key={variant} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="cds-kicker" style={{ width: 64 }}>{variant}</span>
          {TONES.map(tone => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge tone="success" dot>Indexed</Badge>
      <Badge tone="warning" dot>Embargoed</Badge>
      <Badge tone="danger" dot>Retracted</Badge>
      <Badge tone="neutral" size="sm">PDF</Badge>
      <Badge tone="info" size="sm">de</Badge>
    </div>
  ),
}

export const Playground: Story = {}
