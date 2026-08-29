import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { Disclosure } from './Disclosure'

const meta = {
  title: 'Layout/Disclosure',
  component: Disclosure,
  args: {
    summary: 'Version 4',
    children: 'Raised the ceiling and dropped the “lift required” condition.',
  },
} satisfies Meta<typeof Disclosure>

export default meta
type Story = StoryObj<typeof meta>

const VERSIONS = [
  { id: 4, author: 'Nina', at: '22 Aug', found: 31, summary: 'Raised the ceiling to CHF 3,600.' },
  { id: 3, author: 'Flo', at: '5 Aug', found: 24, summary: 'Added Winterthur and Baden.' },
  { id: 2, author: 'Flo', at: '21 Jul', found: 12, summary: 'Narrowed to Zürich city and Zug.' },
]

/**
 * A stack of them, which is the usual case. The hairline is the separator, so
 * no wrapper is needed to make them read as a list.
 */
export const Stacked: Story = {
  render: () => (
    <div style={{ maxWidth: '38rem' }}>
      {VERSIONS.map((version, i) => (
        <Disclosure
          key={version.id}
          headingLevel={3}
          defaultOpen={i === 0}
          summary={`Version ${version.id} · ${version.author}, ${version.at}`}
          meta={`${version.found} found`}
        >
          <Stack gap={3}>
            <p className="cds-body-sm" style={{ margin: 0 }}>{version.summary}</p>
            <Stack direction="row" gap={2}>
              <Button size="sm" variant="secondary">Compare</Button>
              {i !== 0 && <Button size="sm" variant="ghost">Restore</Button>}
            </Stack>
          </Stack>
        </Disclosure>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('a closed region is hidden from the accessibility tree', async () => {
      await expect(canvas.queryByText('Added Winterthur and Baden.')).not.toBeVisible()
    })

    await step('opening one reveals it and reports the state', async () => {
      const summary = canvas.getByRole('button', { name: /Version 3/ })
      await userEvent.click(summary)
      await expect(summary).toHaveAttribute('aria-expanded', 'true')
      await expect(canvas.getByText('Added Winterthur and Baden.')).toBeVisible()
    })
  },
}

/** Controlled, for an accordion where only one may be open at a time. */
export const Accordion: Story = {
  render: () => {
    const [openId, setOpenId] = useState<number | null>(4)
    return (
      <div style={{ maxWidth: '38rem' }}>
        {VERSIONS.map(version => (
          <Disclosure
            key={version.id}
            summary={`Version ${version.id}`}
            meta={`${version.found} found`}
            open={openId === version.id}
            onOpenChange={next => setOpenId(next ? version.id : null)}
          >
            <p className="cds-body-sm" style={{ margin: 0 }}>{version.summary}</p>
          </Disclosure>
        ))}
      </div>
    )
  },
}

export const Playground: Story = { args: { defaultOpen: true, meta: '31 found' } }
