import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, userEvent, within } from 'storybook/test'
import { Slider } from './Slider'
import { Field } from '../Field/Field'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Forms/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  args: { min: 0, max: 100, step: 1 },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(60)
    return (
      <div style={{ maxWidth: 420 }}>
        <Field label="Weighting">
          <Slider
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            valueLabel={value}
          />
        </Field>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider', { name: 'Weighting' })

    // What this component is responsible for: being a real range input that
    // Field can name, that carries the bounds it was given, and that is in
    // the tab order — the keyboard behaviour follows from that and belongs to
    // the browser. It cannot be asserted here anyway: moving a range input
    // with an arrow key is a *default action*, which browsers only run for
    // trusted events, and `userEvent` dispatches synthetic ones.
    await expect(slider).toHaveAttribute('type', 'range')
    await expect(slider).toHaveAttribute('min', '0')
    await expect(slider).toHaveAttribute('max', '100')
    await expect(slider).toHaveValue('60')

    await userEvent.tab()
    await expect(slider).toHaveFocus()

    // The controlled wiring is ours, so drive it the way React would see it
    // and check the readout follows.
    await fireEvent.change(slider, { target: { value: '85' } })
    await expect(slider).toHaveValue('85')
    await expect(canvas.getByText('85')).toBeInTheDocument()
  },
}

/** Scoring, which is what a slider is actually good for. */
export const Scored: Story = {
  render: () => {
    const [scores, setScores] = useState({ light: 70, noise: 40, transport: 90 })
    return (
      <Stack gap={5} style={{ maxWidth: 420 }}>
        {(
          [
            ['light', 'Natural light'],
            ['noise', 'Quiet'],
            ['transport', 'Transport'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <Slider
              step={5}
              value={scores[key]}
              onChange={e => setScores(s => ({ ...s, [key]: Number(e.target.value) }))}
              valueLabel={scores[key]}
              minLabel="Poor"
              maxLabel="Excellent"
            />
          </Field>
        ))}
      </Stack>
    )
  },
}

export const Sizes: Story = {
  render: () => (
    <Stack gap={5} style={{ maxWidth: 420 }}>
      <Field label="Medium">
        <Slider defaultValue={40} valueLabel={40} />
      </Field>
      <Field label="Small">
        <Slider size="sm" defaultValue={40} valueLabel={40} />
      </Field>
    </Stack>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Locked" disabled>
        <Slider defaultValue={25} valueLabel={25} />
      </Field>
    </div>
  ),
}
