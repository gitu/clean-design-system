import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  AppShell,
  Button,
  Checkbox,
  Divider,
  Field,
  Icon,
  Input,
  Panel,
  Progress,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Textarea,
  Toolbar,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { CalloutStandIn, FileDropStandIn } from './StandIns'
import { FEATURED_LISTING } from './property-fixtures'

/**
 * Getting a property into the system, which happens two ways and they are not
 * the same shape.
 *
 * **Import** is a URL and a wait: paste a portal listing, watch a scraper fill
 * the fields in, correct what it got wrong. **Manual entry** is a long form
 * nobody wants to fill in. The screen has to be honest about which one is
 * happening, because the failure modes are completely different — an import
 * fails at the network and a form fails at validation, and telling someone
 * "required field" when the real problem is that the portal returned a 403 is
 * the worst thing this screen can do.
 *
 * Reference for find-my-place's `PropertyEditForm` (874 lines) and
 * `PropertyImport` (176).
 */
const meta = {
  title: 'Patterns/Property intake',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'loft', label: 'Loft' },
  { value: 'studio', label: 'Studio' },
  { value: 'chalet', label: 'Chalet' },
]

const CANTONS = [
  { value: 'ZH', label: 'Zürich' },
  { value: 'BE', label: 'Bern' },
  { value: 'ZG', label: 'Zug' },
  { value: 'BS', label: 'Basel-Stadt' },
  { value: 'AG', label: 'Aargau' },
]

/**
 * The form, as it looks when a listing has been imported and is being checked
 * over. Grouped into panels because a flat list of twenty fields is unreadable,
 * and the groups are the ones the reader already has in their head: where it
 * is, how big, what it costs, what is in it.
 */
