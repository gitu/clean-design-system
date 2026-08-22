import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toolbar } from './Toolbar'
import { Button } from '../Button/Button'
import { IconButton } from '../IconButton/IconButton'
import { SegmentedControl } from '../SegmentedControl/SegmentedControl'
import { SortControl } from '../SortControl/SortControl'
import { Icon } from '../Icon/Icon'
import { Badge } from '../Badge/Badge'
import { SORT_OPTIONS } from '../../stories/fixtures'

const meta = {
  title: 'Layout/Toolbar',
  component: Toolbar,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const ResultsToolbar: Story = {
  render: () => (
    <Toolbar
      label="Result actions"
      end={
        <>
          <SortControl options={SORT_OPTIONS} value="relevance" onChange={() => {}} />
          <SegmentedControl
            size="sm"
            label="View"
            options={[
              { value: 'list', label: 'List' },
              { value: 'table', label: 'Table' },
            ]}
          />
        </>
      }
    >
      <Button size="sm" variant="secondary" iconStart={<Icon name="filter" size={14} />}>
        Filters
      </Button>
      <Badge tone="accent" size="sm">3</Badge>
      <Button size="sm" variant="ghost">Clear</Button>
    </Toolbar>
  ),
}

export const SelectionToolbar: Story = {
  render: () => (
    <Toolbar
      border="both"
      label="Bulk actions"
      end={<IconButton icon={<Icon name="close" />} label="Cancel selection" size="sm" />}
    >
      <span className="cds-ui-sm cds-numeric">12 selected</span>
      <Button size="sm" variant="secondary" iconStart={<Icon name="document" size={14} />}>Export</Button>
      <Button size="sm" variant="secondary" iconStart={<Icon name="bookmark" size={14} />}>Save</Button>
      <Button size="sm" variant="danger">Remove</Button>
    </Toolbar>
  ),
}
