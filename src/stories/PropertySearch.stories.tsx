import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  ActiveFilters,
  AppShell,
  Badge,
  Button,
  Divider,
  Drawer,
  EmptyState,
  FacetGroup,
  FacetItem,
  Icon,
  IconButton,
  Menu,
  NavList,
  Pagination,
  RangeFilter,
  ResultCard,
  ResultList,
  ResultMeta,
  SearchInput,
  SegmentedControl,
  SortControl,
  Stack,
  Toolbar,
  type ActiveFilter,
  type SortDirection,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { Rating } from './Rating'
import { Thumbnail } from './Thumbnail'
import {
  CITY_FACETS,
  FEATURE_FACETS,
  LISTINGS,
  PORTAL_FACETS,
  PROPERTY_SORT_OPTIONS,
  PROPERTY_TYPE_FACETS,
  TRIAGE_FACETS,
  formatArea,
  formatListingDate,
  formatMarketStatus,
  formatPrice,
  formatPropertyType,
  formatRooms,
  formatTriageStatus,
  marketStatusTone,
  triageTone,
  type Listing,
} from './property-fixtures'

/**
 * A property hunt, which is faceted search with two differences that change the
 * design: the result set is small enough to know by heart, and every result
 * carries a *judgement* the team made about it. So the card has to show both
 * what the portal says (`Available`, `Under offer`) and what the team decided
 * (`Interested`, `Rejected`) without the two being mistaken for each other, and
 * the sidebar has to filter on both.
 *
 * Built as the reference layout for find-my-place's properties page.
 */
