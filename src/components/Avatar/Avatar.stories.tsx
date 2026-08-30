import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, within } from 'storybook/test'
import { Avatar } from './Avatar'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Content/Avatar',
  component: Avatar,
  parameters: { layout: 'padded' },
  args: { name: 'Mira Brunner' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Initials: Story = {
  render: () => (
    <Stack direction="row" gap={3} align="center">
      <Avatar name="Mira Brunner" size="xs" />
      <Avatar name="Mira Brunner" size="sm" />
      <Avatar name="Mira Brunner" size="md" />
      <Avatar name="Mira Brunner" size="lg" />
    </Stack>
  ),
}

/** Tinted by a hash of the name, so one person keeps one colour everywhere. */
export const Tinted: Story = {
  render: () => (
    <Stack direction="row" gap={3} align="center">
      {['Mira Brunner', 'Tom Keller', 'Ana Lopez', 'Sam Frei', 'Jo Meier'].map(name => (
        <Avatar key={name} name={name} tinted />
      ))}
    </Stack>
  ),
}

/**
 * A picture that fails to load falls back to the initials.
 *
 * Without it the browser draws its broken-image glyph where a person should
 * be — which is worse than the fallback the component already had for the
 * case where no picture was given at all. The `play` function fires the
 * error rather than waiting on a real 404.
 */
export const BrokenImage: Story = {
  render: () => <Avatar name="Mira Brunner" src="/does-not-exist.png" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const image = canvasElement.querySelector('img')
    await expect(image).toBeInTheDocument()

    await fireEvent.error(image!)

    await expect(canvasElement.querySelector('img')).not.toBeInTheDocument()
    await expect(canvas.getByText('MB')).toBeInTheDocument()
  },
}
