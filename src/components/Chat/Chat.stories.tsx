import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ChatThread } from './ChatThread'
import { ChatMessage } from './ChatMessage'
import { ChatComposer } from './ChatComposer'
import { ChatToolCall } from './ChatToolCall'
import { ChatQuestion, type ChatAnswer } from './ChatQuestion'
import { ChatArtifact } from './ChatArtifact'
import { ChatFile } from './ChatFile'
import { ChatDiff } from './ChatDiff'
import { ChatImage } from './ChatImage'
import { ChatMarkdown } from './ChatMarkdown'
import { Stack } from '../Stack/Stack'

const meta = {
  title: 'Assistant/Chat',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const FILE = `export function score(doc: Doc, query: Query): number {
  const text = bm25(doc, query)
  const authority = doc.citations > 0 ? Math.log1p(doc.citations) : 0
  const freshness = 1 / (1 + ageInYears(doc.published))
  return text + authority * 0.4 + freshness * 0.6
}

export function explain(doc: Doc, query: Query): Explanation {
  return { text: bm25(doc, query), authority: doc.citations, published: doc.published }
}`

const PATCH = `--- a/src/search/rank.ts
+++ b/src/search/rank.ts
@@ -3,4 +3,5 @@ export function score(doc: Doc, query: Query): number {
   const authority = doc.citations > 0 ? Math.log1p(doc.citations) : 0
-  const freshness = 1 / (1 + ageInYears(doc.published))
-  return text + authority * 0.4 + freshness * 0.6
+  const freshness = Math.max(1 / (1 + ageInYears(doc.published)), 0.15)
+  return text + authority * 0.4 + freshness * 0.3
 }`

export const Turns: Story = {
  render: () => (
    <ChatThread style={{ maxHeight: 420 }}>
      <ChatMessage role="user" at="2024-07-08T09:02:00Z">
        <p>Why is the archive returning nothing for “bundesgesetz archiv”?</p>
      </ChatMessage>
      <ChatMessage role="assistant" at="2024-07-08T09:02:00Z">
        <p>Because freshness outweighs text relevance for anything older than about 2015.</p>
      </ChatMessage>
      <ChatMessage role="assistant" status="streaming">
        <p>Checking the ranker</p>
      </ChatMessage>
      <ChatMessage role="assistant" status="error">
        <p>The index timed out after 30 seconds. Nothing was changed.</p>
      </ChatMessage>
    </ChatThread>
  ),
}

/** Collapsed by default; a failed call opens itself, because that is the bit you need. */
export const ToolCalls: Story = {
  render: () => (
    <Stack gap={3}>
      <ChatToolCall name="query_index" summary="Reading query_stats" status="running" />
      <ChatToolCall name="query_index" summary="8 rows over 28 days" duration={412}>
        <pre>{'{ "table": "query_stats", "window": "28d" }'}</pre>
      </ChatToolCall>
      <ChatToolCall name="edit_file" summary="Permission denied" status="failed" duration={12}>
        <pre>EACCES: permission denied, open 'src/search/rank.ts'</pre>
      </ChatToolCall>
    </Stack>
  ),
}

/**
 * Several questions in one turn, mixing single and multiple choice, each with a
 * row for an answer the model did not think of.
 *
 * More than one goes into tabs, and a tab picks up a tick as soon as its
 * question has something in it — so the reader can see how much is left without
 * opening each one. The set submits together.
 */
export const Questions: Story = {
  render: () => {
    const [answered, setAnswered] = useState<Record<string, ChatAnswer> | undefined>()
    return (
      <Stack gap={4}>
        <ChatQuestion
          answered={answered}
          onAnswer={setAnswered}
          questions={[
            {
              id: 'approach',
              header: 'Approach',
              question: 'Which fix should I apply?',
              hint: 'The first changes ranking everywhere, so it is worth being deliberate.',
              options: [
                { id: 'reweight', label: 'Halve the freshness weight', description: 'Two lines; affects every query.' },
                { id: 'synonyms', label: 'Add a synonym set', description: 'Narrower and safer.' },
              ],
            },
            {
              id: 'verify',
              header: 'Verify',
              question: 'What should I check first?',
              multiple: true,
              options: [
                { id: 'ndcg', label: 'NDCG on the judged set' },
                { id: 'zero', label: 'Zero-result rate' },
                { id: 'latency', label: 'p95 latency' },
              ],
            },
          ]}
        />
        {answered && (
          <pre className="cds-mono" style={{ fontSize: 12 }}>
            {JSON.stringify(answered, null, 2)}
          </pre>
        )}
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tabs = () => canvas.getAllByRole('tab')
    const marked = () => tabs().filter(tab => tab.textContent?.includes('answered')).length

    expect(marked()).toBe(0)
    expect(canvas.getByText('0 of 2 answered')).toBeInTheDocument()

    // Answering the first question ticks its tab and nothing else.
    await userEvent.click(canvas.getByLabelText(/Halve the freshness weight/))
    expect(marked()).toBe(1)
    expect(canvas.getByText('1 of 2 answered')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Answer' })).toBeDisabled()

    // The second question lives behind its own tab.
    await userEvent.click(canvas.getByRole('tab', { name: /Verify/ }))
    await userEvent.click(canvas.getByLabelText(/NDCG on the judged set/))
    expect(marked()).toBe(2)
    expect(canvas.getByText('2 of 2 answered')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'Answer' })).toBeEnabled()
  },
}

/** A file at a useful length, honest about what it is holding back. */
export const Files: Story = {
  render: () => (
    <Stack gap={4}>
      <ChatFile
        path="src/search/rank.ts"
        language="ts"
        content={FILE}
        totalLines={318}
        size={9412}
        highlightLines={[4, 5]}
        preview={5}
      />
      <ChatFile path="src/search/index.ts" language="ts" totalLines={94} size={2210} />
    </Stack>
  ),
}

export const Diffs: Story = {
  render: () => <ChatDiff patch={PATCH} preview={false} />,
}

/** A restricted subset, built as elements — no HTML is ever injected. */
export const Markdown: Story = {
  render: () => (
    <ChatMarkdown>
      {`## What changed

Freshness was **swamping** text relevance. The fix floors the decay at \`0.15\`.

- Helps three of the eight worst queries
- Shifts results for *every* query
- Ships behind a variant

> Compare on the judged set before promoting.

1. Halve the weight
2. Rerun the evaluation
3. Promote if NDCG holds

See the [ranking notes](https://example.com/notes).

---

\`\`\`ts
const freshness = Math.max(1 / (1 + ageInYears(doc.published)), 0.15)
\`\`\``}
    </ChatMarkdown>
  ),
}

export const Artifacts: Story = {
  render: () => (
    <ChatArtifact
      title="Rank movement"
      source="rerun of query_index against the judged set · 20 queries"
    >
      <ChatImage
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='140'%3E%3Crect width='420' height='140' fill='%23f6f4f1'/%3E%3Ctext x='210' y='74' text-anchor='middle' font-family='monospace' font-size='13' fill='%23726c62'%3Erank-diff.png%3C/text%3E%3C/svg%3E"
        alt="Rank movement for the judged query set"
        width={420}
        height={140}
      />
    </ChatArtifact>
  ),
}

export const Composer: Story = {
  render: () => {
    const [sent, setSent] = useState<string[]>([])
    return (
      <Stack gap={3}>
        {sent.map((message, index) => (
          <ChatMessage key={index} role="user">
            <p>{message}</p>
          </ChatMessage>
        ))}
        <ChatComposer
          onSubmit={value => setSent(current => [...current, value])}
          hint="Enter sends · Shift+Enter for a new line"
        />
      </Stack>
    )
  },
}