const meta = {
  title: 'Patterns/Property search',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const NAV_ITEMS = [
  { id: 'properties', label: 'Properties' },
  { id: 'lists', label: 'Lists' },
  { id: 'brief', label: 'Brief' },
  { id: 'viewings', label: 'Viewings' },
  { id: 'discussions', label: 'Discussions' },
]

/**
 * The meta line under each card. Price first because it is what a reader
 * compares, and `cds-numeric` on the whole line so figures stack in columns
 * down the list instead of jittering.
 */
function listingMeta(listing: Listing) {
  return [
    <span key="price" className="cds-numeric" style={{ color: 'var(--cds-color-text-strong)' }}>
      {formatPrice(listing.price, listing.listingType)}
    </span>,
    <span key="rooms" className="cds-numeric">
      {formatRooms(listing.rooms)}
    </span>,
    <span key="area" className="cds-numeric">
      {formatArea(listing.livingSpace)}
    </span>,
    listing.city,
    listing.portal,
    formatListingDate(listing.listedAt),
  ]
}

/**
 * Two badges, and the order matters: the team's own judgement reads first
 * because it is the one the team acts on. `new` gets no badge at all — it is
 * the default state and would be a badge on nearly every row.
 */
function listingTags(listing: Listing) {
  return (
    <>
      {listing.triageStatus !== 'new' && (
        <Badge size="sm" tone={triageTone(listing.triageStatus)} dot>
          {formatTriageStatus(listing.triageStatus)}
        </Badge>
      )}
      {listing.status !== 'available' && (
        <Badge size="sm" variant="outline" tone={marketStatusTone(listing.status)}>
          {formatMarketStatus(listing.status)}
        </Badge>
      )}
    </>
  )
}

function ListingCard({
  listing,
  query,
  selected,
  onSelect,
}: {
  listing: Listing
  query: string
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <ResultCard
      title={listing.title}
      snippet={listing.snippet}
      kicker={`${formatPropertyType(listing.propertyType)} · ${listing.canton}`}
      query={query}
      href="#"
      selected={selected}
      meta={listingMeta(listing)}
      tags={listingTags(listing)}
      leading={<Thumbnail count={listing.imageCount} label={listing.title} />}
      trailing={
        <Stack gap={1} align="end">
          <Rating value={listing.rating} />
          <span
            className="cds-numeric"
            style={{ fontSize: 'var(--cds-text-xs)', color: 'var(--cds-color-text-subtle)' }}
            title="How well this matches the search brief"
          >
            {Math.round(listing.briefMatch * 100)}% brief
          </span>
          <Menu
            align="end"
            label={`Actions for ${listing.title}`}
            trigger={props => (
              <IconButton
                {...props}
                icon={<Icon name="more" />}
                label={`Actions for ${listing.title}`}
                size="sm"
                bare
              />
            )}
            items={[
              { id: 'open', label: 'Open listing', icon: <Icon name="external" size={14} /> },
              { id: 'list', label: 'Add to a list', icon: <Icon name="bookmark" size={14} /> },
              { id: 'viewing', label: 'Book a viewing', icon: <Icon name="calendar" size={14} /> },
              { id: 'select', label: selected ? 'Deselect' : 'Select', onSelect },
              { id: 'archive', label: 'Archive', tone: 'danger' },
            ]}
          />
        </Stack>
      }
    />
  )
}

/**
 * The whole properties page: masthead with nav and search, faceted sidebar,
 * applied-filter receipt, results as cards or as a grid, pagination, and the
 * same filters again in a `Drawer` for narrow screens.
 */
export const FullApplication: Story = {
  name: 'Full application',
  render: () => {
    const [query, setQuery] = useState('zürich balcony')
    const [view, setView] = useState('list')
    const [page, setPage] = useState(1)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selected, setSelected] = useState<string[]>([])
    const [sort, setSort] = useState<{ key: string; direction: SortDirection }>({
      key: 'match',
      direction: 'desc',
    })
    const [filters, setFilters] = useState<ActiveFilter[]>([
      { id: 'city-zurich', facet: 'City', value: 'Zürich' },
      { id: 'type-apartment', facet: 'Type', value: 'Apartment' },
      { id: 'price-max', facet: 'Rent', value: 'up to CHF 3,600' },
      { id: 'rooms-min', facet: 'Rooms', value: 'from 3.5' },
    ])

    const results = useMemo(() => (query.trim() ? LISTINGS : []), [query])

    const toggle = (id: string) =>
      setSelected(current =>
        current.includes(id) ? current.filter(x => x !== id) : [...current, id]
      )

    const sidebar = (
      <>
        <FacetGroup title="City" searchable searchPlaceholder="Filter cities" maxVisible={6} selectedCount={1} onClear={() => {}}>
          {CITY_FACETS.map(f => (
            <FacetItem
              key={f.value}
              label={f.label}
              count={f.count}
              defaultChecked={f.value === 'zurich'}
              onOnly={() => {}}
            />
          ))}
        </FacetGroup>

        <FacetGroup title="Property type" selectedCount={1} onClear={() => {}}>
          {PROPERTY_TYPE_FACETS.map(f => (
            <FacetItem
              key={f.value}
              label={f.label}
              count={f.count}
              defaultChecked={f.value === 'apartment'}
              onOnly={() => {}}
            />
          ))}
        </FacetGroup>

        {/* The team's pipeline, with a swatch each so the sidebar and the card
            badges agree on what colour a status is. */}
        <FacetGroup title="Triage">
          {TRIAGE_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} swatch={f.swatch} onOnly={() => {}} />
          ))}
        </FacetGroup>

        <FacetGroup title="Rent per month">
          <RangeFilter
            type="number"
            unit="CHF"
            minPlaceholder="No minimum"
            maxPlaceholder="No maximum"
            defaultValue={{ min: '', max: '3600' }}
            presets={[
              { label: 'to 3,000', value: { min: '', max: '3000' } },
              { label: 'to 3,600', value: { min: '', max: '3600' } },
              { label: 'to 4,200', value: { min: '', max: '4200' } },
            ]}
          />
        </FacetGroup>

        <FacetGroup title="Rooms">
          <RangeFilter type="number" applyOn="blur" defaultValue={{ min: '3.5', max: '' }} />
        </FacetGroup>

        <FacetGroup title="Living space">
          <RangeFilter type="number" unit="m²" applyOn="blur" />
        </FacetGroup>

        <FacetGroup title="Features" defaultOpen={false}>
          {FEATURE_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} />
          ))}
        </FacetGroup>

        <FacetGroup title="Source portal" defaultOpen={false}>
          {PORTAL_FACETS.map(f => (
            <FacetItem key={f.value} label={f.label} count={f.count} />
          ))}
        </FacetGroup>
      </>
    )

    return (
      <>
        <AppShell
          header={
            <Masthead
              brand="findmyplace_"
              section="Properties"
              nav={<NavList orientation="horizontal" items={NAV_ITEMS} value="properties" label="Sections" />}
              actions={
                <>
                  <Button size="sm" variant="primary" iconStart={<Icon name="plus" size={14} />}>
                    Add
                  </Button>
                  {/* A bell belongs here. The set has no bell, so the real
                      masthead uses lucide's — see the icon note in the
                      migration plan. */}
                  <IconButton icon={<Icon name="info" />} label="Help" size="sm" />
                </>
              }
            >
              <SearchInput
                size="md"
                value={query}
                onValueChange={setQuery}
                shortcut="/"
                placeholder="Search this team's properties"
              />
            </Masthead>
          }
          sidebar={sidebar}
        >
          <Stack gap={0}>
            <ActiveFilters
              filters={filters}
              onRemove={id => setFilters(f => f.filter(x => x.id !== id))}
              onClearAll={() => setFilters([])}
            />

            <ResultMeta
              total={results.length ? 187 : 0}
              from={results.length ? 1 : undefined}
              to={results.length ? results.length : undefined}
              query={query}
              actions={
                <>
                  <SortControl
                    options={PROPERTY_SORT_OPTIONS}
                    value={sort.key}
                    direction={sort.direction}
                    onChange={(key, direction) => setSort({ key, direction })}
                  />
                  <SegmentedControl
                    size="sm"
                    label="View"
                    value={view}
                    onChange={setView}
                    options={[
                      { value: 'list', label: 'List' },
                      { value: 'grid', label: 'Grid' },
                    ]}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    iconStart={<Icon name="filter" size={14} />}
                    onClick={() => setDrawerOpen(true)}
                  >
                    Filters
                  </Button>
                </>
              }
            />

            {selected.length > 0 && (
              <Toolbar
                border="bottom"
                size="sm"
                label="Bulk actions"
                end={
                  <IconButton
                    icon={<Icon name="close" />}
                    label="Cancel selection"
                    size="sm"
                    onClick={() => setSelected([])}
                  />
                }
              >
                <span className="cds-ui-sm cds-numeric">{selected.length} selected</span>
                <Button size="sm" variant="secondary">Add to list</Button>
                <Button size="sm" variant="secondary">Mark interested</Button>
                <Button size="sm" variant="danger">Archive</Button>
              </Toolbar>
            )}

            {results.length === 0 ? (
              <EmptyState
                icon={<Icon name="search" size={28} />}
                title={`Nothing matched “${query}”`}
                description="Four filters are applied. The brief covers Zürich, Winterthur and Zug."
                suggestions={[
                  'Raise the rent ceiling — the market above CHF 3,600 is much deeper.',
                  'Drop the minimum room count to 2.5.',
                  'Include the portals you turned off in the sidebar.',
                ]}
                actions={
                  <Button variant="primary" onClick={() => setFilters([])}>
                    Clear all filters
                  </Button>
                }
              />
            ) : view === 'list' ? (
              <>
                <ResultList label="Properties">
                  {results.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      query={query}
                      selected={selected.includes(listing.id)}
                      onSelect={() => toggle(listing.id)}
                    />
                  ))}
                </ResultList>
                <Pagination page={page} pageCount={32} onChange={setPage} />
              </>
            ) : (
              <>
                {/* `ResultList` is a column by design — rules between rows are
                    the system's separator and a grid has nowhere to put them.
                    A card grid is therefore layout glue the product owns, and
                    it is two properties of CSS rather than a component. */}
                <ul
                  aria-label="Properties"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(21rem, 1fr))',
                    gap: 'var(--cds-space-4)',
                    listStyle: 'none',
                    margin: 0,
                    padding: 'var(--cds-space-4) 0',
                  }}
                >
                  {results.map(listing => (
                    <li
                      key={listing.id}
                      style={{
                        border: 'var(--cds-hairline) solid var(--cds-color-rule)',
                        padding: 'var(--cds-space-3)',
                      }}
                    >
                      <ResultCard
                        title={listing.title}
                        snippet={listing.snippet}
                        kicker={`${formatPropertyType(listing.propertyType)} · ${listing.city}`}
                        query={query}
                        href="#"
                        density="compact"
                        meta={listingMeta(listing).slice(0, 3)}
                        tags={listingTags(listing)}
                      />
                    </li>
                  ))}
                </ul>
                <Pagination page={page} pageCount={32} onChange={setPage} />
              </>
            )}
          </Stack>
        </AppShell>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filters"
          description="187 properties match the current brief"
          footer={
            <>
              <Button variant="ghost" onClick={() => setFilters([])}>
                Clear all
              </Button>
              <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                Show results
              </Button>
            </>
          }
        >
          {sidebar}
        </Drawer>
      </>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('the filter receipt lists what has been narrowed to', async () => {
      await expect(canvas.getByText('up to CHF 3,600')).toBeInTheDocument()
    })

    await step('removing a filter takes it off the receipt', async () => {
      await userEvent.click(canvas.getByRole('button', { name: /remove rooms filter/i }))
      await expect(canvas.queryByText('from 3.5')).not.toBeInTheDocument()
    })
  },
}

