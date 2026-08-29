import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  AppShell,
  Badge,
  Button,
  Checkbox,
  Divider,
  EmptyState,
  Field,
  Icon,
  Input,
  Panel,
  Progress,
  RangeFilter,
  ResultCard,
  ResultList,
  Stack,
  Tabs,
  Tag,
  Textarea,
  Toolbar,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { CalloutStandIn, DisclosureStandIn } from './StandIns'
import { Thumbnail } from './Thumbnail'
import {
  BRIEF_VERSIONS,
  LISTINGS,
  formatArea,
  formatCommentAt,
  formatListingDate,
  formatPrice,
  formatPropertyType,
  formatRooms,
} from './property-fixtures'

/**
 * The search brief: what the team is looking for, written down once so a
 * machine can go and look for it.
 *
 * This is the screen that makes the product more than a bookmark folder, and
 * the design problem in it is *trust*. An agent goes off and scrapes portals on
 * the team's behalf; the team has to be able to see why it proposed what it
 * proposed, what changed since last time, and what it would find if a
 * constraint were loosened. So the brief is versioned, every version says how
 * many candidates it found, and every candidate says which criteria it met.
 *
 * Reference for find-my-place's `BriefWizard` (362 lines),
 * `DiscoveredCandidates` (190) and `BriefVersionHistory` (120).
 */
