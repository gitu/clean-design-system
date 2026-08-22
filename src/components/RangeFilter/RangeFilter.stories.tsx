import type { Meta, StoryObj } from '@storybook/react-vite'
import { RangeFilter } from './RangeFilter'
import { FacetGroup } from '../FacetGroup/FacetGroup'

const meta = {
  title: 'Search/RangeFilter',
  component: RangeFilter,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RangeFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Numeric: Story = {
  render: () => (
    <div style={{ maxWidth: 264 }}>
      <FacetGroup title="Length">
        <RangeFilter type="number" unit="w" defaultValue={{ min: '500', max: '' }} />
      </FacetGroup>
    </div>
  ),
}

export const Dates: Story = {
  render: () => (
    <div style={{ maxWidth: 264 }}>
      <FacetGroup title="Published">
        <RangeFilter
          type="date"
          applyOn="blur"
          defaultValue={{ min: '2020-01-01', max: '2024-12-31' }}
          presets={[
            { label: 'Last 7 days', value: { min: '2024-11-15', max: '2024-11-22' } },
            { label: 'Last 30 days', value: { min: '2024-10-23', max: '2024-11-22' } },
            { label: 'This year', value: { min: '2024-01-01', max: '2024-12-31' } },
          ]}
        />
      </FacetGroup>
    </div>
  ),
}

export const InvalidBounds: Story = {
  render: () => (
    <div style={{ maxWidth: 264 }}>
      <RangeFilter type="number" defaultValue={{ min: '900', max: '100' }} />
    </div>
  ),
}