export const EditForm: Story = {
  name: 'Edit form',
  render: () => {
    const [dirty, setDirty] = useState(false)
    const [listingType, setListingType] = useState('rent')
    const [title, setTitle] = useState(FEATURED_LISTING.title)
    const [price, setPrice] = useState('3450')

    return (
      <AppShell header={<Masthead brand="findmyplace_" section="Edit property" />} maxWidth="56rem">
        <Stack gap={5} style={{ paddingBlock: 'var(--cds-space-5)' }}>
          <Stack gap={2}>
            <span className="cds-kicker">Seefeldstrasse 114, Zürich</span>
            <h1 className="cds-headline" style={{ margin: 0 }}>
              Edit property
            </h1>
          </Stack>

          <CalloutStandIn
            tone="info"
            title="Imported from Homegate on 2 August"
            actions={
              <Button size="sm" variant="secondary" iconStart={<Icon name="refresh" size={14} />}>
                Re-import
              </Button>
            }
          >
            Fields the importer filled in are marked. Re-importing overwrites
            them and leaves anything you typed alone.
          </CalloutStandIn>

          <Panel variant="ruled" title="The listing">
            <Stack gap={4}>
              <Field
                label="Title"
                required
                hint="What the team will see in the list. The portal's own headline is usually too long."
                action={
                  <span className="cds-body-sm cds-text-subtle cds-numeric">{title.length}/255</span>
                }
              >
                <Input
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value)
                    setDirty(true)
                  }}
                />
              </Field>

              <Field label="Listing type" required>
                <SegmentedControl
                  label="Listing type"
                  value={listingType}
                  onChange={value => {
                    setListingType(value)
                    setDirty(true)
                  }}
                  options={[
                    { value: 'rent', label: 'Rent' },
                    { value: 'sale', label: 'Sale' },
                    { value: 'auction', label: 'Auction' },
                  ]}
                />
              </Field>

              <Field label="Property type" required>
                <Select options={PROPERTY_TYPES} defaultValue="apartment" />
              </Field>

              <Field
                label="Description"
                hint="The portal's text, kept as it was. Edit it if it is misleading rather than merely long."
              >
                <Textarea rows={5} defaultValue={FEATURED_LISTING.snippet} />
              </Field>

              <Field label="Source URL" hint="Re-imports read from here.">
                <Input
                  mono
                  prefix="https://"
                  defaultValue="homegate.ch/rent/4001234567"
                  iconEnd={<Icon name="external" />}
                />
              </Field>
            </Stack>
          </Panel>

          <Panel variant="ruled" title="Where it is">
            <Stack gap={4}>
              <Field label="Street" required>
                <Input defaultValue={FEATURED_LISTING.street} />
              </Field>
              <Stack direction="row" gap={4} wrap>
                <Field label="Postcode" style={{ flex: '0 1 8rem' }}>
                  <Input defaultValue="8008" mono />
                </Field>
                <Field label="City" required style={{ flex: '1 1 12rem' }}>
                  <Input defaultValue={FEATURED_LISTING.city} />
                </Field>
                <Field label="Canton" required style={{ flex: '0 1 10rem' }}>
                  <Select options={CANTONS} defaultValue="ZH" />
                </Field>
              </Stack>
            </Stack>
          </Panel>

          <Panel variant="ruled" title="Size and price">
            <Stack gap={4}>
              <Stack direction="row" gap={4} wrap>
                {/* No hint on this one, though it wants one: a `hint` on a
                    single field in a horizontal row pushes its control a line
                    below the others' and the row stops reading as a row.
                    Recorded as a `Field` finding rather than worked around. */}
                <Field label="Rooms" required style={{ flex: '0 1 9rem' }}>
                  <Input type="number" step="0.5" defaultValue="3.5" />
                </Field>
                <Field label="Living space" style={{ flex: '0 1 10rem' }}>
                  <Input type="number" suffix="m²" defaultValue="96" />
                </Field>
                <Field label="Floor" style={{ flex: '0 1 8rem' }}>
                  <Input type="number" defaultValue="4" />
                </Field>
                <Field label="Year built" style={{ flex: '0 1 9rem' }}>
                  <Input type="number" defaultValue="1908" />
                </Field>
              </Stack>

              {/* The one field with a live error, so the pattern shows what an
                  invalid control looks like next to valid ones rather than in a
                  story of its own. `Field` wires the aria; `Input` needs no
                  `invalid` prop of its own here. */}
              <Field
                label={listingType === 'rent' ? 'Rent per month' : 'Asking price'}
                required
                error={Number(price) > 10000 ? 'That looks like a sale price, not a monthly rent.' : undefined}
              >
                <Input
                  type="number"
                  prefix="CHF"
                  value={price}
                  onChange={event => {
                    setPrice(event.target.value)
                    setDirty(true)
                  }}
                />
              </Field>

              <Field label="Extra costs" hint="Service charges, per month.">
                <Input type="number" prefix="CHF" defaultValue="180" />
              </Field>
            </Stack>
          </Panel>

          <Panel variant="ruled" title="What is in it">
            <Stack gap={3}>
              <Stack direction="row" gap={6} wrap>
                {['Balcony or terrace', 'Lift', 'Parking', 'Dishwasher', 'Fireplace', 'Cellar'].map(
                  feature => (
                    <Checkbox
                      key={feature}
                      label={feature}
                      defaultChecked={feature === 'Balcony or terrace' || feature === 'Lift'}
                    />
                  )
                )}
              </Stack>
              <Divider spacing="sm" />
              <Switch
                label="Pets allowed"
                description="Ask the agent if the listing does not say — half of them do not."
              />
              <Switch
                label="Watch this listing"
                description="Re-import nightly and tell the team when the price or status changes."
                defaultChecked
              />
            </Stack>
          </Panel>

          <Panel variant="ruled" title="Documents">
            <Stack gap={3}>
              <FileDropStandIn
                label="Drop the listing PDF, or choose a file"
                hint="PDF, JPEG or PNG, up to 20 MB each"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Stack gap={0} dividers>
                {[
                  ['Listing-4001234567.pdf', '1.2 MB'],
                  ['Floor-plan-attic.pdf', '840 kB'],
                ].map(([name, size]) => (
                  <Stack
                    key={name}
                    direction="row"
                    gap={3}
                    align="center"
                    style={{ paddingBlock: 'var(--cds-space-2)' }}
                  >
                    <Icon name="document" />
                    <span className="cds-ui-sm" style={{ flex: 1 }}>
                      {name}
                    </span>
                    <span className="cds-body-sm cds-text-subtle cds-numeric">{size}</span>
                    <Button size="sm" variant="ghost">
                      Remove
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Panel>

          {/* Sticky, because this form is four screens long and a save button
              at the bottom of it is a save button nobody finds. */}
          <Toolbar
            border="top"
            sticky
            label="Save"
            end={
              <>
                <Button variant="ghost">Discard</Button>
                <Button variant="primary" disabled={!dirty}>
                  Save changes
                </Button>
              </>
            }
          >
            <span className="cds-body-sm cds-text-subtle">
              {dirty ? 'Unsaved changes' : 'No changes yet'}
            </span>
          </Toolbar>
        </Stack>
      </AppShell>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('save is inert until something changes', async () => {
      await expect(canvas.getByRole('button', { name: 'Save changes' })).toBeDisabled()
    })

    await step('an implausible rent is caught inline', async () => {
      const rent = canvas.getByLabelText(/rent per month/i)
      await userEvent.clear(rent)
      await userEvent.type(rent, '345000')
      await expect(
        canvas.getByText('That looks like a sale price, not a monthly rent.')
      ).toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    })
  },
}

/**
 * Import, in its four states: waiting for a URL, working, failed, done.
 *
 * The failure is the one worth designing. A scraper fails for reasons the
 * reader can act on — the portal blocked us, the listing is gone, the URL was
 * not a listing at all — and each of those has a different next step. A generic
 * "import failed" makes all three look like the same dead end.
 */
export const Import: Story = {
  render: () => {
    const [state, setState] = useState<'idle' | 'working' | 'failed' | 'done'>('idle')

    return (
      <AppShell header={<Masthead brand="findmyplace_" section="Add a property" />} maxWidth="44rem">
        <Stack gap={5} style={{ paddingBlock: 'var(--cds-space-6)' }}>
          <Stack gap={2}>
            <h1 className="cds-headline" style={{ margin: 0 }}>
              Add a property
            </h1>
            <p className="cds-lede" style={{ margin: 0, maxWidth: 'var(--cds-measure)' }}>
              Paste a link from Homegate, ImmoScout24, Newhome or Flatfox and the
              details come across. Anything else has to be typed in.
            </p>
          </Stack>

          <Field
            label="Listing URL"
            hint="The page for one property, not a search results page."
            error={state === 'failed' ? 'Could not read that listing.' : undefined}
          >
            <Input
              mono
              size="lg"
              placeholder="https://www.homegate.ch/rent/…"
              defaultValue="https://www.homegate.ch/rent/4001234567"
            />
          </Field>

          {state === 'working' && (
            <Stack gap={3}>
              <Progress label="Importing the listing" showLabel value={62} />
              <span className="cds-body-sm cds-text-subtle">
                Read the page. Fetching 12 photographs.
              </span>
            </Stack>
          )}

          {state === 'failed' && (
            <CalloutStandIn
              tone="danger"
              title="Homegate refused the request"
              actions={
                <>
                  <Button size="sm" variant="secondary" onClick={() => setState('working')}>
                    Try again
                  </Button>
                  <Button size="sm" variant="ghost">
                    Enter it by hand
                  </Button>
                </>
              }
            >
              The portal returned 403, which usually means it is rate-limiting us
              rather than that the listing is gone. Trying again in a few minutes
              generally works.
            </CalloutStandIn>
          )}

          {state === 'done' && (
            <CalloutStandIn
              tone="success"
              title="Imported 18 fields and 12 photographs"
              actions={
                <Button size="sm" variant="secondary">
                  Check the details
                </Button>
              }
            >
              The price, room count and address came across. The description was
              truncated by the portal and may need a look.
            </CalloutStandIn>
          )}

          <Stack direction="row" gap={2}>
            <Button
              variant="primary"
              loading={state === 'working'}
              onClick={() => setState('working')}
            >
              Import
            </Button>
            <Button variant="ghost">Enter it by hand instead</Button>
          </Stack>

          <Divider label="Try the states" />
          <Stack direction="row" gap={2} wrap>
            {(['idle', 'working', 'failed', 'done'] as const).map(s => (
              <Button
                key={s}
                size="sm"
                variant="secondary"
                aria-pressed={state === s}
                onClick={() => setState(s)}
              >
                {s}
              </Button>
            ))}
          </Stack>
        </Stack>
      </AppShell>
    )
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
      storyId="patterns-property-intake--edit-form"
      theme={String(context.globals.theme ?? 'light')}
      caption="Edit form at 390 × 844"
    />
  ),
}
