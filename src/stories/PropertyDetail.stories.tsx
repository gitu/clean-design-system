import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  Dialog,
  Divider,
  Icon,
  IconButton,
  Menu,
  Panel,
  Popover,
  Stack,
  Tabs,
  Tag,
  Toolbar,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { Rating } from './Rating'
import { Thumbnail } from './Thumbnail'
import {
  COMMENTS,
  FEATURED_LISTING,
  VIEWINGS,
  formatArea,
  formatCommentAt,
  formatListingDate,
  formatMarketStatus,
  formatPrice,
  formatPropertyType,
  formatRooms,
  formatTriageStatus,
  formatViewingAt,
  marketStatusTone,
  triageTone,
} from './property-fixtures'

/**
 * One property, with everything the team has accumulated about it.
 *
 * The structural decision here is that the *facts* go in the aside and the
 * *work* goes in the tabs. A price, a room count and a status are what someone
 * came to check; they should not move when a tab changes, and they should not
 * be four scroll-lengths from the photographs. Everything the team produced —
 * documents, plans, viewings, opinions — is tabbed, because it grows without
 * bound and nobody reads all of it at once.
 *
 * `asideCollapse="stack"` rather than the default `hide`: on a phone the facts
 * move below the content instead of being thrown away, since they exist nowhere
 * else on the screen.
 */
const meta = {
  title: 'Patterns/Property detail',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const listing = FEATURED_LISTING

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'location', label: 'Location' },
  { value: 'documents', label: 'Documents', count: 4 },
  { value: 'plans', label: 'Plans', count: 2 },
  { value: 'viewings', label: 'Viewings', count: 1 },
  { value: 'evaluations', label: 'Evaluations' },
  { value: 'activity', label: 'Activity', count: 11 },
]

/**
 * A specification table.
 *
 * A `<dl>` on tokens rather than a component: the system has `DataTable` for
 * many records of the same shape, and nothing for one record's many fields.
 * Whether that is a gap (`DescriptionList`) or correctly left to the product is
 * one of the questions this pattern exists to answer — at eighteen lines of
 * layout glue, the honest answer looks like "leave it".
 */
function Specs({ items }: { items: Array<[string, string]> }) {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--cds-space-2) var(--cds-space-4)',
        margin: 0,
      }}
    >
      {items.map(([term, value]) => (
        <div key={term} style={{ display: 'contents' }}>
          <dt className="cds-label" style={{ color: 'var(--cds-color-text-subtle)' }}>
            {term}
          </dt>
          <dd className="cds-ui-sm cds-numeric" style={{ margin: 0, textAlign: 'right' }}>
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** The photo strip. Scrolls sideways rather than wrapping — a gallery is a reel. */
function ImageStrip({ count }: { count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--cds-space-2)',
        overflowX: 'auto',
        paddingBottom: 'var(--cds-space-2)',
      }}
    >
      {Array.from({ length: Math.min(count, 6) }, (_, i) => (
        <Thumbnail key={i} count={i + 1} label={`${listing.title}, photograph ${i + 1}`} />
      ))}
    </div>
  )
}

