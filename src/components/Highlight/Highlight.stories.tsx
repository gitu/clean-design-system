import type { Meta, StoryObj } from '@storybook/react-vite'
import { Highlight } from './Highlight'

const meta = {
  title: 'Search/Highlight',
  component: Highlight,
  args: {
    query: 'swiss banking',
    children:
      'Three decades of mergers have left Swiss private banking with a handful of institutions that between them hold more assets than the rest of the banking market combined.',
  },
} satisfies Meta<typeof Highlight>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <p className="cds-body">
      <Highlight {...args} />
    </p>
  ),
}

export const ExactPhrase: Story = {
  args: { query: ['private banking'] },
  render: args => (
    <p className="cds-body">
      <Highlight {...args} />
    </p>
  ),
}

export const Limited: Story = {
  args: { limit: 2 },
  render: args => (
    <p className="cds-body">
      <Highlight {...args} />
    </p>
  ),
}

export const Playground: Story = {
  render: args => <p className="cds-body"><Highlight {...args} /></p>,
}
