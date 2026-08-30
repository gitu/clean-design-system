import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { Button } from '../Button/Button'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { Stack } from '../Stack/Stack'
import { Panel } from '../Panel/Panel'
import { Icon } from '../Icon/Icon'

const meta = {
  title: 'Layout/ThemeProvider',
  component: ThemeProvider,
  parameters: { layout: 'padded' },
  args: { children: null },
} satisfies Meta<typeof ThemeProvider>

export default meta
type Story = StoryObj<typeof meta>

function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  return (
    <Stack gap={4} style={{ maxWidth: 420 }}>
      <Panel variant="ruled" title="Theme">
        <Stack gap={3}>
          <SegmentedControl
            label="Theme"
            value={theme}
            onChange={value => setTheme(value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
          <p className="cds-body-sm">
            Setting <strong>{theme}</strong>, currently showing <strong>{resolvedTheme}</strong>.
          </p>
          <Button variant="secondary" size="sm" onClick={toggleTheme} iconStart={<Icon name="refresh" size={14} />}>
            Toggle
          </Button>
        </Stack>
      </Panel>
    </Stack>
  )
}

/**
 * The storybook toolbar already wraps every story in a ThemeProvider, so this
 * story reads the surrounding one rather than nesting a second.
 */
export const Switching: Story = {
  render: () => <ThemeSwitcher />,
}
