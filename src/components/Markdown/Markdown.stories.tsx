import type { Meta, StoryObj } from '@storybook/react-vite'
import { Markdown } from './Markdown'

const meta = {
  title: 'Prose/Markdown',
  component: Markdown,
  args: { children: '' },
} satisfies Meta<typeof Markdown>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = `# The quiet consolidation

Three decades of mergers have left the sector with a handful of institutions
that between them hold **more assets than the rest of the market combined**.

## What changed

1. The capital rules were relaxed in 2011
2. Two of the four largest merged in 2016
3. The regulator's own headcount fell by a fifth

- A *supervisory* board with no supervisors
- A [public consultation](https://example.org/consultation) nobody answered
- One line of code: \`if (assets > threshold) exempt()\`

> The regulator now faces a question it has avoided for years.

---

\`\`\`ts
export function exempt(bank: Bank): boolean {
  return bank.assets > THRESHOLD && bank.domicile === 'CH'
}
\`\`\`
`

/** The whole subset, in one page. Anything not shown here is not supported. */
export const Everything: Story = {
  args: { children: SAMPLE },
  render: args => (
    <div style={{ maxWidth: 680 }}>
      <Markdown {...args} />
    </div>
  ),
}

/**
 * Untrusted input, rendered safely.
 *
 * None of this escapes, and not because anything strips it: the renderer
 * constructs React elements and never hands a string to the DOM as markup, so
 * a `<script>` tag is characters. The `javascript:` URL is the one thing
 * actively refused — a link is the only place a string reaches an API that
 * would execute it.
 */
export const Untrusted: Story = {
  args: {
    children: `A model wrote this: <script>alert('x')</script> and <img src=x onerror=alert(1)>.

It also produced [a link that would run code](javascript:alert(1)) and
[one that will not](https://example.org).`,
  },
  render: args => (
    <div style={{ maxWidth: 680 }}>
      <Markdown {...args} />
    </div>
  ),
}

/** Fenced blocks can be handed to something that knows how to draw them. */
export const CustomCode: Story = {
  args: {
    children: `Before.

\`\`\`sql
SELECT query, zero_rate FROM query_stats ORDER BY zero_rate DESC LIMIT 8
\`\`\`

After.`,
  },
  render: args => (
    <div style={{ maxWidth: 680 }}>
      <Markdown
        {...args}
        renderCode={(code, language) => (
          <figure style={{ margin: 0 }}>
            <figcaption className="cds-kicker" style={{ marginBottom: 4 }}>
              {language ?? 'code'}
            </figcaption>
            <pre className="cds-markdown__code">
              <code>{code}</code>
            </pre>
          </figure>
        )}
      />
    </div>
  ),
}
