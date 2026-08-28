import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '../components/Stack/Stack'
import { Divider } from '../components/Divider/Divider'

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Swatch({ token, note }: { token: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          width: 40,
          height: 28,
          background: `var(${token})`,
          border: '1px solid var(--cds-color-rule)',
          borderRadius: 2,
          flex: 'none',
        }}
      />
      <code className="cds-mono" style={{ fontSize: 12 }}>{token}</code>
      {note && <span className="cds-body-sm">{note}</span>}
    </div>
  )
}

export const Colour: Story = {
  render: () => (
    <Stack gap={8} style={{ maxWidth: 720 }}>
      <section>
        <Divider label="Ground" />
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-canvas" note="the page" />
          <Swatch token="--cds-color-surface" note="panels, inputs" />
          <Swatch token="--cds-color-surface-sunken" note="wells, table heads" />
          <Swatch token="--cds-color-surface-hover" />
          <Swatch token="--cds-color-surface-selected" note="applied to a chosen row" />
        </Stack>
      </section>

      <section>
        <Divider label="Ink" />
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-text-strong" note="headlines" />
          <Swatch token="--cds-color-text" note="body" />
          <Swatch token="--cds-color-text-muted" note="metadata" />
          <Swatch token="--cds-color-text-subtle" note="counts, hints" />
        </Stack>
      </section>

      <section>
        <Divider label="Rules" tone="strong" />
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-rule-subtle" />
          <Swatch token="--cds-color-rule" note="the default hairline" />
          <Swatch token="--cds-color-rule-strong" note="control borders" />
          <Swatch token="--cds-color-rule-heavy" note="table head, search field" />
        </Stack>
      </section>

      <section>
        <Divider label="Accent" tone="accent" />
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-accent" note="selection, focus, links" />
          <Swatch token="--cds-color-accent-hover" />
          <Swatch token="--cds-color-accent-subtle" note="tinted grounds" />
          <Swatch token="--cds-color-brand-mark" note="masthead only — never the interaction colour" />
          <Swatch token="--cds-color-ink" note="primary button fill" />
        </Stack>
      </section>

      <section>
        <Divider label="Status" />
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-success" />
          <Swatch token="--cds-color-warning" />
          <Swatch token="--cds-color-danger" />
          <Swatch token="--cds-color-info" />
          <Swatch token="--cds-color-highlight-bg" note="matched search terms" />
        </Stack>
      </section>

      <section>
        <Divider label="Series" />
        <p className="cds-body-sm" style={{ marginTop: 12, maxWidth: '52ch' }}>
          The categorical scale, for charts only. Slot 1 is the accent, so a
          single-series chart is drawn in the system’s own colour. Slots 1–4 are
          separable by hue alone under normal and colour-blind vision; past four
          series a chart must carry a second channel — a dash pattern, a distinct
          marker, a direct label.
        </p>
        <Stack gap={2} style={{ marginTop: 16 }}>
          <Swatch token="--cds-color-series-1" note="= the accent" />
          <Swatch token="--cds-color-series-2" />
          <Swatch token="--cds-color-series-3" />
          <Swatch token="--cds-color-series-4" />
          <Swatch token="--cds-color-series-5" note="needs redundant encoding" />
          <Swatch token="--cds-color-series-6" note="needs redundant encoding" />
        </Stack>
      </section>
    </Stack>
  ),
}

export const Typography: Story = {
  render: () => (
    <Stack gap={6} style={{ maxWidth: 760 }}>
      <div>
        <p className="cds-kicker" style={{ marginBottom: 8 }}>Editorial voice — serif</p>
        <Divider />
      </div>
      <Stack gap={4}>
        <div>
          <p className="cds-display">Display</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-display</code>
        </div>
        <div>
          <p className="cds-headline">Headline — an article title</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-headline</code>
        </div>
        <div>
          <p className="cds-title">Title — a page or section heading</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-title</code>
        </div>
        <div>
          <p className="cds-subtitle">Subtitle — a result title</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-subtitle</code>
        </div>
        <div>
          <p className="cds-lede">
            Lede — the standfirst under a headline, set a little larger and looser than body copy.
          </p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-lede</code>
        </div>
        <div>
          <p className="cds-body">
            Body — reading copy and result snippets, capped at a comfortable measure so a long
            snippet never runs the full width of a wide screen.
          </p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-body</code>
        </div>
      </Stack>

      <div style={{ marginTop: 16 }}>
        <p className="cds-kicker" style={{ marginBottom: 8 }}>Interface voice — sans</p>
        <Divider />
      </div>
      <Stack gap={4}>
        <div>
          <p className="cds-ui">UI — the default for controls and chrome</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-ui</code>
        </div>
        <div>
          <p className="cds-ui-sm">UI small — dense controls and table cells</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-ui-sm</code>
        </div>
        <div>
          <p className="cds-label">Label — form labels</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-label</code>
        </div>
        <div>
          <p className="cds-body-sm">Body small — metadata lines and hints</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-body-sm</code>
        </div>
        <div>
          <p className="cds-kicker">Kicker — the section marker of this system</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-kicker</code>
        </div>
        <div>
          <p className="cds-mono">Mono — A-38211 · doi:10.1000/182</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-mono</code>
        </div>
        <div>
          <p className="cds-ui cds-numeric">Numeric — 1,284,027 results (tabular figures)</p>
          <code className="cds-mono" style={{ fontSize: 11 }}>.cds-numeric</code>
        </div>
      </Stack>
    </Stack>
  ),
}

export const Spacing: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: 620 }}>
      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map(step => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <code className="cds-mono" style={{ fontSize: 12, width: 130 }}>
            --cds-space-{step}
          </code>
          <span
            style={{
              height: 12,
              width: `var(--cds-space-${step})`,
              background: 'var(--cds-color-accent)',
            }}
          />
        </div>
      ))}
    </Stack>
  ),
}

export const Elevation: Story = {
  render: () => (
    <Stack direction="row" gap={6} wrap>
      {(['sm', 'md', 'lg'] as const).map(level => (
        <div
          key={level}
          style={{
            width: 160,
            height: 96,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--cds-color-surface-raised)',
            boxShadow: `var(--cds-shadow-${level})`,
            borderRadius: 4,
          }}
        >
          <code className="cds-mono" style={{ fontSize: 12 }}>shadow-{level}</code>
        </div>
      ))}
    </Stack>
  ),
}
