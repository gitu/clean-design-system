import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Badge,
  BarChart,
  Button,
  ChartFrame,
  ChartLegend,
  Divider,
  Drawer,
  FacetGroup,
  Field,
  Icon,
  Input,
  LineChart,
  Panel,
  SearchInput,
  Stack,
  Switch,
  Toolbar,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { EVAL_CURVE, VARIANT_A, VARIANT_B, type RankedResult } from './fixtures'

const meta = {
  title: 'Patterns/Relevance workbench',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SIGNALS = [
  { key: 'textMatch', label: 'Text match', slot: 1 },
  { key: 'freshness', label: 'Freshness', slot: 2 },
  { key: 'authority', label: 'Authority', slot: 3 },
  { key: 'popularity', label: 'Popularity', slot: 4 },
] as const


/** How far a result moved between the two variants. */
function Movement({ from, to }: { from: number; to: number }) {
  const delta = from - to
  if (delta === 0) {
    return (
      <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
        <Icon name="dash" size={12} /> held
      </span>
    )
  }
  const up = delta > 0
  return (
    <span
      className="cds-body-sm cds-numeric"
      style={{ color: up ? 'var(--cds-color-success)' : 'var(--cds-color-danger)' }}
    >
      <Icon name={up ? 'arrow-up' : 'arrow-down'} size={12} /> {Math.abs(delta)}
    </span>
  )
}

function RankedColumn({
  variant,
  results,
  hiddenSignals,
  selected,
  onSelect,
}: {
  variant: 'A' | 'B'
  results: RankedResult[]
  hiddenSignals: string[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <Panel
      title={`Variant ${variant}`}
      description={variant === 'A' ? 'Current production ranker' : 'Freshness-weighted candidate'}
      variant="ruled"
      padding="md"
    >
      <Stack gap={0} dividers>
        {results.map((result, index) => (
          <button
            key={result.id}
            type="button"
            onClick={() => onSelect(result.id)}
            aria-pressed={selected === result.id}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: 'var(--cds-space-3) 0',
              border: 0,
              background:
                selected === result.id ? 'var(--cds-color-surface-selected)' : 'transparent',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <Stack gap={2}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--cds-space-3)' }}>
                <span
                  className="cds-numeric"
                  style={{ color: 'var(--cds-color-text-subtle)', width: '1.5rem', flex: 'none' }}
                >
                  {index + 1}
                </span>
                <span className="cds-body" style={{ flex: 1, minWidth: 0 }}>
                  {result.title}
                </span>
                <Movement from={result.rankInOther} to={index + 1} />
                <span className="cds-numeric cds-body-sm" style={{ flex: 'none' }}>
                  {result.score.toFixed(2)}
                </span>
              </div>
              {/* The score breakdown, as a single stacked bar per result. */}
              <div style={{ paddingLeft: '2.25rem' }}>
                <BarChart
                  label={`${result.title}: score contributions`}
                  data={[result]}
                  x={r => r.id}
                  series={SIGNALS.filter(s => !hiddenSignals.includes(s.key)).map(signal => ({
                    key: signal.key,
                    label: signal.label,
                    value: (r: RankedResult) => r[signal.key],
                  }))}
                  layout="horizontal"
                  stacked
                  height={18}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  barPadding={0}
                  maxBarWidth={14}
                  showGrid={false}
                  showXAxis={false}
                  showYAxis={false}
                  yDomain={[0, 1]}
                  animate={false}
                  sync={['series']}
                />
              </div>
            </Stack>
          </button>
        ))}
      </Stack>
    </Panel>
  )
}

/**
 * Two rankers, side by side, over the same query.
 *
 * The score breakdown under each result is a stacked bar chart eighteen pixels
 * tall with every axis switched off — which is the test of whether the chart
 * API survives being used at a size nobody designed it for.
 */
export const Compare: Story = {
  name: 'Compare variants',
  render: () => {
    const [query, setQuery] = useState('swiss banking')
    const [hiddenSignals, setHiddenSignals] = useState<string[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [boosts, setBoosts] = useState({ freshness: '1.8', authority: '1.0', popularity: '0.6' })
    const [showOnlyMoved, setShowOnlyMoved] = useState(false)
    const [controlsOpen, setControlsOpen] = useState(false)

    const filter = (results: RankedResult[]) =>
      showOnlyMoved ? results.filter((r, i) => r.rankInOther !== i + 1) : results

    const ndcgSeries = useMemo(
      () => [
        { key: 'variantA', label: 'Variant A', value: (p: (typeof EVAL_CURVE)[number]) => p.variantA },
        { key: 'variantB', label: 'Variant B', value: (p: (typeof EVAL_CURVE)[number]) => p.variantB },
      ],
      []
    )

    const meanA = EVAL_CURVE.reduce((s, p) => s + p.variantA, 0) / EVAL_CURVE.length
    const meanB = EVAL_CURVE.reduce((s, p) => s + p.variantB, 0) / EVAL_CURVE.length

    // Built once, rendered twice: into the shell on a wide screen, and into
    // the drawer on a narrow one, where AppShell hides the sidebar entirely.
    const controls = (
        <Stack gap={6} style={{ padding: 'var(--cds-space-5)' }}>
          <FacetGroup title="Signal weights">
            <Stack gap={4} style={{ paddingTop: 'var(--cds-space-3)' }}>
              {/* Field wires its label to the control itself — no htmlFor. */}
              {(['freshness', 'authority', 'popularity'] as const).map(key => (
                <Field key={key} label={key[0]!.toUpperCase() + key.slice(1)}>
                  <Input
                    value={boosts[key]}
                    onChange={event =>
                      setBoosts(current => ({ ...current, [key]: event.target.value }))
                    }
                    size="sm"
                    inputMode="decimal"
                  />
                </Field>
              ))}
            </Stack>
          </FacetGroup>

          <FacetGroup title="View">
            <Stack gap={3} style={{ paddingTop: 'var(--cds-space-3)' }}>
              <Switch
                checked={showOnlyMoved}
                onChange={event => setShowOnlyMoved(event.target.checked)}
                label="Only results that moved"
              />
            </Stack>
          </FacetGroup>

          <div>
            <Divider label="Score signals" />
            <div style={{ marginTop: 'var(--cds-space-3)' }}>
              <ChartLegend
                items={SIGNALS.map(signal => ({
                  key: signal.key,
                  label: signal.label,
                  color: `var(--cds-color-series-${signal.slot})`,
                }))}
                hiddenKeys={hiddenSignals}
                onHiddenChange={setHiddenSignals}
                orientation="vertical"
                swatch="square"
              />
            </div>
          </div>
        </Stack>
    )

    return (
      <AppShell
        header={
          <Masthead
            section="Relevance"
            actions={
              <>
                {/* Only at the width where AppShell has dropped the sidebar —
                    above it the controls are already on screen. */}
                <span className="sb-burger">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-expanded={controlsOpen}
                    onClick={() => setControlsOpen(true)}
                  >
                    <Icon name="filter" size={13} /> Controls
                  </Button>
                </span>
                <Button variant="primary" size="sm">
                  Promote B
                </Button>
              </>
            }
          >
            <SearchInput value={query} onValueChange={setQuery} placeholder="Test a query" />
          </Masthead>
        }
        sidebar={controls}
        maxWidth="1440px"
      >
        <Stack gap={5} className="sb-page">
          <Toolbar
            end={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-4)' }}>
                <span className="cds-body-sm">
                  NDCG@10{' '}
                  <span className="cds-numeric">
                    A {meanA.toFixed(3)} · B {meanB.toFixed(3)}
                  </span>
                </span>
                <Badge tone={meanB > meanA ? 'success' : 'warning'} size="sm">
                  {meanB > meanA ? '+' : ''}
                  {(((meanB - meanA) / meanA) * 100).toFixed(1)}%
                </Badge>
              </div>
            }
          >
            <span className="cds-kicker">Results for “{query}”</span>
          </Toolbar>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'var(--cds-space-5)',
            }}
          >
            <RankedColumn
              variant="A"
              results={filter(VARIANT_A)}
              hiddenSignals={hiddenSignals}
              selected={selected}
              onSelect={setSelected}
            />
            <RankedColumn
              variant="B"
              results={filter(VARIANT_B)}
              hiddenSignals={hiddenSignals}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          <ChartFrame
            title="NDCG@10 across the evaluation set"
            description="Twenty judged queries; higher is better"
            legend={
              <ChartLegend
                items={[
                  { key: 'variantA', label: 'Variant A', color: 'var(--cds-color-series-1)' },
                  { key: 'variantB', label: 'Variant B', color: 'var(--cds-color-series-2)' },
                ]}
              />
            }
            footnote="Judgements from the July editorial panel"
          >
            <LineChart
              label="NDCG at 10 across the evaluation set"
              data={EVAL_CURVE}
              x={p => p.queryIndex}
              datumKey={p => String(p.queryIndex)}
              series={ndcgSeries}
              formatX={v => `Query ${String(v)}`}
              formatValue={n => n.toFixed(2)}
              height={220}
              curve="monotone"
            />
          </ChartFrame>
        </Stack>

        <Drawer
          open={controlsOpen}
          onClose={() => setControlsOpen(false)}
          title="Controls"
          description="Signal weights, view options and the score-signal key"
          side="start"
          size="sm"
        >
          {controls}
        </Drawer>
      </AppShell>
    )
  },
}

/**
 * The same screen at 390 x 844, in an iframe so the breakpoints actually fire.
 *
 * Shrinking a container would not do it: every responsive rule in this system
 * is a `@media (max-width: ...)` query, and those ask the viewport, not the
 * element — so a narrow `<div>` would still get the desktop layout rendered
 * inside it. An iframe has its own viewport.
 */
export const Mobile: Story = {
  parameters: {
    layout: 'padded',
    // The frame is a scaled-down copy of another story; running axe over it
    // would double-report that story's own results.
    a11y: { disable: true },
  },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-relevance-workbench--compare"
      theme={String(context.globals.theme ?? 'light')}
      caption="Compare variants at 390 x 844"
    />
  ),
}
