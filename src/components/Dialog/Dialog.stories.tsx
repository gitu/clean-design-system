import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Dialog } from './Dialog'
import { Button } from '../Button/Button'
import { Field } from '../Field/Field'
import { Input } from '../Input/Input'
import { Stack } from '../Stack/Stack'
import { Textarea } from '../Textarea/Textarea'

const meta = {
  title: 'Layout/Dialog',
  component: Dialog,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: () => {} },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A dialog holding a form, which is the case that broke.
 *
 * `onClose` is written inline here, as every caller writes it, so its identity
 * changes on every render. When that identity was in the modal layer's
 * dependency list the whole layer was torn down and rebuilt on each keystroke,
 * and the cleanup's focus restore pulled focus back to the element that opened
 * the dialog — so exactly one character was ever typed. The `play` function
 * types several and checks they all arrive.
 *
 * It runs first in this file deliberately. Stories share one document, and
 * tearing down a previous dialog drops focus to `body` after this one's
 * focus-on-open has already run — so the `toHaveFocus` check below only holds
 * when nothing has opened before it. That is a property of the test harness,
 * not of Dialog.
 */
export const WithAForm: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [name, setName] = useState('')
    const [notes, setNotes] = useState('')
    return (
      <div style={{ padding: 24, minHeight: 520 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Save this search"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Save
              </Button>
            </>
          }
        >
          <Stack gap={4}>
            <Field label="Name">
              <Input
                data-autofocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Two bedrooms, Kreis 6"
              />
            </Field>
            <Field label="Notes" hint="Only your team can see these.">
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </Field>
          </Stack>
        </Dialog>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    // The dialog is portalled, so query the document rather than the canvas.
    const body = within(canvasElement.ownerDocument.body)
    const name = await body.findByLabelText('Name')

    await expect(name).toHaveFocus()

    await userEvent.type(name, 'Kreis 6')
    await expect(name).toHaveValue('Kreis 6')

    // And focus must survive typing into a *second* field, which is where the
    // focus restore used to send it back to the opener.
    const notes = body.getByLabelText('Notes')
    await userEvent.type(notes, 'Near the tram')
    await expect(notes).toHaveValue('Near the tram')
  },
}

export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 420 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Publish this brief?"
          description="Everyone on the team will be notified."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setOpen(false)}>
                Publish
              </Button>
            </>
          }
        >
          <p className="cds-body" style={{ margin: 0 }}>
            The current criteria are saved as a new version first, so this is
            reversible from the version history.
          </p>
        </Dialog>
      </div>
    )
  },
}

export const Danger: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 380 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Open
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          tone="danger"
          title="Delete this property?"
          description="It is removed for everyone on the team, and this cannot be undone."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </>
          }
        />
      </div>
    )
  },
}
