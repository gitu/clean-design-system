import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ThemeToggle } from './ThemeToggle'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { Stack } from '../Stack/Stack'

/**
 * The storybook decorator renders a *controlled* `ThemeProvider` so the toolbar
 * can pin the theme. A controlled provider ignores `setTheme`, so the toggle
 * would be inert — these stories nest their own uncontrolled one, scoped to the
 * subtree, and keep it out of `localStorage` so runs do not leak into another.
 */
function Demo({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider applyTo="element" storageKey={false}>
      {children}
    </ThemeProvider>
  )
}

const meta = {
  title: 'Layout/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

function Readout() {
  const { theme, resolvedTheme } = useTheme()
  return (
    <p className="cds-body-sm" data-testid="readout">
      setting <strong data-testid="setting">{theme}</strong> · showing{' '}
      <strong data-testid="resolved">{resolvedTheme}</strong>
    </p>
  )
}

export const Default: Story = {
  render: () => (
    <Demo>
      <Stack direction="row" gap={4} align="center">
        <ThemeToggle />
        <Readout />
      </Stack>
    </Demo>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Demo>
      <Stack direction="row" gap={3} align="center">
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
      <ThemeToggle variant="secondary" />
        <ThemeToggle bare />
      </Stack>
    </Demo>
  ),
}

/**
 * Three clicks and you are back where you started — which is the whole reason
 * this is not a two-state switch.
 *
 * The invariant asserted is the cycle's shape: whatever it starts on, three
 * presses return it there, and `system` is one of the three — so it is
 * reachable rather than a one-way door.
 */
export const CyclesBackToSystem: Story = {
  render: () => (
    <Demo>
      <Stack direction="row" gap={4} align="center">
        <ThemeToggle />
        <Readout />
      </Stack>
    </Demo>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    const setting = () => canvas.getByTestId('setting').textContent

    const start = setting()
    await userEvent.click(button)
    const second = setting()
    expect(second).not.toBe(start)

    await userEvent.click(button)
    const third = setting()
    expect(third).not.toBe(second)

    await userEvent.click(button)
    expect(setting()).toBe(start)

    // `system` has to be one of the three, or there is no way back to it.
    expect([start, second, third]).toContain('system')
  },
}
