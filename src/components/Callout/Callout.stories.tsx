import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { Callout } from './Callout'

const meta = {
  title: 'Primitives/Callout',
  component: Callout,
  args: {
    title: 'Imported from Homegate on 2 August',
    children: 'Fields the importer filled in are marked. Re-importing overwrites them.',
  },
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Tones: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: '38rem' }}>
      <Callout tone="info" title="Scheduled for 06:00">
        The next scan runs overnight. Twelve of the day's forty search pages are left.
      </Callout>
      <Callout tone="success" title="Imported 18 fields and 12 photographs">
        The price, room count and address came across. The description was truncated
        by the portal and may need a look.
      </Callout>
      <Callout tone="warning" title="One criterion missed">
        The commute is 31 minutes, six over the brief. Raising the limit to 35 would
        bring in 14 more listings.
      </Callout>
      <Callout tone="danger" title="Homegate refused the request">
        The portal returned 403, which usually means it is rate-limiting us rather
        than that the listing is gone.
      </Callout>
    </Stack>
  ),
}

/** With something to do about it, which is what separates a callout from a note. */
export const WithActions: Story = {
  name: 'With actions',
  render: () => (
    <div style={{ maxWidth: '38rem' }}>
      <Callout
        tone="danger"
        title="Homegate refused the request"
        actions={
          <>
            <Button size="sm" variant="secondary">Try again</Button>
            <Button size="sm" variant="ghost">Enter it by hand</Button>
          </>
        }
      >
        Trying again in a few minutes generally works.
      </Callout>
    </div>
  ),
}

/** Title only, text only, and dismissible. */
export const Shapes: Story = {
  render: () => (
    <Stack gap={3} style={{ maxWidth: '38rem' }}>
      <Callout tone="info" title="Scanning nightly" />
      <Callout tone="info">
        No title. For a single sentence, a heading above it would only say the same
        thing twice.
      </Callout>
      <Callout tone="success" title="Saved" onDismiss={() => {}}>
        Dismissible, for a callout that has been read once and need not stay.
      </Callout>
      <Callout tone="warning" icon={null} title="No glyph">
        `icon={null}` drops it, for a dense column where four marks in a row would
        read as decoration.
      </Callout>
    </Stack>
  ),
}

export const Playground: Story = { args: { tone: 'info' } }
