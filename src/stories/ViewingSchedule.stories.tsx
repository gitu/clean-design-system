import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  DataTable,
  Divider,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Input,
  Panel,
  SegmentedControl,
  Stack,
  Textarea,
  Toolbar,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { ConfirmStandIn, PopoverStandIn } from './StandIns'
import {
  COMMENTS,
  VIEWINGS,
  formatCommentAt,
  formatViewingAt,
  type Viewing,
} from './property-fixtures'

/**
 * Viewings, and the argument the team has about them afterwards.
 *
 * Two things here that the rest of the patterns do not have to deal with.
 *
 * **Time is wall-clock.** A viewing at 18:30 is at 18:30, and turning that into
 * an instant means choosing a zone at the moment of entry and being wrong at
 * the next clock change. The fixtures store `YYYY-MM-DDTHH:mm` with no zone,
 * which is the same decision `TimeInput` and `DateTimeInput` make.
 *
 * **The discussion is between people, not with a model.** It looks superficially
 * like the `Chat*` family and is deliberately not built from it: `ChatMessage`
 * models an assistant's turn — a thing it *did*, with tool calls and artefacts
 * — and a colleague saying "the windows are single-glazed" is a paragraph with
 * a name on it. `Panel`, `Divider` and `Avatar` are the whole of what it needs.
 *
 * Reference for find-my-place's `viewings/index.tsx` (533 lines) and the
 * `Timeline` / `CommentEntry` / `CommentComposer` trio.
 */
const meta = {
  title: 'Patterns/Viewing schedule',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function statusTone(status: Viewing['status']) {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'cancelled':
    case 'no_show':
      return 'danger' as const
    default:
      return 'info' as const
  }
}

/**
 * The log-a-viewing form, anchored to the button that opens it.
 *
 * A modal would be wrong here: this is three fields, entered while looking at
 * the row it belongs to, and taking the page away to ask for them loses the
 * context that makes them easy to fill in.
 */
function LogViewing({ onLog }: { onLog: () => void }) {
  return (
    <PopoverStandIn
      label="Log a viewing"
      align="end"
      width="21rem"
      trigger={props => (
        <Button {...props} size="sm" variant="primary" iconStart={<Icon name="plus" size={14} />}>
          Log a viewing
        </Button>
      )}
    >
      {close => (
        <Stack gap={3}>
          <span className="cds-label">Log a viewing</span>
          <Field label="When">
            {/* A native datetime-local rather than `DateTimeInput`, only
                because the system's own control is not vendored into this
                pattern's dependency list. The real screen should use it. */}
            <Input type="datetime-local" defaultValue="2026-09-02T18:30" />
          </Field>
          <Field label="Who went">
            <Input defaultValue="Both of us" />
          </Field>
          <Field label="Notes" hint="What you would forget by tomorrow.">
            <Textarea rows={3} />
          </Field>
          <Stack direction="row" gap={2} justify="end">
            <Button size="sm" variant="ghost" onClick={() => close()}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                close(false)
                onLog()
              }}
            >
              Log it
            </Button>
          </Stack>
        </Stack>
      )}
    </PopoverStandIn>
  )
}

