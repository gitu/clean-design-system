import type { Meta, StoryObj } from '@storybook/react-vite'
import { FacetItem } from './FacetItem'

const meta = {
  title: 'Search/FacetItem',
  component: FacetItem,
  args: { label: 'Finance', count: 1284 },
} satisfies Meta<typeof FacetItem>

export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  // WCAG 2.2 SC 1.4.3 exempts text that is part of an inactive control, which
  // is the whole point of the disabled row here — so the contrast rule is
  // scoped away from it rather than switched off for the story.
  parameters: { a11y: { context: { exclude: ['.is-disabled'] } } },
  render: () => (
    <div style={{ maxWidth: 264, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <FacetItem label="Finance" count={1284} defaultChecked onOnly={() => {}} />
      <FacetItem label="Economy" count={967} onOnly={() => {}} />
      <FacetItem label="Politics" count={812} onOnly={() => {}} />
      <FacetItem label="A very long facet value that will be truncated" count={41} />
      <FacetItem label="Corrections" count={0} />
      <FacetItem label="Disabled" count={12} disabled />
    </div>
  ),
}

export const WithSwatches: Story = {
  render: () => (
    <div style={{ maxWidth: 264, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <FacetItem label="Published" count={3891} swatch="var(--cds-color-success)" defaultChecked />
      <FacetItem label="Embargoed" count={142} swatch="var(--cds-color-warning)" />
      <FacetItem label="Retracted" count={7} swatch="var(--cds-color-danger)" />
    </div>
  ),
}

export const SingleSelect: Story = {
  render: () => (
    <div style={{ maxWidth: 264, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <FacetItem type="radio" name="lang" label="German" count={2640} defaultChecked />
      <FacetItem type="radio" name="lang" label="English" count={1502} />
      <FacetItem type="radio" name="lang" label="French" count={428} />
    </div>
  ),
}

export const Playground: Story = { render: args => <div style={{ maxWidth: 264 }}><FacetItem {...args} /></div> }
