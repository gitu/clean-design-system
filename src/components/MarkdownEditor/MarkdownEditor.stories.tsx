import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { MarkdownEditor } from './MarkdownEditor'
import { Field } from '../Field/Field'

const meta = {
  title: 'Forms/MarkdownEditor',
  component: MarkdownEditor,
  // Required props, so the type is satisfied and the docs table has
  // something to describe. Every story below drives its own state.
  args: { value: '', onChange: () => {} },
} satisfies Meta<typeof MarkdownEditor>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = `## The limits of density

Planners have spent a decade arguing that building upwards would ease pressure
on rents. The evidence from the last four years is **more equivocal** than
either side admits.

> Turnout was the lowest in nineteen years.

Three things changed at once:

1. The zoning rules were relaxed
2. Construction costs rose by a third
3. Interest rates followed

See the [full dataset](https://example.org/housing) for the working, or read
\`housing/density.md\` in the repository.`

/** Write and preview behind a switch — the default, and what a narrow column needs. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(SAMPLE)
    return (
      <div style={{ maxWidth: 720 }}>
        <Field label="Body" hint="Markdown. The preview shows the face it will publish in.">
          <MarkdownEditor value={value} onChange={setValue} />
        </Field>
      </div>
    )
  },
}

/**
 * The toolbar works on the selection, and the shortcuts work on it too.
 *
 * Asserted rather than described: select a word, press the bold button, and the
 * markers land around *that word* with it still selected — then press again and
 * they come off. An editor where the second press gives you `****word****` is
 * one people stop trusting after exactly one try.
 */
export const Toolbar: Story = {
  render: () => {
    const [value, setValue] = useState('The regulator now faces a question.')
    return (
      <div style={{ maxWidth: 720 }}>
        <Field label="Body">
          <MarkdownEditor value={value} onChange={setValue} preview="off" rows={5} />
        </Field>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const area = canvas.getByRole('textbox') as HTMLTextAreaElement

    area.focus()
    area.setSelectionRange(4, 13) // "regulator"
    await userEvent.click(canvas.getByRole('button', { name: /^Bold/ }))
    // `waitFor`, not a bare read: the value goes back through React, so the
    // textarea holds the old string for a tick after the click resolves.
    await waitFor(() => expect(area.value).toBe('The **regulator** now faces a question.'))

    // The selection survives the edit, still on the same word — which is what
    // makes toggling off possible at all.
    await expect(area.value.slice(area.selectionStart, area.selectionEnd)).toBe('regulator')

    // Toggling off is the half that gets forgotten.
    await userEvent.click(canvas.getByRole('button', { name: /^Bold/ }))
    await waitFor(() => expect(area.value).toBe('The regulator now faces a question.'))

    // Line commands take the whole line, wherever the caret sits in it.
    area.setSelectionRange(20, 20)
    await userEvent.click(canvas.getByRole('button', { name: 'Quote' }))
    await waitFor(() => expect(area.value).toBe('> The regulator now faces a question.'))
  },
}

/** Both panes at once, for a wide editor where the preview earns its column. */
export const Split: Story = {
  render: () => {
    const [value, setValue] = useState(SAMPLE)
    return (
      <div style={{ maxWidth: 980 }}>
        <Field label="Body">
          <MarkdownEditor value={value} onChange={setValue} preview="split" rows={16} />
        </Field>
      </div>
    )
  },
}

/**
 * A comment box: three commands, no preview, a limit.
 *
 * The limit is shown, not enforced. Truncating somebody's sentence at 280
 * characters to hold a rule loses their work to save a validation message —
 * the count turns red and the form's own validation decides what to do.
 */
export const Compact: Story = {
  render: () => {
    const [value, setValue] = useState(
      'Rerun the judged set before this ships — the last change moved four queries and nobody noticed for a week.'
    )
    return (
      <div style={{ maxWidth: 520 }}>
        <Field label="Note">
          <MarkdownEditor
            value={value}
            onChange={setValue}
            commands={['bold', 'italic', 'link']}
            preview="off"
            rows={3}
            maxLength={100}
            hint="Visible to everyone with access."
          />
        </Field>
      </div>
    )
  },
}

/** Empty, invalid and disabled — the three states a form actually puts it in. */
export const States: Story = {
  // WCAG 2.2 SC 1.4.3 exempts text that is part of an inactive control, and a
  // disabled row is the point of this story — so the contrast rule is scoped
  // away from it rather than switched off wholesale. Same as `Input`.
  parameters: { a11y: { context: { exclude: ['.is-disabled'] } } },
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <Field label="Empty">
        <MarkdownEditor value="" onChange={() => {}} rows={3} placeholder="Start writing…" />
      </Field>
      <Field label="Summary" error="A summary is required before publication.">
        <MarkdownEditor value="" onChange={() => {}} rows={3} />
      </Field>
      <Field label="Locked" disabled>
        <MarkdownEditor value="Embargoed until the review closes." onChange={() => {}} rows={3} disabled />
      </Field>
    </div>
  ),
}
