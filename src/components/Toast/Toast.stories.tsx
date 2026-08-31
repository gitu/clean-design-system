import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ToastProvider, useToast } from './Toast'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  parameters: { layout: 'centered' },
  // Every story supplies its own provider, because the whole point of these is
  // what the provider does with a message over time.
  args: { children: null },
} satisfies Meta<typeof ToastProvider>

export default meta
type Story = StoryObj<typeof meta>

function Trigger({
  label,
  message,
}: {
  label: string
  message: Parameters<ReturnType<typeof useToast>['toast']>[0]
}) {
  const { toast } = useToast()
  return (
    <Button variant="secondary" onClick={() => toast(message)}>
      {label}
    </Button>
  )
}

/**
 * A plain confirmation clears itself.
 *
 * This is the overwhelming majority of what an application sends here —
 * "Copied", "Saved", "Role updated" — and before it auto-dismissed they simply
 * accumulated until the reader swept them away by hand. The duration is short
 * in this story so the assertion does not sit waiting six seconds.
 */
export const DismissesItself: Story = {
  render: () => (
    <ToastProvider duration={400}>
      <Trigger label="Save" message={{ title: 'Saved' }} />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))

    const body = within(document.body)
    await expect(await body.findByText('Saved')).toBeInTheDocument()
    await waitFor(() => expect(body.queryByText('Saved')).toBeNull(), { timeout: 3000 })
  },
}

/**
 * One carrying an action does not.
 *
 * Taking an "Undo" away on a timer is worse than never offering it: the reader
 * looks up, the offer is gone, and the thing it would have undone is not.
 */
export const KeepsAnActionableMessage: Story = {
  render: () => (
    <ToastProvider duration={200}>
      <Trigger
        label="Delete"
        message={{ title: 'Property deleted', action: { label: 'Undo', onClick: () => {} } }}
      />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }))

    const body = within(document.body)
    await expect(await body.findByText('Property deleted')).toBeInTheDocument()

    // Well past the duration, and still there. `findByText` rather than
    // `getByText`: stories share one document, and re-querying fresh avoids
    // latching onto a node another story has since emptied.
    await new Promise(resolve => setTimeout(resolve, 800))
    await expect(await body.findByText('Property deleted')).toBeInTheDocument()
    await expect(await body.findByRole('button', { name: 'Undo' })).toBeInTheDocument()
  },
}

/**
 * `duration: null` opts a single message out, for anything the reader has to
 * finish reading before it is safe to lose.
 */
export const HonoursAPerMessageDuration: Story = {
  render: () => (
    <ToastProvider duration={200}>
      <Trigger
        label="Warn"
        message={{ title: 'Import partially failed', tone: 'warning', duration: null }}
      />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Warn' }))

    const body = within(document.body)
    await expect(await body.findByText('Import partially failed')).toBeInTheDocument()
    await new Promise(resolve => setTimeout(resolve, 800))
    await expect(await body.findByText('Import partially failed')).toBeInTheDocument()
  },
}

/**
 * Pointing at the stack holds every timer, so a slow reader never loses the
 * message out from under them — which was the original objection to dismissing
 * on a timer at all.
 */
export const HoverHoldsTheTimer: Story = {
  render: () => (
    <ToastProvider duration={400}>
      <Trigger label="Save" message={{ title: 'Saved' }} />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))

    const body = within(document.body)
    const message = await body.findByText('Saved')
    // Hover the layer, not the text: the timers are held by the region.
    await userEvent.hover(message)

    await new Promise(resolve => setTimeout(resolve, 900))
    await expect(await body.findByText('Saved')).toBeInTheDocument()

    // And released, it goes.
    await userEvent.unhover(message)
    await waitFor(() => expect(body.queryByText('Saved')).toBeNull(), { timeout: 3000 })
  },
}

export const Tones: Story = {
  render: () => (
    <ToastProvider duration={null}>
      <Stack direction="row" gap={2}>
        <Trigger label="Default" message={{ title: 'Saved' }} />
        <Trigger label="Success" message={{ title: 'Import complete', tone: 'success' }} />
        <Trigger label="Warning" message={{ title: 'Partially imported', tone: 'warning' }} />
        <Trigger label="Danger" message={{ title: 'Import failed', tone: 'danger' }} />
      </Stack>
    </ToastProvider>
  ),
}