/**
 * Nothing found. The suggestions are the useful part — a property search fails
 * for a small number of knowable reasons, and naming them beats an apology.
 */
export const NoResults: Story = {
  name: 'No results',
  render: () => (
    <AppShell header={<Masthead brand="findmyplace_" section="Properties" />}>
      <EmptyState
        icon={<Icon name="search" size={28} />}
        title="Nothing matched “chalet zug garden”"
        description="Six filters are applied and the brief has not been updated since July."
        suggestions={[
          'Chalets are a Valais and Graubünden listing — Zug has four this year.',
          'Raise the rent ceiling from CHF 3,200.',
          'Review the brief; the last change was five weeks ago.',
        ]}
        actions={
          <>
            <Button variant="primary">Clear all filters</Button>
            <Button variant="ghost">Open the brief</Button>
          </>
        }
      />
    </AppShell>
  ),
}

/**
 * While the first query runs. `ResultList` draws its own placeholder rows, and
 * `ResultMeta` replaces the counts rather than showing a zero — a zero that
 * turns into 187 reads as a result, and briefly a wrong one.
 */
export const Loading: Story = {
  render: () => (
    <AppShell header={<Masthead brand="findmyplace_" section="Properties" />}>
      <Stack gap={0}>
        <ResultMeta total={0} loading />
        <ResultList label="Properties" loading loadingCount={4} />
      </Stack>
    </AppShell>
  ),
}

/**
 * The card on its own, in each of the four triage states plus the archived one.
 * This is the component the app's `PropertyCard` (841 lines) becomes.
 */
export const CardStates: Story = {
  name: 'Card states',
  parameters: { layout: 'padded' },
  render: () => (
    <div className="sb-page">
      <Stack gap={4}>
        <p className="cds-lede" style={{ maxWidth: 'var(--cds-measure)' }}>
          The team’s judgement leads; the portal’s status follows in outline. A
          property nobody has looked at yet carries no badge at all.
        </p>
        <Divider tone="strong" />
        <ResultList label="Card states">
          {LISTINGS.slice(0, 4).map(listing => (
            <ListingCard key={listing.id} listing={listing} query="balcony" />
          ))}
        </ResultList>
      </Stack>
    </div>
  ),
}

/**
 * The same screen at 390 × 844, in an iframe so the breakpoints actually fire.
 * The sidebar is gone at this width and the `Filters` button in the result
 * meta is the only way to it — which is why that button is not optional.
 */
export const Mobile: Story = {
  parameters: {
    layout: 'padded',
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-property-search--full-application"
      theme={String(context.globals.theme ?? 'light')}
      caption="Property search at 390 × 844"
    />
  ),
}
