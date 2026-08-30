import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Drawer } from './Drawer'
import { Button } from '../Button/Button'
import { FacetGroup } from '../FacetGroup/FacetGroup'
import { FacetItem } from '../FacetItem/FacetItem'
import { Stack } from '../Stack/Stack'
import { SECTION_FACETS, LANGUAGE_FACETS } from '../../stories/fixtures'

const meta = {
  title: 'Layout/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: () => {} },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Filters: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 520 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open filters</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="end"
          title="Filters"
          description="4,231 results match the current query"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Clear all</Button>
              <Button variant="primary" onClick={() => setOpen(false)}>Apply</Button>
            </>
          }
        >
          <FacetGroup title="Section" selectedCount={2} onClear={() => {}} maxVisible={6}>
            {SECTION_FACETS.map(f => (
              <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
            ))}
          </FacetGroup>
          <FacetGroup title="Language">
            {LANGUAGE_FACETS.map(f => (
              <FacetItem key={f.value} label={f.label} count={f.count} />
            ))}
          </FacetGroup>
        </Drawer>
      </div>
    )
  },
}

export const DetailPane: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 520 }}>
        <Button variant="secondary" onClick={() => setOpen(true)}>Open document</Button>
        <Drawer open={open} onClose={() => setOpen(false)} side="end" size="lg" title="A-38211">
          <Stack gap={4}>
            <h2 className="cds-title">The quiet consolidation of Swiss private banking</h2>
            <p className="cds-body">
              Three decades of mergers have left the sector with a handful of institutions that
              between them hold more assets than the rest of the market combined. The regulator now
              faces a question it has avoided for years.
            </p>
            <p className="cds-body-sm">M. Brunner · 3 November 2024 · 2,140 words</p>
          </Stack>
        </Drawer>
      </div>
    )
  },
}

export const FromStart: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 520 }}>
        <Drawer open={open} onClose={() => setOpen(false)} side="start" size="sm" title="Navigation">
          <Stack gap={2}>
            {['All documents', 'Saved searches', 'Recent', 'Collections', 'Settings'].map(item => (
              <a key={item} className="cds-link" href={`#${item.toLowerCase().replace(/ /g, '-')}`}>
                {item}
              </a>
            ))}
          </Stack>
        </Drawer>
      </div>
    )
  },
}
