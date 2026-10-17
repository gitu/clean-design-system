import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Icon } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import { Menu, type MenuItem, type MenuProps } from './Menu'

const items: MenuItem[] = [
  { id: 'open', label: 'Open listing', icon: <Icon name="external" size={14} /> },
  { id: 'list', label: 'Add to a list', icon: <Icon name="bookmark" size={14} /> },
  { id: 'viewing', label: 'Book a viewing', icon: <Icon name="calendar" size={14} /> },
  { id: 'disabled', label: 'Compare', disabled: true },
  { id: 'archive', label: 'Archive', tone: 'danger' },
]

const trigger: MenuProps['trigger'] = props => (
  <IconButton {...props} icon={<Icon name="more" />} label="More actions" size="sm" />
)

const meta = {
  title: 'Layout/Menu',
  component: Menu,
  parameters: { layout: 'padded' },
  args: { trigger, items, label: 'Listing actions' },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'More actions' })

    await step('opens below the trigger with the first item focused', async () => {
      await userEvent.click(button)
      const menu = await canvas.findByRole('menu', { name: 'Listing actions' })
      await expect(menu).toHaveAttribute('data-placement', 'below')
      await expect(canvas.getByRole('menuitem', { name: 'Open listing' })).toHaveFocus()
    })

    await step('arrow keys skip the disabled row', async () => {
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
      await expect(canvas.getByRole('menuitem', { name: 'Archive' })).toHaveFocus()
    })

    await step('Escape closes it and gives focus back to the trigger', async () => {
      await userEvent.keyboard('{Escape}')
      await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
      await expect(button).toHaveFocus()
    })
  },
}

/**
 * Inside a card that clips its content — the case the top layer is for. The
 * whole menu shows over the card's edge, and opening it does not scroll the
 * card's own content to bring the focused item into view.
 */
export const InClippingCard: Story = {
  name: 'Inside a clipping card',
  render: args => (
    <div
      data-testid="card"
      style={{
        width: '16rem',
        height: '7rem',
        overflow: 'hidden',
        padding: 'var(--cds-space-3)',
        border: 'var(--cds-hairline) solid var(--cds-color-rule)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      }}
    >
      <Menu {...args} align="end" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = canvas.getByTestId('card')
    await userEvent.click(canvas.getByRole('button', { name: 'More actions' }))
    const menu = await canvas.findByRole('menu')

    const box = menu.getBoundingClientRect()
    await expect(box.bottom).toBeGreaterThan(card.getBoundingClientRect().bottom)
    // Nothing paints over its last row.
    const last = document.elementFromPoint(box.left + box.width / 2, box.bottom - 6)
    await expect(menu.contains(last)).toBe(true)
    await expect(card.scrollTop).toBe(0)
  },
}

/**
 * Near the bottom of the viewport it opens upwards rather than running off the
 * screen.
 */
export const NearBottom: Story = {
  name: 'Near the bottom edge',
  render: args => (
    <div style={{ position: 'fixed', insetInlineEnd: '1rem', bottom: '1rem' }}>
      <Menu {...args} align="end" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'More actions' })
    await userEvent.click(button)
    const menu = await canvas.findByRole('menu')

    await waitFor(() => expect(menu).toHaveAttribute('data-placement', 'above'))
    const box = menu.getBoundingClientRect()
    await expect(box.bottom).toBeLessThanOrEqual(button.getBoundingClientRect().top)
    await expect(box.top).toBeGreaterThanOrEqual(0)
    await expect(box.right).toBeLessThanOrEqual(window.innerWidth)
  },
}
