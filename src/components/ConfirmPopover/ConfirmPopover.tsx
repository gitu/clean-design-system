import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Popover, type PopoverTriggerProps } from '../Popover/Popover'
import { Stack } from '../Stack/Stack'
import './ConfirmPopover.css'

export interface ConfirmPopoverProps {
  /** The control being confirmed — a delete button, usually. */
  trigger: (props: PopoverTriggerProps) => ReactNode
  /** The question. One line, and name the consequence rather than the verb. */
  title: ReactNode
  /** A second line, for the part that is not obvious from the question. */
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` rules the confirm button in red. */
  tone?: 'default' | 'danger'
  align?: 'start' | 'end'
  onConfirm: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * A confirmation anchored to the thing being confirmed.
 *
 * The small counterpart to `Dialog tone="danger"`, and choosing between them is
 * a question about consequence, not about frequency. A `Dialog` takes the page
 * over, which is right when what is about to happen cannot be undone and the
 * reader needs to read a sentence about it. This is right when the answer is
 * obvious from what is on screen two inches away — removing one row, cancelling
 * one booking — and taking the page away to ask would lose the very context
 * that makes the question easy.
 *
 * Focus lands on **cancel**, not confirm. A popover that opens with the
 * destructive button focused turns a stray Return into the thing it was
 * supposed to prevent.
 */
export function ConfirmPopover({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  align = 'end',
  onConfirm,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: ConfirmPopoverProps) {
  return (
    <Popover
      label={typeof title === 'string' ? title : 'Confirm'}
      align={align}
      width="16rem"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className={className}
      trigger={trigger}
    >
      {close => (
        <Stack gap={3}>
          <Stack gap={1}>
            <p className="cds-confirm__title cds-body-sm">{title}</p>
            {description && (
              <p className="cds-confirm__description cds-body-sm">{description}</p>
            )}
          </Stack>
          <Stack direction="row" gap={2} justify="end">
            <Button size="sm" variant="ghost" data-autofocus onClick={() => close()}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={() => {
                // No focus return: the trigger is usually about to be removed
                // from the document by the very action being confirmed.
                close(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </Stack>
        </Stack>
      )}
    </Popover>
  )
}
