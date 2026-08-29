import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button, Icon, Stack } from '../index'

/* ---------------------------------------------------------------------------
 * Stand-ins for components the system does not have.
 *
 * Everything in this file is written at story level on purpose. The
 * find-my-place patterns are the evidence for what the system is missing, and
 * evidence is more convincing as working code than as a list: each of these is
 * a screen that could not be built with what exists, reduced to the smallest
 * thing that made it buildable.
 *
 * None of it is exported from `src/index.ts` and none of it reaches `dist/`.
 * The next step is to promote each into `src/components/` properly — with its
 * own CSS file, stories, controlled/uncontrolled handling and the a11y work
 * these deliberately skimp on — and then delete it from here.
 * ------------------------------------------------------------------------- */

/**
 * A popover: arbitrary content anchored to a control.
 *
 * `Menu` is a list of actions and nothing else, so there is currently no way to
 * anchor *arbitrary content* to a control — a short form, a confirmation, a
 * date picker. Two of the find-my-place patterns need exactly that, which is
 * the observation this file exists to record: it is the shape of `Popover` and
 * `ConfirmPopover`, written out at story level so the gap is visible rather
 * than argued.
 *
 * Deliberately modelled on `Menu`'s approach so the real component is a short
 * step from here: positioned by CSS against a relatively-placed wrapper rather
 * than measured and placed by script, which keeps it renderable on a server and
 * removes the class of bug where the panel appears in the wrong place for one
 * frame. The cost is the same as `Menu`'s — it cannot flip away from a viewport
 * edge, so `align` is the manual control.
 */
export function PopoverStandIn({
  trigger,
  children,
  align = 'start',
  label,
  width = '18rem',
}: {
  trigger: (props: {
    onClick: () => void
    'aria-haspopup': 'dialog'
    'aria-expanded': boolean
    'aria-controls': string
    ref: React.Ref<HTMLButtonElement>
  }) => ReactNode
  /** `close(false)` skips returning focus — right when the action moves focus itself. */
  children: (close: (returnFocus?: boolean) => void) => ReactNode
  align?: 'start' | 'end'
  label: string
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback((returnFocus = true) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger({
        onClick: () => setOpen(o => !o),
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': panelId,
        ref: triggerRef,
      })}
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--cds-space-1))',
            [align === 'end' ? 'right' : 'left']: 0,
            width,
            zIndex: 'var(--cds-z-popover)' as unknown as number,
            padding: 'var(--cds-space-3)',
            background: 'var(--cds-color-surface-raised)',
            border: 'var(--cds-hairline) solid var(--cds-color-rule-strong)',
            borderRadius: 'var(--cds-radius-sm)',
            boxShadow: 'var(--cds-shadow-md)',
          }}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

/**
 * An inline confirmation, anchored to the control that triggers it.
 *
 * `Dialog tone="danger"` already covers the irreversible case, and the property
 * detail pattern uses it for deletion. What is missing is the *small* case:
 * removing one row from a list, cancelling one viewing. find-my-place has seven
 * of those and a modal is too much ceremony for every one of them — the modal
 * takes the page over to ask about something the reader can see two inches
 * away.
 */
