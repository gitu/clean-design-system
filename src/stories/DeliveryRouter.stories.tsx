import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Icon,
  Panel,
  Progress,
  SegmentedControl,
  Stack,
  useTheme,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { RouteMap, RouteSchematic } from './RouteMap'
import { ROUTE_STOPS, type Stop } from './fixtures'

const meta = {
  title: 'Patterns/Delivery router',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const STATUS_TONE = {
  delivered: 'success',
  next: 'info',
  pending: 'neutral',
  failed: 'danger',
} as const

/**
 * The furthest thing here from faceted search, which is why it is worth
 * building: a driver's round is a map, a queue and one very large button, and
 * none of that is what this system was designed against.
 *
 * The map is real MapLibre with real tiles, loaded dynamically and story-only
 * — see `RouteMap.tsx` for why it is not a shipped component. When the tiles
 * cannot load it falls back to a stop sequence, which is arguably the better
 * thing to look at in a van anyway.
 */
export const Round: Story = {
  name: 'Round',
  render: () => {
    const [stops, setStops] = useState<Stop[]>(ROUTE_STOPS)
    const [activeId, setActiveId] = useState<string | null>('s-05')
    const [view, setView] = useState('map')
    const [sheetOpen, setSheetOpen] = useState(false)
    // The basemap has a light and a dark style; follow whichever is on screen.
    const { resolvedTheme } = useTheme()

    const active = stops.find(stop => stop.id === activeId) ?? null
    const done = stops.filter(stop => stop.status === 'delivered').length
    const parcels = stops.reduce((sum, stop) => sum + stop.parcels, 0)
    const remaining = useMemo(
      () => stops.filter(stop => stop.status === 'pending' || stop.status === 'next'),
      [stops]
    )

    const mark = (id: string, status: Stop['status']) => {
      setStops(current => {
        const next = current.map(stop => (stop.id === id ? { ...stop, status } : stop))
        // Promote the following stop, so the round always has a "next".
        const index = next.findIndex(stop => stop.id === id)
        const following = next[index + 1]
        if (following && following.status === 'pending') following.status = 'next'
        return next
      })
      setSheetOpen(false)
    }

    return (
      <AppShell
        header={
          <Masthead
            section="Round 42"
            actions={
              <SegmentedControl
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: 'map', label: 'Map' },
                  { value: 'list', label: 'List' },
                ]}
              />
            }
          />
        }
        sidebarHidden
        maxWidth="1280px"
      >
        <Stack gap={5} className="sb-page">
          {/* On a phone this is the screen. A driver in a van is not reading a
              dashboard — they need the address they are going to, the window
              they have to hit, and the two buttons that close the stop. Every
              other block on this page is reference material by comparison, so
              on mobile they all move below this one. */}
          {active && (
            <section className="sb-route-next">
              <span className="cds-kicker sb-route-next__kicker">
                Next stop · {active.sequence} of {stops.length}
              </span>
              <h2 className="cds-headline sb-route-next__address">{active.name}</h2>
              <p className="cds-lede sb-route-next__where">{active.address}</p>

              <dl className="sb-route-next__facts">
                <div>
                  <dt className="cds-kicker">Window</dt>
                  <dd className="cds-numeric">{active.window}</dd>
                </div>
                <div>
                  <dt className="cds-kicker">ETA</dt>
                  <dd className="cds-numeric">{active.eta}</dd>
                </div>
                <div>
                  <dt className="cds-kicker">Parcels</dt>
                  <dd className="cds-numeric">{active.parcels}</dd>
                </div>
              </dl>

              <div className="sb-route-next__actions">
                <Button variant="primary" size="lg" fullWidth onClick={() => mark(active.id, 'delivered')}>
                  <Icon name="check" size={16} /> Delivered
                </Button>
                <Button variant="secondary" size="lg" fullWidth onClick={() => mark(active.id, 'failed')}>
                  Could not deliver
                </Button>
              </div>

              <p className="sb-route-next__after cds-body-sm">
                {remaining.length > 1
                  ? `Then ${remaining[1]?.name} at ${remaining[1]?.eta} · ${remaining.length - 1} stops left after this`
                  : 'Last stop of the round.'}
              </p>
            </section>
          )}

          <div className="sb-route-summary">
            <Panel variant="ruled" padding="md">
              <Stack gap={2}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Progress
                </span>
                <span className="cds-title cds-numeric">
                  {done} / {stops.length}
                </span>
                <Progress
                  label="Stops completed"
                  value={done}
                  max={stops.length}
                  size="sm"
                  tone="success"
                />
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={1}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Parcels
                </span>
                <span className="cds-title cds-numeric">{parcels}</span>
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={1}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Back at depot
                </span>
                <span className="cds-title cds-numeric">12:40</span>
              </Stack>
            </Panel>
            <Panel variant="ruled" padding="md">
              <Stack gap={2}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Driver
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-2)' }}>
                  <Avatar name="Dario Moser" size="sm" tinted decorative />
                  <span className="cds-body-sm">D. Moser</span>
                </div>
              </Stack>
            </Panel>
          </div>

          <div className="sb-route-split">
            <div className="sb-route-main">
              {view === 'map' ? (
                <RouteMap
                  stops={stops}
                  activeId={activeId}
                  onSelect={setActiveId}
                  height={460}
                  theme={resolvedTheme}
                />
              ) : (
                <Panel variant="ruled" padding="md" title="Stop sequence">
                  <RouteSchematic stops={stops} activeId={activeId} onSelect={setActiveId} />
                </Panel>
              )}
            </div>

            <Panel variant="ruled" padding="md" title="Queue" className="sb-route-queue">
              <Stack gap={0} dividers>
                {stops.map(stop => (
                  <button
                    key={stop.id}
                    type="button"
                    className="sb-route-row"
                    aria-pressed={stop.id === activeId}
                    onClick={() => {
                      setActiveId(stop.id)
                      if (window.matchMedia('(max-width: 860px)').matches) setSheetOpen(true)
                    }}
                  >
                    <span className="sb-route-row__seq cds-numeric">{stop.sequence}</span>
                    <span className="sb-route-row__body">
                      <span className="cds-body">{stop.name}</span>
                      <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
                        {stop.window} · {stop.parcels} parcels
                      </span>
                    </span>
                    <Badge tone={STATUS_TONE[stop.status]} size="sm">
                      {stop.status}
                    </Badge>
                  </button>
                ))}
              </Stack>
            </Panel>
          </div>

          {active && (
            <Panel variant="ruled" padding="md" className="sb-route-active">
              <Stack gap={4}>
                <div>
                  <Divider label={`Stop ${active.sequence} of ${stops.length}`} tone="accent" />
                </div>
                <Stack gap={1}>
                  <span className="cds-title">{active.name}</span>
                  <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-muted)' }}>
                    {active.address} · window {active.window} · ETA {active.eta}
                  </span>
                </Stack>
                <div style={{ display: 'flex', gap: 'var(--cds-space-2)', flexWrap: 'wrap' }}>
                  <Button variant="primary" onClick={() => mark(active.id, 'delivered')}>
                    <Icon name="check" size={14} /> Mark delivered
                  </Button>
                  <Button variant="secondary" onClick={() => mark(active.id, 'failed')}>
                    Could not deliver
                  </Button>
                </div>
              </Stack>
            </Panel>
          )}
        </Stack>

        {/* On a phone the detail panel is below the fold; a sheet puts the one
            action the driver needs under their thumb. */}
        <Drawer
          open={sheetOpen && active !== null}
          onClose={() => setSheetOpen(false)}
          side="bottom"
          size="sm"
          title={active ? `Stop ${active.sequence}: ${active.name}` : ''}
          description={active ? `${active.address} · ETA ${active.eta}` : undefined}
          footer={
            active && (
              <>
                <Button variant="secondary" onClick={() => mark(active.id, 'failed')}>
                  Could not deliver
                </Button>
                <Button variant="primary" onClick={() => mark(active.id, 'delivered')}>
                  Delivered
                </Button>
              </>
            )
          }
        >
          {active && (
            <Stack gap={2}>
              <span className="cds-body-sm">
                {active.parcels} parcels · window {active.window}
              </span>
              <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
                {remaining.length} stops left after this one.
              </span>
            </Stack>
          )}
        </Drawer>
      </AppShell>
    )
  },
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-delivery-router--round"
      theme={String(context.globals.theme ?? 'light')}
      caption="Round at 390 x 844"
    />
  ),
}
