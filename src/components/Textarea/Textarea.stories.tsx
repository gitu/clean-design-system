import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'
import { Field } from '../Field/Field'

const meta = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    // The stories that wrap this in a `Field` get their name from the label;
    // the bare ones need to say it themselves.
    'aria-label': 'Advanced query',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <Field
        label="Advanced query"
        hint="One clause per line. Lines are combined with AND."
      >
        <Textarea
          mono
          rows={6}
          defaultValue={'section:finance\npublished:[2020 TO 2024]\nNOT status:retracted'}
        />
      </Field>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 460 }}>
      {/* This render ignores `args`, so the meta-level name does not reach
          these — each says what it is. */}
      <Textarea aria-label="Default" placeholder="Describe what you are looking for" />
      <Textarea aria-label="Invalid" invalid defaultValue="unbalanced (parenthesis" mono />
      <Textarea aria-label="Disabled" disabled defaultValue="Read-only saved query" />
    </div>
  ),
}

export const Playground: Story = { render: args => <div style={{ maxWidth: 460 }}><Textarea {...args} /></div> }
