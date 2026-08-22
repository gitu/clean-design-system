import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './Tag'

const meta = {
  title: 'Primitives/Tag',
  component: Tag,
  args: { children: 'Finance' },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Tag>Finance</Tag>
      <Tag onRemove={() => {}}>Finance</Tag>
      <Tag facet="Section" onRemove={() => {}}>Finance</Tag>
      <Tag facet="Author" tone="accent" onRemove={() => {}}>M. Brunner</Tag>
      <Tag facet="Published" size="sm" onRemove={() => {}}>2024</Tag>
    </div>
  ),
}

export const Playground: Story = { args: { facet: 'Section', onRemove: () => {} } }