export const FullDetail: Story = {
  name: 'Full detail',
  render: () => {
    const [tab, setTab] = useState('overview')
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [triage, setTriage] = useState(listing.triageStatus)

    const aside = (
      <Stack gap={5}>
        <Stack gap={2}>
          <span className="cds-display cds-numeric" style={{ fontSize: 'var(--cds-text-2xl)' }}>
            {formatPrice(listing.price, listing.listingType)}
          </span>
          <Stack direction="row" gap={2} wrap align="center">
            <Badge tone={triageTone(triage)} dot>
              {formatTriageStatus(triage)}
            </Badge>
            <Badge variant="outline" tone={marketStatusTone(listing.status)}>
              {formatMarketStatus(listing.status)}
            </Badge>
          </Stack>
        </Stack>

        <Divider />

        <Specs
          items={[
            ['Rooms', formatRooms(listing.rooms)],
            ['Living space', formatArea(listing.livingSpace)],
            ['Floor', `${listing.floor} of 4`],
            ['Built', String(listing.yearBuilt)],
            ['Type', formatPropertyType(listing.propertyType)],
            ['Listed', formatListingDate(listing.listedAt)],
            ['Portal', listing.portal],
          ]}
        />

        <Divider />

        <Stack gap={2}>
          <span className="cds-label" style={{ color: 'var(--cds-color-text-subtle)' }}>
            Team rating
          </span>
          <Rating value={listing.rating} />
        </Stack>

        <Stack gap={2}>
          <span className="cds-label" style={{ color: 'var(--cds-color-text-subtle)' }}>
            Brief match
          </span>
          <span className="cds-numeric cds-ui">{Math.round(listing.briefMatch * 100)}%</span>
        </Stack>

        <Divider />

        <Stack gap={2}>
          <Button variant="primary" fullWidth iconStart={<Icon name="calendar" size={14} />}>
            Book a viewing
          </Button>
          <Button variant="secondary" fullWidth iconStart={<Icon name="bookmark" size={14} />}>
            Add to a list
          </Button>
          <Button
            variant="ghost"
            fullWidth
            iconStart={<Icon name="external" size={14} />}
          >
            Open on {listing.portal}
          </Button>
        </Stack>
      </Stack>
    )

    return (
      <>
        <AppShell
          header={<Masthead brand="findmyplace_" section="Properties" />}
          aside={aside}
          asideCollapse="stack"
        >
          <Stack gap={5} style={{ paddingBlock: 'var(--cds-space-5)' }}>
            <Breadcrumbs
              items={[
                { label: 'Properties', href: '#' },
                { label: 'Zürich', href: '#' },
                { label: listing.title },
              ]}
            />

            <Stack gap={3}>
              <span className="cds-kicker">
                {formatPropertyType(listing.propertyType)} · {listing.street}, {listing.city}
              </span>
              <h1 className="cds-headline" style={{ margin: 0 }}>
                {listing.title}
              </h1>
            </Stack>

            <Toolbar
              border="both"
              label="Property actions"
              end={
                <Menu
                  align="end"
                  label="More actions"
                  trigger={props => (
                    <IconButton {...props} icon={<Icon name="more" />} label="More actions" />
                  )}
                  items={[
                    { id: 'copy', label: 'Duplicate', icon: <Icon name="document" size={14} /> },
                    { id: 'share', label: 'Share a read-only link', icon: <Icon name="link" size={14} /> },
                    { id: 'archive', label: 'Archive', icon: <Icon name="bookmark" size={14} /> },
                    {
                      id: 'delete',
                      label: 'Delete permanently',
                      tone: 'danger',
                      onSelect: () => setDeleteOpen(true),
                    },
                  ]}
                />
              }
            >
              {/* Triage is the one control that belongs in the bar rather than
                  the aside: it is the thing a reader changes *while* reading,
                  and the aside is for facts they only consult. */}
              <Popover
                label="Set triage status"
                trigger={props => (
                  <Button {...props} size="sm" variant="secondary" iconEnd={<Icon name="chevron-down" size={14} />}>
                    {formatTriageStatus(triage)}
                  </Button>
                )}
              >
                {close => (
                  <Stack gap={1}>
                    {(['new', 'interested', 'applied', 'rejected'] as const).map(status => (
                      <Button
                        key={status}
                        size="sm"
                        variant="ghost"
                        fullWidth
                        aria-pressed={triage === status}
                        onClick={() => {
                          setTriage(status)
                          close()
                        }}
                      >
                        {formatTriageStatus(status)}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Popover>
              {/* No icon: the set has no pencil, and borrowing the `bold` glyph
                  for "edit" — which is what a hurry would do — puts a letter B
                  on the button. find-my-place keeps lucide for exactly this
                  class of domain glyph. */}
              <Button size="sm" variant="ghost">
                Edit
              </Button>
              <Button size="sm" variant="ghost" iconStart={<Icon name="refresh" size={14} />}>
                Re-import
              </Button>
            </Toolbar>

            <ImageStrip count={listing.imageCount} />

            <Tabs items={TABS} value={tab} onChange={setTab} label="Property sections">
              {tab === 'overview' && (
                <Stack gap={5} style={{ paddingTop: 'var(--cds-space-4)' }}>
                  <p className="cds-body" style={{ maxWidth: 'var(--cds-measure)' }}>
                    {listing.snippet}
                  </p>
                  <Panel variant="ruled" title="Features">
                    <Stack direction="row" gap={2} wrap>
                      {['Balcony', 'Lift', 'Cellar', 'Dishwasher', 'Parquet', 'Bicycle store'].map(f => (
                        <Tag key={f}>{f}</Tag>
                      ))}
                    </Stack>
                  </Panel>
                  <Panel variant="ruled" title="Latest discussion" actions={<Button size="sm" variant="ghost">Open</Button>}>
                    <Stack gap={3} dividers>
                      {COMMENTS.slice(-2).map(comment => (
                        <Stack key={comment.id} gap={1}>
                          <Stack direction="row" gap={2} align="baseline">
                            <span className="cds-label">{comment.author}</span>
                            <span className="cds-body-sm cds-text-subtle">
                              {formatCommentAt(comment.at)}
                            </span>
                          </Stack>
                          <p className="cds-body-sm" style={{ margin: 0, maxWidth: 'var(--cds-measure)' }}>
                            {comment.body}
                          </p>
                        </Stack>
                      ))}
                    </Stack>
                  </Panel>
                </Stack>
              )}

              {tab === 'viewings' && (
                <Stack gap={3} style={{ paddingTop: 'var(--cds-space-4)' }} dividers>
                  {VIEWINGS.filter(v => v.listingId === listing.id).map(v => (
                    <Stack key={v.id} gap={1}>
                      <Stack direction="row" gap={2} align="baseline" wrap>
                        <span className="cds-ui cds-numeric">{formatViewingAt(v.at)}</span>
                        <Badge size="sm" tone={v.status === 'completed' ? 'success' : 'neutral'}>
                          {v.status}
                        </Badge>
                      </Stack>
                      <span className="cds-body-sm cds-text-subtle">{v.agent}</span>
                      {v.note && (
                        <p className="cds-body-sm" style={{ margin: 0, maxWidth: 'var(--cds-measure)' }}>
                          {v.note}
                        </p>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}

              {tab !== 'overview' && tab !== 'viewings' && (
                <div style={{ paddingTop: 'var(--cds-space-4)' }}>
                  <Panel variant="sunken" title={TABS.find(t => t.value === tab)?.label}>
                    <p className="cds-body-sm" style={{ margin: 0 }}>
                      This tab's content is the product's own — a map, a document
                      list, a floor-plan canvas. The system's job stopped at the
                      frame around it.
                    </p>
                  </Panel>
                </div>
              )}
            </Tabs>
          </Stack>
        </AppShell>

        {/* A modal, not an inline confirm: this one cannot be undone, and
            `Dialog tone="danger"` is what the system reserves for that. The
            smaller confirmations elsewhere in the app want the popover shape
            instead. */}
        <Dialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          tone="danger"
          title="Delete this property?"
          description="The photographs, documents, viewings and the whole discussion go with it. This cannot be undone."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={() => setDeleteOpen(false)}>
                Delete permanently
              </Button>
            </>
          }
        >
          <p className="cds-body-sm" style={{ margin: 0 }}>
            {listing.title} — {listing.street}, {listing.city}
          </p>
        </Dialog>
      </>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the facts stay put while the tabs change', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: /viewings/i }))
      await expect(canvas.getByText('Living space')).toBeInTheDocument()
    })

    await step('triage can be changed from the bar', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /^interested$/i }))
      await userEvent.click(
        within(canvas.getByRole('dialog', { name: 'Set triage status' })).getByRole('button', {
          name: /rejected/i,
        })
      )
      await expect(canvas.getByRole('button', { name: /^rejected$/i })).toBeInTheDocument()
    })
  },
}

/**
 * The same screen at 390 × 844. The aside stacks under the content rather than
 * disappearing, because the price and the room count are the two things
 * somebody opening this on a phone came for.
 */
export const Mobile: Story = {
  name: 'Mobile',
  parameters: {
    layout: 'padded',
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-property-detail--full-detail"
      theme={String(context.globals.theme ?? 'light')}
      caption="Property detail at 390 × 844"
    />
  ),
}
