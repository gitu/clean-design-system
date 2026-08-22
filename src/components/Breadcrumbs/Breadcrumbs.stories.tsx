import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumbs } from './Breadcrumbs'

const meta = {
  title: 'Layout/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { label: 'Archive', href: '#' },
      { label: 'Newspapers', href: '#' },
      { label: '2024', href: '#' },
      { label: 'November', href: '#' },
      { label: 'A-38211' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Collapsed: Story = { args: { maxItems: 3 } }

export const CustomSeparator: Story = { args: { separator: '›' } }
