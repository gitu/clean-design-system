import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'
import { Field } from '../Field/Field'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Forms/Input',
  component: Input,
  args: { placeholder: 'Search terms' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
}

export const Adornments: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <Input iconStart={<Icon name="search" />} placeholder="With leading icon" />
      <Input iconEnd={<Icon name="calendar" />} placeholder="With trailing icon" />
      <Input prefix="doi:" placeholder="10.1000/182" mono />
      <Input suffix="words" type="number" placeholder="1200" />
    </div>
  ),
}

export const InAField: Story = {
  // WCAG 2.2 SC 1.4.3 exempts text that is part of an inactive control, which
  // is the whole point of the disabled row here — so the contrast rule is
  // scoped away from it rather than switched off for the story.
  parameters: { a11y: { context: { exclude: ['.is-disabled'] } } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 400 }}>
      <Field label="Query" hint="Supports AND, OR and &quot;exact phrases&quot;.">
        <Input placeholder="swiss AND banking" mono />
      </Field>
      <Field label="Reference" error="No document matches that reference." required>
        <Input defaultValue="A-99999" mono />
      </Field>
      <Field label="Collection" disabled hint="Locked by your administrator.">
        <Input defaultValue="Public archive" />
      </Field>
    </div>
  ),
}

export const Playground: Story = {}
