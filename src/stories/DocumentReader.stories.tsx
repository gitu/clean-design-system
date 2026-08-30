import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  Divider,
  Highlight,
  Icon,
  IconButton,
  Kbd,
  Panel,
  ResultCard,
  ResultList,
  Sparkline,
  Stack,
  Tag,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { ARTICLES, formatDate } from './fixtures'

const meta = {
  title: 'Patterns/Document reader',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const QUERY = 'private banking'

/** The body of the piece. Long enough to actually test the measure. */
const BODY = [
  'Three decades of mergers have left Swiss private banking with a handful of institutions that between them hold more assets than the rest of the market combined. The regulator now faces a question it has avoided for years: whether concentration of this order is a stability feature or a stability risk.',
  'The argument for the former is familiar. Large balance sheets absorb shocks that would sink a smaller house, and supervision is cheaper when there are six counterparties rather than sixty. The argument against is equally familiar, and rather harder to dismiss after the events of 2023.',
  'What has changed is the composition of the assets. Where private banking once meant deposits and discretionary mandates, it now means a long tail of structured products whose behaviour under stress is modelled rather than observed. The models are good. They are not observations.',
  'Officials at the Finanzmarktaufsicht have been careful not to characterise the review as a response to any particular institution. The timing, coming eleven months after the last consolidation was waved through, invites the inference regardless.',
  'A working paper circulated to the cantonal banks in May put the matter more bluntly than the eventual consultation document did. Concentration, it argued, has moved the question from whether a failure can be absorbed to whether a failure can be permitted at all — and a system in which failure is not permitted is not a market.',
  'That paper has not been published. Its conclusions, according to two people who have read it, survive in the consultation only as a footnote about "the limits of resolution planning under high concentration". The consultation closes in September.',
]

const MATCH_COUNT = 7

// noUncheckedIndexedAccess makes ARTICLES[0] `Article | undefined`. Narrowing
// once here beats a `return null` inside the story render, which would make the
// story's type `Element | null` and stop satisfying Storybook's renderer.
const ARTICLE = ARTICLES[0]!

/**
 * The screen you land on after clicking a result — and the hardest typography
 * test in the system, because it is the one place the serif has to carry six
 * hundred words rather than a headline.
 *
 * There is exactly one chart on it, and it is a sparkline in the metadata
 * panel. That restraint is the point: a reading view that fills up with
 * instrumentation stops being a reading view.
 */
export const Reader: Story = {
  render: () => {
    const [match, setMatch] = useState(1)
    const [saved, setSaved] = useState(false)

    const related = useMemo(() => ARTICLES.slice(1, 4), [])

    return (
      <AppShell
        header={
          <Masthead
            section="Reader"
            actions={
              /* Match navigation — the thing that makes this a search result
                 rather than an article page. */
              <>
                <span
                  className="cds-body-sm cds-numeric"
                  style={{ color: 'var(--cds-color-text-muted)' }}
                >
                  {match} of {MATCH_COUNT}
                </span>
                <IconButton
                  icon={<Icon name="chevron-up" size={14} />}
                  label="Previous match"
                  size="sm"
                  variant="secondary"
                  onClick={() => setMatch(m => (m > 1 ? m - 1 : MATCH_COUNT))}
                />
                <IconButton
                  icon={<Icon name="chevron-down" size={14} />}
                  label="Next match"
                  size="sm"
                  variant="secondary"
                  onClick={() => setMatch(m => (m < MATCH_COUNT ? m + 1 : 1))}
                />
                <Kbd keys="N" size="sm" />
              </>
            }
          >
            <Breadcrumbs
              items={[
                { label: 'Search', href: '#' },
                { label: '“private banking”', href: '#' },
                { label: ARTICLE.id },
              ]}
              maxItems={3}
            />
          </Masthead>
        }
        sidebarHidden
        aside={
          <Stack gap={6} style={{ padding: 'var(--cds-space-5)' }}>
            <Panel title="Document" variant="plain" padding="none">
              <Stack gap={3} style={{ paddingTop: 'var(--cds-space-3)' }}>
                <Meta label="Reference" value={<span className="cds-mono">{ARTICLE.id}</span>} />
                <Meta label="Section" value={ARTICLE.section} />
                <Meta label="Author" value={ARTICLE.author} />
                <Meta label="Published" value={formatDate(ARTICLE.published)} />
                <Meta label="Length" value={`${ARTICLE.words.toLocaleString('en-US')} words`} />
                <Meta label="Language" value="English" />
                <Meta
                  label="Status"
                  value={
                    <Badge tone={ARTICLE.status === 'published' ? 'success' : 'warning'} size="sm">
                      {ARTICLE.status}
                    </Badge>
                  }
                />
              </Stack>
            </Panel>

            <div>
              <Divider label="Mentions over time" />
              <Stack gap={2} style={{ paddingTop: 'var(--cds-space-3)' }}>
                <Sparkline
                  data={[2, 4, 3, 8, 14, 11, 19, 24, 18, 31, 28, 42]}
                  value={n => n}
                  label="Mentions of this document over twelve months"
                  summary="rising sharply since the consultation opened"
                  kind="area"
                  width={220}
                  height={44}
                  endpoint
                />
                <p className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
                  Cited 42 times in the last month.
                </p>
              </Stack>
            </div>

            <div>
              <Divider label="Topics" />
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--cds-space-2)',
                  paddingTop: 'var(--cds-space-3)',
                }}
              >
                {['Banking', 'Regulation', 'FINMA', 'Consolidation', 'Switzerland'].map(topic => (
                  <Tag key={topic}>{topic}</Tag>
                ))}
              </div>
            </div>

            <div>
              <Divider label="Cited by" />
              <Stack gap={3} style={{ paddingTop: 'var(--cds-space-3)' }}>
                {related.map(item => (
                  <a key={item.id} className="cds-link-quiet cds-body-sm" href={`#${item.id}`}>
                    {item.title}
                  </a>
                ))}
              </Stack>
            </div>
          </Stack>
        }
        asideWidth="20rem"
        // The metadata, topics and citations exist nowhere else on this screen,
        // so on a narrow one they move below the article rather than vanish.
        asideCollapse="stack"
      >
        <article className="sb-article">
          <Stack gap={6} style={{ maxWidth: 'var(--cds-measure)', marginInline: 'auto' }}>
            <header>
              <Stack gap={3}>
                <span className="cds-kicker" style={{ color: 'var(--cds-color-text-accent)' }}>
                  {ARTICLE.section}
                </span>
                <h1 className="cds-headline" style={{ margin: 0 }}>
                  <Highlight query={QUERY}>{ARTICLE.title}</Highlight>
                </h1>
                <p className="cds-lede" style={{ margin: 0 }}>
                  The regulator has reopened a question it shelved in 2019, and the answer this time
                  will decide what a Swiss bank is allowed to become.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--cds-space-3)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-muted)' }}>
                    {ARTICLE.author} · {formatDate(ARTICLE.published)}
                  </span>
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--cds-space-2)' }}>
                    <Button
                      variant={saved ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSaved(s => !s)}
                    >
                      <Icon name="bookmark" size={13} /> {saved ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="external" size={13} /> Original
                    </Button>
                  </span>
                </div>
              </Stack>
            </header>

            <Divider tone="accent" />

            <div className="cds-body" style={{ display: 'grid', gap: 'var(--cds-space-5)' }}>
              {BODY.map((paragraph, index) => (
                <p key={index} style={{ margin: 0 }}>
                  <Highlight query={QUERY}>{paragraph}</Highlight>
                </p>
              ))}
            </div>

            <Panel variant="sunken" padding="md" title="Editor's note">
              <p className="cds-body-sm" style={{ margin: 0 }}>
                An earlier version of this piece gave the consultation deadline as August. It closes
                in September.
              </p>
            </Panel>

            <div>
              <Divider label="Related" />
              <div style={{ marginTop: 'var(--cds-space-4)' }}>
                <ResultList dividers>
                  {related.map(item => (
                    <ResultCard
                      key={item.id}
                      kicker={item.section}
                      title={item.title}
                      snippet={item.snippet}
                      query={QUERY}
                      href="#"
                      density="compact"
                      meta={[formatDate(item.published), item.author]}
                    />
                  ))}
                </ResultList>
              </div>
            </div>
          </Stack>
        </article>
      </AppShell>
    )
  },
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--cds-space-3)' }}>
      <span
        className="cds-kicker"
        style={{ width: '5.5rem', flex: 'none', color: 'var(--cds-color-text-subtle)' }}
      >
        {label}
      </span>
      <span className="cds-body-sm">{value}</span>
    </div>
  )
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
      storyId="patterns-document-reader--reader"
      theme={String(context.globals.theme ?? 'light')}
      caption="Reader at 390 x 844"
    />
  ),
}
