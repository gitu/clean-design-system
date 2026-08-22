import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from './Panel'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Layout/Panel',
  component: Panel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <Stack gap={6} style={{ maxWidth: 520 }}>
      <Panel title="Plain" description="No ground at all — the editorial default.">
        <p className="cds-body-sm">Rules and whitespace do the separating.</p>
      </Panel>
      <Panel variant="ruled" title="Ruled" description="A hairline box.">
        <p className="cds-body-sm">Use when a region must be unmistakably bounded.</p>
      </Panel>
      <Panel variant="sunken" title="Sunken" description="Recessed ground.">
        <p className="cds-body-sm">For wells, summaries and read-only detail.</p>
      </Panel>
    </Stack>
  ),
}

export const WithActionsAndFooter: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Panel
        variant="ruled"
        title="Saved search"
        description="Banking consolidation · 1,284 results"
        actions={<Button size="sm" variant="ghost">Edit</Button>}
        footer={
          <Stack direction="row" gap={2} justify="end">
            <Button size="sm" variant="ghost">Delete</Button>
            <Button size="sm" variant="primary">Run</Button>
          </Stack>
        }
      >
        <p className="cds-body-sm">
          section:finance AND published:[2020 TO 2024] NOT status:retracted
        </p>
      </Panel>
    </div>
  ),
}
