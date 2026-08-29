import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '../Button/Button'
import { Field } from '../Field/Field'
import { Icon } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { Stack } from '../Stack/Stack'
import { Popover, type PopoverTriggerProps } from './Popover'

const meta = {
  title: 'Layout/Popover',
  component: Popover,
  parameters: {
    // The panel is absolutely positioned; padded gives it somewhere to go.
    layout: 'padded',
  },
  // Required props need a default here, or every story has to restate them
  // just to satisfy the type. Most stories override `render` anyway; these are
  // what the Playground uses.
  args: {
    label: 'Details',
    trigger: (props: PopoverTriggerProps) => (
      <Button {...props} variant="secondary">
        Open
      </Button>
    ),
    children: (
      <p className="cds-body-sm" style={{ margin: 0 }}>
        Anything can go in here.
      </p>
    ),
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ padding: '1rem 0 14rem' }}>
      <Popover
        label="Column settings"
        trigger={props => (
          <Button {...props} variant="secondary" iconEnd={<Icon name="chevron-down" size={14} />}>
            Columns
          </Button>
        )}
      >
        <Stack gap={2}>
          <span className="cds-label">Show</span>
          {['Reference', 'Section', 'Author', 'Published'].map(column => (
            <label key={column} className="cds-ui-sm" style={{ display: 'flex', gap: 8 }}>
              <input type="checkbox" defaultChecked />
              {column}
            </label>
          ))}
        </Stack>
      </Popover>
    </div>
  ),
}

/**
 * A form in a popover. `children` as a function hands back `close`, and the
 * first control carries `data-autofocus` so the keyboard lands where the typing
 * starts rather than on the panel.
 */
export const WithForm: Story = {
  name: 'With a form',
  render: () => (
    <div style={{ padding: '1rem 0 18rem' }}>
      <Popover
        label="Save this search"
        align="start"
        width="20rem"
        trigger={props => (
          <Button {...props} variant="primary" iconStart={<Icon name="bookmark" size={14} />}>
            Save search
          </Button>
        )}
      >
        {close => (
          <Stack gap={3}>
            <Field label="Name" hint="Shown in the saved-search list.">
              <Input data-autofocus defaultValue="Swiss banking, 2024" />
            </Field>
            <Stack direction="row" gap={2} justify="end">
              <Button size="sm" variant="ghost" onClick={() => close()}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={() => close(false)}>
                Save
              </Button>
            </Stack>
          </Stack>
        )}
      </Popover>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('opens, and focus lands in the field', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Save search' }))
      const panel = await canvas.findByRole('dialog', { name: 'Save this search' })
      await expect(panel).toBeInTheDocument()
      await expect(canvas.getByLabelText('Name')).toHaveFocus()
    })

    await step('Escape closes it and gives focus back to the trigger', async () => {
      await userEvent.keyboard('{Escape}')
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
      await expect(canvas.getByRole('button', { name: 'Save search' })).toHaveFocus()
    })
  },
}

/**
 * `align="end"` lines the panel up with the trailing edge of its trigger.
 *
 * This is the manual control for the one thing CSS anchoring cannot do: a
 * popover near the right edge of the viewport would otherwise overflow it.
 */
export const Alignment: Story = {
  render: () => (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 12rem' }}
    >
      {(['start', 'end'] as const).map(align => (
        <Popover
          key={align}
          label={`Aligned ${align}`}
          align={align}
          trigger={props => (
            <Button {...props} variant="secondary">
              align=&quot;{align}&quot;
            </Button>
          )}
        >
          <p className="cds-body-sm" style={{ margin: 0 }}>
            Lined up with the {align === 'start' ? 'leading' : 'trailing'} edge of the
            trigger.
          </p>
        </Popover>
      ))}
    </div>
  ),
}

/** Controlled, for a popover whose open state belongs to the page. */
export const Controlled: Story = {
  args: { open: true },
  render: args => (
    <div style={{ padding: '1rem 0 12rem' }}>
      <Popover
        {...args}
        label="Open by default"
        trigger={props => (
          <Button {...props} variant="secondary">
            Details
          </Button>
        )}
      >
        <p className="cds-body-sm" style={{ margin: 0 }}>
          Held open by the `open` prop. The trigger still reports its state
          through `aria-expanded`.
        </p>
      </Popover>
    </div>
  ),
}
