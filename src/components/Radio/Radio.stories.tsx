import type { Meta, StoryObj } from '@storybook/react-vite'
import { Radio, RadioGroup } from './Radio'

const meta = {
  title: 'Forms/Radio',
  component: RadioGroup,
  args: { children: null },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <RadioGroup defaultValue="any" label="Match">
      <Radio value="any" label="Any of these words" />
      <Radio value="all" label="All of these words" />
      <Radio value="phrase" label="This exact phrase" description="Slower on large collections." />
      <Radio value="regex" label="Regular expression" disabled />
    </RadioGroup>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="week" orientation="horizontal" label="Period">
      <Radio value="day" label="24 hours" />
      <Radio value="week" label="7 days" />
      <Radio value="month" label="30 days" />
      <Radio value="year" label="12 months" />
    </RadioGroup>
  ),
}