const meta = {
  title: 'Patterns/Search brief',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** What the last scan turned up — a fixed set, as a scan's output is. */
const DISCOVERED = LISTINGS.slice(0, 4)

const CRITERIA = [
  { label: 'Zürich, Winterthur or Zug', met: true },
  { label: 'From 3.5 rooms', met: true },
  { label: 'Up to CHF 3,600', met: true },
  { label: 'Balcony or terrace', met: true },
  { label: 'Within 25 min of Hauptbahnhof', met: false },
]

/**
 * The brief itself, its history, and what the last scan turned up — one screen
 * rather than three, because the three are only useful next to each other.
 */
export const Brief: Story = {
  render: () => {
    const [tab, setTab] = useState('criteria')
    const [dismissed, setDismissed] = useState<string[]>([])

    // The scan found a fixed set; dismissing removes from it rather than
    // pulling the next listing up to keep the count at four.
    const candidates = DISCOVERED.filter(l => !dismissed.includes(l.id))

    return (
      <AppShell header={<Masthead brand="findmyplace_" section="Search brief" />} maxWidth="64rem">
        <Stack gap={5} style={{ paddingBlock: 'var(--cds-space-5)' }}>
          <Stack direction="row" gap={4} justify="between" align="baseline" wrap>
            <Stack gap={2}>
              <span className="cds-kicker">Version 4 · updated by Nina on 22 August</span>
              <h1 className="cds-headline" style={{ margin: 0 }}>
                Somewhere with a balcony
              </h1>
            </Stack>
            <Badge tone="success" dot>
              Scanning nightly
            </Badge>
          </Stack>

          <CalloutStandIn
            tone="info"
            title="Last scan found 6 new listings, 31 minutes ago"
            actions={
              <Button size="sm" variant="secondary" iconStart={<Icon name="refresh" size={14} />}>
                Scan now
              </Button>
            }
          >
            Four portals, capped at 40 search pages a day. The cap resets at
            midnight and 12 pages are left.
          </CalloutStandIn>

          <Tabs
            value={tab}
            onChange={setTab}
            label="Brief sections"
            items={[
              { value: 'criteria', label: 'Criteria' },
              { value: 'candidates', label: 'Candidates', count: candidates.length },
              { value: 'history', label: 'History', count: BRIEF_VERSIONS.length },
            ]}
          >
            {tab === 'criteria' && (
              <Stack gap={5} style={{ paddingTop: 'var(--cds-space-4)' }}>
                <Panel variant="ruled" title="Where">
                  <Stack gap={4}>
                    <Field
                      label="Places"
                      hint="Cities, cantons or postcodes. The scan searches each one separately."
                    >
                      <Stack direction="row" gap={2} wrap>
                        <Tag onRemove={() => {}} removeLabel="Remove Zürich">
                          Zürich
                        </Tag>
                        <Tag onRemove={() => {}} removeLabel="Remove Winterthur">
                          Winterthur
                        </Tag>
                        <Tag onRemove={() => {}} removeLabel="Remove Zug">
                          Zug
                        </Tag>
                        <Button size="sm" variant="ghost" iconStart={<Icon name="plus" size={14} />}>
                          Add a place
                        </Button>
                      </Stack>
                    </Field>
                    <Field
                      label="Commute"
                      hint="Measured to Zürich Hauptbahnhof by public transport, at 08:00 on a weekday."
                    >
                      <Input type="number" suffix="min" defaultValue="25" />
                    </Field>
                  </Stack>
                </Panel>

                <Panel variant="ruled" title="What">
                  <Stack gap={4}>
                    <Field label="Rent per month" hint="Excluding service charges.">
                      <RangeFilter
                        type="number"
                        unit="CHF"
                        applyOn="blur"
                        defaultValue={{ min: '2400', max: '3600' }}
                      />
                    </Field>
                    <Field label="Rooms">
                      <RangeFilter type="number" applyOn="blur" defaultValue={{ min: '3.5', max: '' }} />
                    </Field>
                    <Field label="Living space">
                      <RangeFilter
                        type="number"
                        unit="m²"
                        applyOn="blur"
                        defaultValue={{ min: '80', max: '' }}
                      />
                    </Field>
                    <Field label="Must have">
                      <Stack direction="row" gap={6} wrap>
                        <Checkbox label="Balcony or terrace" defaultChecked />
                        <Checkbox label="Lift" />
                        <Checkbox label="Parking" />
                        <Checkbox label="Pets allowed" />
                      </Stack>
                    </Field>
                  </Stack>
                </Panel>

                <Panel
                  variant="ruled"
                  title="In your own words"
                  description="Read by the agent alongside the numbers above. Say what a list of constraints cannot."
                >
                  <Textarea
                    rows={4}
                    defaultValue="Quiet matters more than central. We would rather be twenty minutes out with a garden than five minutes out on a main road. No ground floor."
                  />
                </Panel>

                <Toolbar
                  border="top"
                  sticky
                  label="Save the brief"
                  end={
                    <>
                      <Button variant="ghost">Discard</Button>
                      <Button variant="primary">Save as version 5</Button>
                    </>
                  }
                >
                  <span className="cds-body-sm cds-text-subtle">
                    Saving starts a fresh scan across all four portals.
                  </span>
                </Toolbar>
              </Stack>
            )}

            {tab === 'candidates' && (
              <Stack gap={4} style={{ paddingTop: 'var(--cds-space-4)' }}>
                <p className="cds-body-sm cds-text-subtle" style={{ margin: 0 }}>
                  Found by the last scan and not yet triaged. Keeping one moves it
                  into Properties; dismissing it stops it coming back.
                </p>
                {candidates.length === 0 ? (
                  <EmptyState
                    title="Nothing left to look at"
                    description="Every candidate from the last scan has been kept or dismissed."
                    actions={<Button variant="secondary" onClick={() => setDismissed([])}>Undo all</Button>}
                  />
                ) : (
                  <ResultList label="Discovered candidates">
                    {candidates.map(listing => (
                      <ResultCard
                        key={listing.id}
                        title={listing.title}
                        titleLevel={2}
                        snippet={listing.snippet}
                        kicker={`${formatPropertyType(listing.propertyType)} · ${listing.portal}`}
                        href="#"
                        leading={<Thumbnail count={listing.imageCount} label={listing.title} />}
                        meta={[
                          <span key="p" className="cds-numeric">
                            {formatPrice(listing.price, listing.listingType)}
                          </span>,
                          <span key="r" className="cds-numeric">
                            {formatRooms(listing.rooms)}
                          </span>,
                          <span key="a" className="cds-numeric">
                            {formatArea(listing.livingSpace)}
                          </span>,
                          listing.city,
                          formatListingDate(listing.listedAt),
                        ]}
                        tags={
                          <Badge size="sm" tone={listing.briefMatch > 0.8 ? 'success' : 'neutral'}>
                            {Math.round(listing.briefMatch * 100)}% match
                          </Badge>
                        }
                        trailing={
                          <Stack direction="row" gap={2}>
                            <Button size="sm" variant="primary">
                              Keep
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDismissed(d => [...d, listing.id])}
                            >
                              Dismiss
                            </Button>
                          </Stack>
                        }
                      />
                    ))}
                  </ResultList>
                )}
              </Stack>
            )}

            {tab === 'history' && (
              <Stack gap={4} style={{ paddingTop: 'var(--cds-space-4)' }}>
                <p className="cds-body-sm cds-text-subtle" style={{ margin: 0 }}>
                  Each version records what changed and how much it found. A brief
                  that keeps finding nothing is usually a brief that is too tight,
                  and this is where that becomes visible.
                </p>
                <div>
                  {BRIEF_VERSIONS.map((version, i) => (
                    <DisclosureStandIn
                      key={version.id}
                      defaultOpen={i === 0}
                      summary={
                        <Stack direction="row" gap={3} align="baseline" wrap>
                          <span className="cds-label">Version {version.version}</span>
                          <span className="cds-body-sm cds-text-subtle">
                            {version.author} · {formatCommentAt(version.at)}
                          </span>
                        </Stack>
                      }
                      meta={
                        <span className="cds-numeric">{version.candidatesFound} found</span>
                      }
                    >
                      <Stack gap={3}>
                        <p className="cds-body-sm" style={{ margin: 0, maxWidth: 'var(--cds-measure)' }}>
                          {version.summary}
                        </p>
                        <Stack direction="row" gap={2}>
                          <Button size="sm" variant="secondary">
                            Compare with version {version.version + 1}
                          </Button>
                          {i !== 0 && (
                            <Button size="sm" variant="ghost">
                              Restore
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </DisclosureStandIn>
                  ))}
                </div>
              </Stack>
            )}
          </Tabs>
        </Stack>
      </AppShell>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('candidates can be dismissed and the count follows', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: /candidates/i }))
      const before = canvas.getAllByRole('listitem').length
      await userEvent.click(canvas.getAllByRole('button', { name: 'Dismiss' })[0]!)
      await expect(canvas.getAllByRole('listitem')).toHaveLength(before - 1)
    })
  },
}