export const Schedule: Story = {
  render: () => {
    const [scope, setScope] = useState('upcoming')
    const [cancelled, setCancelled] = useState<string[]>([])
    const [logged, setLogged] = useState(0)

    const rows = VIEWINGS.filter(v => {
      if (cancelled.includes(v.id)) return scope === 'past'
      return scope === 'upcoming' ? v.status === 'scheduled' : v.status !== 'scheduled'
    })

    const columns: Array<TableColumn<Viewing>> = [
      {
        key: 'at',
        header: 'When',
        width: '11rem',
        sortable: true,
        cell: row => <span className="cds-numeric">{formatViewingAt(row.at)}</span>,
      },
      {
        key: 'listing',
        header: 'Property',
        cell: row => (
          <a className="cds-link-quiet" href="#">
            {row.listingTitle}
          </a>
        ),
      },
      { key: 'city', header: 'City', width: '7rem', hideBelow: 'md', cell: row => row.city },
      {
        key: 'attendee',
        header: 'Who',
        width: '8rem',
        hideBelow: 'md',
        cell: row => row.attendee,
      },
      {
        key: 'agent',
        header: 'Agent',
        width: '13rem',
        hideBelow: 'lg',
        cell: row => <span className="cds-body-sm cds-text-subtle">{row.agent}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        width: '8rem',
        cell: row => {
          const status = cancelled.includes(row.id) ? 'cancelled' : row.status
          return (
            <Badge size="sm" tone={statusTone(status)}>
              {status.replace('_', ' ')}
            </Badge>
          )
        },
      },
      {
        key: 'actions',
        // Not an empty string: a `<th>` with no text is unreachable by screen
        // reader, and axe is right to fail it. An actions column still needs a
        // name — it just does not need to be seen.
        header: <span className="cds-sr-only">Actions</span>,
        width: '3rem',
        cell: row =>
          row.status === 'scheduled' && !cancelled.includes(row.id) ? (
            <ConfirmStandIn
              title="Cancel this viewing? The agent is not told."
              confirmLabel="Cancel it"
              cancelLabel="Keep it"
              onConfirm={() => setCancelled(c => [...c, row.id])}
              trigger={props => (
                <IconButton
                  {...props}
                  icon={<Icon name="close" />}
                  label={`Cancel the viewing on ${formatViewingAt(row.at)}`}
                  size="sm"
                  bare
                />
              )}
            />
          ) : null,
      },
    ]

    return (
      <AppShell header={<Masthead brand="findmyplace_" section="Viewings" />} maxWidth="72rem">
        <Stack gap={5} style={{ paddingBlock: 'var(--cds-space-5)' }}>
          <h1 className="cds-headline" style={{ margin: 0 }}>
            Viewings
          </h1>

          <Toolbar
            border="both"
            label="Viewing filters"
            end={<LogViewing onLog={() => setLogged(n => n + 1)} />}
          >
            <SegmentedControl
              size="sm"
              label="Which viewings"
              value={scope}
              onChange={setScope}
              options={[
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' },
              ]}
            />
            {logged > 0 && (
              <span className="cds-body-sm cds-text-subtle" role="status">
                {logged} logged this session
              </span>
            )}
          </Toolbar>

          <DataTable
            label="Viewings"
            columns={columns}
            rows={rows}
            rowKey={row => row.id}
            stickyHeader
            empty={
              <EmptyState
                size="sm"
                title={scope === 'upcoming' ? 'Nothing booked' : 'No viewings yet'}
                description={
                  scope === 'upcoming'
                    ? 'Three properties are marked interested and have never been seen.'
                    : 'Viewings appear here once they have happened.'
                }
                actions={<Button variant="secondary">Show interested properties</Button>}
              />
            }
          />

          <Divider tone="strong" spacing="lg" />

          {/* Human discussion. Deliberately not the Chat family — see the file
              comment. A `Panel` and a rule per comment is all it is. */}
          <Panel
            variant="plain"
            title="After the Seefeld viewing"
            description="Three comments · last one on 15 August"
          >
            <Stack gap={0} dividers>
              {COMMENTS.map(comment => (
                <Stack
                  key={comment.id}
                  direction="row"
                  gap={3}
                  style={{ paddingBlock: 'var(--cds-space-4)' }}
                >
                  <Avatar name={comment.author} size="sm" tinted decorative />
                  <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" gap={2} align="baseline" wrap>
                      <span className="cds-label">{comment.author}</span>
                      <span className="cds-body-sm cds-text-subtle">
                        {formatCommentAt(comment.at)}
                      </span>
                    </Stack>
                    <p className="cds-body" style={{ margin: 0, maxWidth: 'var(--cds-measure)' }}>
                      {comment.body}
                    </p>
                    {comment.reactions && (
                      <Stack direction="row" gap={2}>
                        {comment.reactions.map(reaction => (
                          <Button key={reaction.emoji} size="sm" variant="secondary">
                            {reaction.emoji} {reaction.count}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>

            <Stack gap={2} style={{ paddingTop: 'var(--cds-space-4)' }}>
              <Field label="Add a comment">
                <Textarea rows={3} placeholder="What did you think?" />
              </Field>
              <Stack direction="row" gap={2} justify="end">
                <Button variant="primary">Post</Button>
              </Stack>
            </Stack>
          </Panel>
        </Stack>
      </AppShell>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('cancelling asks first, in place', async () => {
      const rows = canvas.getAllByRole('row')
      await userEvent.click(canvas.getAllByRole('button', { name: /^cancel the viewing/i })[0]!)
      await expect(
        canvas.getByText('Cancel this viewing? The agent is not told.')
      ).toBeInTheDocument()
      await userEvent.click(canvas.getByRole('button', { name: 'Cancel it' }))
      await expect(canvas.getAllByRole('row')).toHaveLength(rows.length - 1)
    })
  },
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: {
    layout: 'padded',
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-viewing-schedule--schedule"
      theme={String(context.globals.theme ?? 'light')}
      caption="Viewing schedule at 390 × 844"
    />
  ),
}
