import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  BarChart,
  Button,
  ChatArtifact,
  ChatComposer,
  ChatDiff,
  ChatFile,
  ChatImage,
  ChatMarkdown,
  ChatMessage,
  ChatQuestion,
  ChatThread,
  ChatToolCall,
  DataTable,
  Icon,
  Kbd,
  NavList,
  Stack,
  type ChatAnswer,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { TOP_QUERIES, type TopQuery } from './fixtures'

const meta = {
  title: 'Patterns/Assistant',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SESSIONS = [
  { id: 's1', label: 'Zero-result queries', group: 'Today', href: '#' },
  { id: 's2', label: 'Reindex impact', group: 'Today', href: '#' },
  { id: 's3', label: 'Facet counts drift', group: 'Earlier', href: '#' },
]

const PATCH = `diff --git a/src/search/rank.ts b/src/search/rank.ts
index 4f2a91c..8b1d3e7 100644
--- a/src/search/rank.ts
+++ b/src/search/rank.ts
@@ -42,9 +42,12 @@ export function score(doc: Doc, query: Query): number {
   const text = bm25(doc, query)
   const authority = doc.citations > 0 ? Math.log1p(doc.citations) : 0
-  const freshness = 1 / (1 + ageInYears(doc.published))
-  return text + authority * 0.4 + freshness * 0.6
+  // Freshness was swamping text relevance on the long tail: a 2023 stub beat
+  // a 1998 feature on the same terms. Halve its weight and floor the decay.
+  const freshness = Math.max(1 / (1 + ageInYears(doc.published)), 0.15)
+  return text + authority * 0.4 + freshness * 0.3
 }`

const SNIPPET = `export function score(doc: Doc, query: Query): number {
  const text = bm25(doc, query)
  const authority = doc.citations > 0 ? Math.log1p(doc.citations) : 0
  const freshness = 1 / (1 + ageInYears(doc.published))
  return text + authority * 0.4 + freshness * 0.6
}`

const ANSWER = `Three of the eight worst queries share one cause: **freshness is
outweighing text relevance** on the long tail.

For \`bundesgesetz archiv\` the top result is a 2023 stub with two matching
terms, while the 1998 feature that actually answers it sits at rank 14. The
ranker gives freshness a weight of \`0.6\` and lets it decay to nearly zero, so
an old document can never recover.

I can:

1. Halve the freshness weight and floor its decay
2. Leave the ranker alone and add a synonym set instead

The first is a two-line change. The second is safer but will not help the other
two queries.`

/**
 * An assistant that can use tools, ask a question back, and show its work.
 *
 * The point of the family is the third of those. A model answering from the
 * index and a model answering from memory produce identical-looking prose, so
 * every computed thing here says where it came from — a `ChatToolCall` for what
 * ran, a `ChatArtifact` with a source line for what it produced. The reader can
 * tell the difference without trusting the sentence.
 *
 * The second matters nearly as much: when the model needs one more fact it asks
 * with `ChatQuestion` and gets back a set of ids it chose itself, rather than
 * asking in prose and trying to parse a sentence.
 */
export const Conversation: Story = {
  name: 'Conversation',
  render: () => {
    const [answered, setAnswered] = useState<Record<string, ChatAnswer> | undefined>()
    const [busy, setBusy] = useState(false)
    const [extra, setExtra] = useState<string[]>([])

    const columns: Array<TableColumn<TopQuery>> = [
      { key: 'q', header: 'Query', cell: row => <span className="cds-mono">{row.query}</span> },
      {
        key: 'zero',
        header: 'Zero-result',
        align: 'end',
        numeric: true,
        cell: row => `${row.zeroRate.toFixed(1)}%`,
      },
      {
        key: 'searches',
        header: 'Searches',
        align: 'end',
        numeric: true,
        hideBelow: 'sm',
        cell: row => row.searches.toLocaleString('en-US'),
      },
    ]

    return (
      <AppShell
        header={<Masthead section="Assistant" />}
        sidebar={
          <Stack gap={4} style={{ padding: 'var(--cds-space-4)' }}>
            <Button variant="secondary" size="sm" fullWidth>
              <Icon name="plus" size={13} /> New conversation
            </Button>
            <NavList items={SESSIONS} value="s1" size="sm" label="Conversations" />
          </Stack>
        }
        sidebarWidth="15rem"
        maxWidth="1080px"
      >
        <div className="sb-assistant">
          <ChatThread className="sb-assistant__thread">
            <ChatMessage role="user" at="2024-07-08T09:02:00Z">
              <p>
                Which of our worst queries are worth fixing this week? Look at the
                zero-result table and tell me what is actually going wrong.
              </p>
            </ChatMessage>

            <ChatMessage role="assistant" at="2024-07-08T09:02:00Z">
              <ChatToolCall
                name="query_index"
                summary="Read the zero-result table for the last 28 days"
                duration={412}
              >
                <pre>{`{
  "table": "query_stats",
  "window": "28d",
  "order_by": "zero_rate",
  "limit": 8
}`}</pre>
              </ChatToolCall>

              <ChatArtifact
                title="Zero-result rate by query"
                source="query_index · query_stats · last 28 days · sampled at 100%"
              >
                <BarChart
                  label="Zero-result rate by query"
                  data={TOP_QUERIES}
                  x={q => q.query}
                  datumKey={q => q.query}
                  series={[{ key: 'zero', label: 'Zero-result rate', value: q => q.zeroRate }]}
                  layout="horizontal"
                  height={220}
                  formatValue={n => `${n}%`}
                  valueLabels
                  animate={false}
                />
              </ChatArtifact>

              <ChatMarkdown>{ANSWER}</ChatMarkdown>

              <ChatToolCall
                name="read_file"
                summary="src/search/rank.ts, lines 42–50"
                duration={38}
              >
                <ChatFile
                  path="src/search/rank.ts"
                  language="ts"
                  content={SNIPPET}
                  startLine={42}
                  totalLines={318}
                  size={9412}
                  highlightLines={[45, 46]}
                  preview={4}
                />
              </ChatToolCall>

              {/* Three questions in one turn rather than three round trips. */}
              <ChatQuestion
                questions={[
                  {
                    id: 'approach',
                    header: 'Approach',
                    question: 'Which should I do?',
                    hint: 'The first changes ranking for every query, so it is worth being deliberate.',
                    options: [
                      {
                        id: 'reweight',
                        label: 'Halve the freshness weight',
                        description: 'Two lines. Helps all three queries; shifts results everywhere.',
                      },
                      {
                        id: 'synonyms',
                        label: 'Add a synonym set instead',
                        description: 'Safer and narrower. Only fixes bundesgesetz archiv.',
                      },
                      {
                        id: 'both',
                        label: 'Do both, behind a variant',
                        description: 'Ship as variant B and compare on the judged set first.',
                      },
                    ],
                  },
                  {
                    id: 'verify',
                    header: 'Verify',
                    question: 'What should I check before it ships?',
                    multiple: true,
                    options: [
                      { id: 'ndcg', label: 'NDCG on the judged set' },
                      { id: 'zero', label: 'Zero-result rate for the eight worst queries' },
                      { id: 'latency', label: 'p95 latency' },
                      { id: 'manual', label: 'A manual pass over the top twenty' },
                    ],
                  },
                  {
                    id: 'scope',
                    header: 'Scope',
                    question: 'Apply to every collection, or just the archive?',
                    options: [
                      { id: 'archive', label: 'Archive only' },
                      { id: 'all', label: 'Every collection' },
                    ],
                  },
                ]}
                answered={answered}
                onAnswer={answers => {
                  setAnswered(answers)
                  setBusy(true)
                  // Stand-in for the model's next turn.
                  setTimeout(() => {
                    setExtra(['patch'])
                    setBusy(false)
                  }, 600)
                }}
              />
            </ChatMessage>

            {answered && (
              <ChatMessage role="user" at="2024-07-08T09:06:00Z">
                <p>
                  {[answered.approach, answered.verify, answered.scope]
                    .filter(Boolean)
                    .map(answer => [...(answer?.ids ?? []), ...(answer?.other ?? [])].join(', '))
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </ChatMessage>
            )}

            {extra.includes('patch') && (
              <ChatMessage role="assistant" at="2024-07-08T09:06:00Z">
                <ChatToolCall name="edit_file" summary="src/search/rank.ts" duration={126} />
                <ChatMarkdown>
                  {`Done. I floored the decay at \`0.15\` as well — without it a
1998 document still cannot recover no matter how well it matches.`}
                </ChatMarkdown>

                <ChatDiff patch={PATCH} preview={10} />

                <ChatArtifact
                  title="Queries still above 5% after the change"
                  source="rerun of query_index against the judged set"
                >
                  <DataTable
                    columns={columns}
                    rows={TOP_QUERIES.filter(q => q.zeroRate > 5)}
                    rowKey={row => row.query}
                    label="Remaining zero-result queries"
                    density="compact"
                  />
                </ChatArtifact>

                <ChatImage
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='150'%3E%3Crect width='420' height='150' fill='%23f6f4f1'/%3E%3Ctext x='210' y='78' text-anchor='middle' font-family='monospace' font-size='13' fill='%23726c62'%3Erank-diff.png%3C/text%3E%3C/svg%3E"
                  alt="Rank movement for the judged query set before and after the change"
                  caption="Attached by the ranker's evaluation job."
                  width={420}
                  height={150}
                />
              </ChatMessage>
            )}

            {busy && (
              <ChatMessage role="assistant" status="streaming">
                <p>Applying the change</p>
              </ChatMessage>
            )}
          </ChatThread>

          <ChatComposer
            busy={busy}
            onSubmit={() => undefined}
            hint={
              <>
                <Kbd keys="Enter" size="sm" /> sends · <Kbd keys="Shift+Enter" size="sm" /> for a
                new line
              </>
            }
          />
        </div>
      </AppShell>
    )
  },
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-assistant--conversation"
      theme={String(context.globals.theme ?? 'light')}
      caption="Assistant at 390 x 844"
    />
  ),
}