/**
 * How well one property met the brief, broken down.
 *
 * A single percentage is not enough to act on: 78% could mean "everything but
 * the commute" or "nothing but the price". The breakdown is what lets someone
 * decide whether to loosen a constraint or drop a listing.
 */
export const MatchBreakdown: Story = {
  name: 'Match breakdown',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="sb-page" style={{ maxWidth: '32rem' }}>
      <Panel
        variant="ruled"
        title="Brief match"
        description="Attic conversion above the Seefeld tramline"
      >
        <Stack gap={4}>
          <Progress
            label="Brief match"
            showLabel
            value={91}
            valueLabel="91%"
            tone="success"
          />
          <Divider spacing="sm" />
          <Stack gap={2}>
            {CRITERIA.map(criterion => (
              <Stack key={criterion.label} direction="row" gap={2} align="center">
                <span
                  style={{
                    color: criterion.met
                      ? 'var(--cds-color-success)'
                      : 'var(--cds-color-text-subtle)',
                    display: 'inline-flex',
                  }}
                >
                  <Icon name={criterion.met ? 'check' : 'close'} />
                </span>
                <span
                  className="cds-ui-sm"
                  style={{
                    color: criterion.met
                      ? 'var(--cds-color-text)'
                      : 'var(--cds-color-text-muted)',
                  }}
                >
                  {criterion.label}
                </span>
              </Stack>
            ))}
          </Stack>
          <CalloutStandIn tone="warning" title="One criterion missed">
            The commute is 31 minutes, six over the brief. Raising the limit to
            35 would bring in 14 more listings.
          </CalloutStandIn>
        </Stack>
      </Panel>
    </div>
  ),
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: {
    layout: 'padded',
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-search-brief--brief"
      theme={String(context.globals.theme ?? 'light')}
      caption="Search brief at 390 × 844"
    />
  ),
}
