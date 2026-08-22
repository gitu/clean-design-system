import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResultMeta } from './ResultMeta'
import { SortControl } from '../SortControl/SortControl'
import { SORT_OPTIONS } from '../../stories/fixtures'

const meta = {
  title: 'Search/ResultMeta',
  component: ResultMeta,
  args: { total: 4231, from: 1, to: 20, took: 82, query: 'swiss banking' },
} satisfies Meta<typeof ResultMeta>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithActions: Story = {
  render: args => (
    <ResultMeta
      {...args}
      actions={
        <SortControl
          options={SORT_OPTIONS}
          value="relevance"
          onChange={() => {}}
        />
      }
    />
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ResultMeta total={0} loading query="swiss banking" />
      <ResultMeta total={0} query="zzzzz" />
      <ResultMeta total={1} from={1} to={1} query="A-38211" took={9} />
      <ResultMeta total={1284027} from={2001} to={2020} took={317} />
    </div>
  ),
}

export const Playground: Story = {}
