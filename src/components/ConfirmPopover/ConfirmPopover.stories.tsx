import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { useState } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import { Stack } from '../Stack/Stack'
import type { PopoverTriggerProps } from '../Popover/Popover'
import { ConfirmPopover } from './ConfirmPopover'

const meta = {
  title: 'Layout/ConfirmPopover',
  component: ConfirmPopover,
  parameters: { layout: 'padded' },
  args: {
    title: 'Delete this saved search?',
    onConfirm: () => {},
    trigger: (props: PopoverTriggerProps) => (
      <Button {...props} variant="danger">
        Delete
      </Button>
    ),
  },
} satisfies Meta<typeof ConfirmPopover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ padding: '1rem 0 12rem' }}>
      <ConfirmPopover
        title="Remove this filter set?"
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={() => {}}
        trigger={props => (
          <Button {...props} variant="danger" iconStart={<Icon name="close" size={14} />}>
            Remove
          </Button>
        )}
      />
    </div>
  ),
}

/** In a row, which is the case it exists for. */
export const InAList: Story = {
  name: 'In a list',
  render: () => {
    const [rows, setRows] = useState(['Banking consolidation', 'Referendum turnout', 'Rail freight'])
    return (
      <div style={{ maxWidth: '32rem', padding: '1rem 0 12rem' }}>
        <Stack gap={0} dividers>
          {rows.map(row => (
            <Stack
              key={row}
              direction="row"
              gap={3}
              align="center"
              style={{ paddingBlock: 'var(--cds-space-2)' }}
            >
              <span className="cds-ui-sm" style={{ flex: 1 }}>{row}</span>
              <ConfirmPopover
                title={`Delete “${row}”?`}
                description="Saved searches cannot be restored."
                confirmLabel="Delete"
                cancelLabel="Keep"
                onConfirm={() => setRows(current => current.filter(r => r !== row))}
                trigger={props => (
                  <IconButton {...props} icon={<Icon name="close" />} label={`Delete ${row}`} size="sm" bare />
                )}
              />
            </Stack>
          ))}
        </Stack>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('focus lands on cancel, not on the destructive button', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete Referendum turnout' }))
      // `findBy` rather than `getBy`: focus is moved in an animation frame, so
      // asserting straight after the click races it.
      await expect(await canvas.findByRole('button', { name: 'Keep' })).toHaveFocus()
    })

    await step('confirming removes the row', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))
      await expect(canvas.queryByText('Referendum turnout')).not.toBeInTheDocument()
    })
  },
}

/** `tone="default"` for a question that is merely a question. */
export const Tones: Story = {
  render: () => (
    <Stack direction="row" gap={4} style={{ padding: '1rem 0 12rem' }}>
      <ConfirmPopover
        tone="default"
        title="Re-run this import?"
        description="It last ran four minutes ago."
        confirmLabel="Re-run"
        onConfirm={() => {}}
        trigger={props => <Button {...props} variant="secondary">Re-run</Button>}
      />
      <ConfirmPopover
        tone="danger"
        title="Delete permanently?"
        confirmLabel="Delete"
        onConfirm={() => {}}
        trigger={props => <Button {...props} variant="danger">Delete</Button>}
      />
    </Stack>
  ),
}