export function ConfirmStandIn({
  trigger,
  title,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep',
  onConfirm,
  align = 'end',
}: {
  trigger: (props: {
    onClick: () => void
    'aria-haspopup': 'dialog'
    'aria-expanded': boolean
    'aria-controls': string
    ref: React.Ref<HTMLButtonElement>
  }) => ReactNode
  title: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  align?: 'start' | 'end'
}) {
  return (
    <PopoverStandIn label={title} align={align} width="16rem" trigger={trigger}>
      {close => (
        <Stack gap={3}>
          <p className="cds-body-sm" style={{ margin: 0 }}>
            {title}
          </p>
          <Stack direction="row" gap={2} justify="end">
            <Button size="sm" variant="ghost" onClick={() => close()}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                close(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </Stack>
        </Stack>
      )}
    </PopoverStandIn>
  )
}

/**
 * An inline status block — the thing an error, a warning or a note is set in.
 *
 * The status tokens for this already exist (`--cds-color-danger`, `-bg`,
 * `-border`, and the same for success, warning and info); what does not exist
 * is a component that uses them. So every product invents one, and
 * find-my-place has invented it several times over in slightly different ways.
 * That is the argument for `Callout` being real.
 */
export function CalloutStandIn({
  tone = 'info',
  title,
  children,
  actions,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: ReactNode
  children?: ReactNode
  actions?: ReactNode
}) {
  const icon = tone === 'danger' || tone === 'warning' ? 'alert' : 'info'
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      style={{
        display: 'flex',
        gap: 'var(--cds-space-3)',
        padding: 'var(--cds-space-3)',
        background: `var(--cds-color-${tone}-bg)`,
        border: `var(--cds-hairline) solid var(--cds-color-${tone}-border)`,
        borderRadius: 'var(--cds-radius-sm)',
      }}
    >
      <span style={{ color: `var(--cds-color-${tone})`, flex: 'none', lineHeight: 1.2 }}>
        <Icon name={icon} />
      </span>
      <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
        {title && <span className="cds-label">{title}</span>}
        {children && (
          <div className="cds-body-sm" style={{ maxWidth: 'var(--cds-measure)' }}>
            {children}
          </div>
        )}
        {actions && (
          <Stack direction="row" gap={2} style={{ marginTop: 'var(--cds-space-1)' }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </div>
  )
}

/**
 * A summary row that opens.
 *
 * `FacetGroup` already has this behaviour and keeps it to itself; the version
 * here is the general one — a ruled row, a chevron, and a region. find-my-place
 * hand-rolls it in four places, each with its own chevron and its own idea of
 * whether the header is a button.
 *
 * Built on `<details>`/`<summary>`, which gets the semantics and the keyboard
 * for free. The real component would need to decide whether that is the right
 * trade — `details` cannot animate its own height, which is why most design
 * systems reimplement it.
 */
export function DisclosureStandIn({
  summary,
  meta,
  defaultOpen = false,
  children,
}: {
  summary: ReactNode
  meta?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      style={{ borderBottom: 'var(--cds-hairline) solid var(--cds-color-rule)' }}
    >
      <summary
        className="cds-ui"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--cds-space-2)',
          padding: 'var(--cds-space-3) 0',
          cursor: 'pointer',
          listStyle: 'none',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{summary}</span>
        {meta && <span className="cds-body-sm cds-text-subtle">{meta}</span>}
        <Icon name="chevron-down" size={14} />
      </summary>
      <div style={{ paddingBottom: 'var(--cds-space-4)' }}>{children}</div>
    </details>
  )
}

/**
 * A file drop target.
 *
 * find-my-place has three of these — documents, images and floor plans — and
 * they differ only in which extensions they accept and what they say. The
 * system has no file input at all, which is a real hole for an application that
 * collects documents; whether it belongs *here* is the open question, since a
 * drop zone is closer to product furniture than to editorial search.
 *
 * The input is a real `<input type="file">` behind the box rather than a
 * scripted drop handler, so the keyboard path works without any extra work.
 */
export function FileDropStandIn({
  label,
  hint,
  accept,
  onFiles,
}: {
  label: string
  hint?: string
  accept?: string
  onFiles?: (files: FileList) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputId = useId()

  return (
    <div
      onDragOver={event => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => {
        event.preventDefault()
        setDragging(false)
        if (event.dataTransfer?.files.length) onFiles?.(event.dataTransfer.files)
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--cds-space-2)',
        padding: 'var(--cds-space-6)',
        textAlign: 'center',
        background: dragging ? 'var(--cds-color-accent-subtle)' : 'var(--cds-color-surface-sunken)',
        border: `var(--cds-border-width) dashed ${
          dragging ? 'var(--cds-color-accent)' : 'var(--cds-color-rule-strong)'
        }`,
        borderRadius: 'var(--cds-radius-sm)',
      }}
    >
      <Icon name="document" size={20} />
      <label htmlFor={inputId} className="cds-ui" style={{ cursor: 'pointer' }}>
        {label}
      </label>
      {hint && <span className="cds-body-sm cds-text-subtle">{hint}</span>}
      <input
        id={inputId}
        type="file"
        multiple
        accept={accept}
        className="cds-sr-only"
        onChange={event => event.target.files && onFiles?.(event.target.files)}
      />
    </div>
  )
}
