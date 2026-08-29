import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Field } from '../Field/Field'
import { Stack } from '../Stack/Stack'
import { FileDrop } from './FileDrop'

const meta = {
  title: 'Forms/FileDrop',
  component: FileDrop,
  args: {
    label: 'Drop the listing PDF, or choose a file',
    hint: 'PDF, JPEG or PNG, up to 20 MB each',
  },
} satisfies Meta<typeof FileDrop>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div style={{ maxWidth: '34rem' }}>
      <FileDrop {...args} accept=".pdf,.jpg,.jpeg,.png" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('it is a real file input, named by its label', async () => {
      const input = canvas.getByLabelText(/drop the listing pdf/i)
      await expect(input).toHaveAttribute('type', 'file')
      // In the tab order: the keyboard route to the file picker is the whole
      // reason the input is hidden this way rather than with display: none.
      await expect(input).not.toBeDisabled()
    })
  },
}

/** Inside a `Field`, which supplies the label, the error and the ARIA wiring. */
export const InAField: Story = {
  name: 'In a field',
  render: () => (
    <Stack gap={5} style={{ maxWidth: '34rem' }}>
      <Field label="Floor plans" hint="Dimensions are read from the PDF where present.">
        <FileDrop label="Drop plans here, or choose files" accept=".pdf,.png" />
      </Field>
      <Field label="Contract" error="The file is 34 MB. The limit is 20 MB." required>
        <FileDrop label="Drop the signed contract, or choose a file" />
      </Field>
    </Stack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: '34rem' }}>
      <FileDrop size="md" label="Drop files here, or choose from your computer" hint="Any format" />
      <FileDrop size="sm" label="Add more" />
      <FileDrop disabled label="Uploading — wait for the current batch" />
    </Stack>
  ),
}
