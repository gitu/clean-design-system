import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { useFieldControl } from '../Field/FieldContext'
import { Icon, type IconName } from '../Icon/Icon'
import { IconButton } from '../IconButton/IconButton'
import { Markdown } from '../Markdown/Markdown'
import {
  COMMANDS,
  continueList,
  countWords,
  type EditResult,
  type MarkdownCommandId,
} from './markdown-commands'
import './MarkdownEditor.css'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  /**
   * Which toolbar buttons to show, in order. Trim it for a comment box;
   * the default is the set a body field needs.
   */
  commands?: MarkdownCommandId[]
  placeholder?: string
  /** Visible rows in the write pane. The preview matches its height. */
  rows?: number
  /**
   * `tabs` puts write and preview behind a switch — right on a phone and in a
   * narrow column. `split` shows both at once. `off` drops the preview.
   */
  preview?: 'tabs' | 'split' | 'off'
  /** Which pane starts in front. Only meaningful with `preview="tabs"`. */
  defaultPane?: 'write' | 'preview'
  /**
   * Soft ceiling. Going over is shown, not prevented — truncating someone's
   * sentence mid-word to enforce a limit loses their work to save a validation
   * message.
   */
  maxLength?: number
  /** Show the word and character count under the editor. */
  showCount?: boolean
  /** Extra note in the footer — a syntax reminder, usually. */
  hint?: ReactNode
  invalid?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  id?: string
  'aria-describedby'?: string
  /** Accessible name, when there is no surrounding `<Field label>`. */
  label?: string
  className?: string
}

const DEFAULT_COMMANDS: MarkdownCommandId[] = [
  'heading',
  'bold',
  'italic',
  'code',
  'link',
  'quote',
  'list',
  'list-ordered',
]

const nf = new Intl.NumberFormat('en-US')

/**
 * A text field for prose, with the markup it accepts made visible.
 *
 * Deliberately **not** a rich-text editor. A `contentEditable` surface owns the
 * document model, which means it owns paste, undo, IME composition, selection
 * and every browser's disagreements about all five — and the value it hands
 * back is HTML, which then needs sanitising before it can ever be shown again.
 * This is a `<textarea>`: the value is the source, the source is what gets
 * stored, and the preview is `Markdown`, which constructs elements and never
 * injects HTML. There is no sanitiser here because there is nothing to sanitise.
 *
 * What it does add is the part people actually miss from a plain textarea:
 * the toolbar and its shortcuts operate on the *selection* — wrapping it,
 * toggling the wrap back off, prefixing whole lines the selection touches —
 * and Enter continues a list. Every one of those lives in
 * `markdown-commands.ts` as a pure function, so the offset arithmetic is
 * readable on its own.
 *
 * Undo survives all of it: edits are written back through the textarea's own
 * value with the selection restored, so the browser's native undo stack still
 * has them.
 */
export function MarkdownEditor({
  value,
  onChange,
  commands = DEFAULT_COMMANDS,
  placeholder,
  rows = 10,
  preview = 'tabs',
  defaultPane = 'write',
  maxLength,
  showCount = true,
  hint,
  invalid,
  disabled,
  readOnly = false,
  required,
  id,
  'aria-describedby': describedByProp,
  label,
  className,
}: MarkdownEditorProps) {
  const field = useFieldControl({
    id,
    'aria-describedby': describedByProp,
    invalid,
    required,
    disabled,
  })

  const uid = useId()
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const [pane, setPane] = useState<'write' | 'preview'>(defaultPane)

  const showWrite = preview !== 'tabs' || pane === 'write'
  const showPreview = preview === 'split' || (preview === 'tabs' && pane === 'preview')
  const locked = field.disabled || readOnly

  /**
   * Where the caret should land once the new value has been painted.
   *
   * Setting it inline would be pointless — the textarea still holds the old
   * string, so the offsets would be measured against the wrong text and the
   * browser would drop the caret at the end. A `requestAnimationFrame` was the
   * first fix and the wrong one: it lands a frame late, so a second command
   * arriving quickly (a held-down shortcut, a test, an impatient double click)
   * reads a stale selection and wraps the markers it just added. A layout
   * effect runs synchronously after the DOM is updated and before the browser
   * paints, which is exactly the moment this needs.
   */
  const pending = useRef<EditResult['selection'] | null>(null)

  useLayoutEffect(() => {
    const next = pending.current
    if (!next) return
    pending.current = null
    const area = areaRef.current
    if (!area) return
    area.focus()
    area.setSelectionRange(next.start, next.end)
  }, [value])

  const apply = (result: EditResult) => {
    pending.current = result.selection
    onChange(result.value)
  }

  const run = (command: MarkdownCommandId) => {
    const area = areaRef.current
    if (!area || locked) return
    apply(
      COMMANDS[command].run(value, { start: area.selectionStart, end: area.selectionEnd })
    )
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const area = event.currentTarget
    const mod = event.metaKey || event.ctrlKey

    if (mod) {
      const hit = commands.find(id => {
        const key = COMMANDS[id].shortcut?.split('+')[1]?.toLowerCase()
        return key && key === event.key.toLowerCase()
      })
      if (hit) {
        event.preventDefault()
        run(hit)
        return
      }
    }

    if (event.key === 'Enter' && !event.shiftKey && !mod) {
      const next = continueList(value, { start: area.selectionStart, end: area.selectionEnd })
      if (next) {
        event.preventDefault()
        apply(next)
      }
    }
  }

  const words = countWords(value)
  const over = maxLength !== undefined && value.length > maxLength

  return (
    <div
      className={cx(
        'cds-md-editor',
        `cds-md-editor--${preview}`,
        field.invalid && 'is-invalid',
        field.disabled && 'is-disabled',
        className
      )}
    >
      <div className="cds-md-editor__bar">
        <div className="cds-md-editor__tools" role="toolbar" aria-label="Formatting" aria-controls={field.id ?? `${uid}-area`}>
          {commands.map(command => {
            const spec = COMMANDS[command]
            return (
              <IconButton
                key={command}
                icon={<Icon name={spec.icon as IconName} size={15} />}
                // The shortcut belongs in the name, not only in a tooltip —
                // a tooltip is not reachable from a screen reader or a phone.
                label={spec.shortcut ? `${spec.label} (${shortcutLabel(spec.shortcut)})` : spec.label}
                size="sm"
                variant="ghost"
                disabled={locked}
                // The toolbar must not steal focus: the command needs the
                // textarea's selection, and clicking a button would blur it.
                onMouseDown={event => event.preventDefault()}
                onClick={() => run(command)}
              />
            )
          })}
        </div>

        {preview === 'tabs' && (
          <div className="cds-md-editor__panes" role="tablist" aria-label="Editor view">
            {(['write', 'preview'] as const).map(name => (
              <button
                key={name}
                type="button"
                role="tab"
                id={`${uid}-tab-${name}`}
                aria-selected={pane === name}
                aria-controls={`${uid}-pane-${name}`}
                tabIndex={pane === name ? 0 : -1}
                className={cx('cds-md-editor__pane-tab', pane === name && 'is-active')}
                onClick={() => setPane(name)}
                onKeyDown={event => {
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault()
                    setPane(name === 'write' ? 'preview' : 'write')
                  }
                }}
              >
                {name === 'write' ? 'Write' : 'Preview'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="cds-md-editor__panes-body">
        {showWrite && (
          <div
            className="cds-md-editor__write"
            id={`${uid}-pane-write`}
            role={preview === 'tabs' ? 'tabpanel' : undefined}
            aria-labelledby={preview === 'tabs' ? `${uid}-tab-write` : undefined}
          >
            <textarea
              ref={areaRef}
              id={field.id ?? `${uid}-area`}
              className="cds-md-editor__area"
              value={value}
              rows={rows}
              placeholder={placeholder}
              disabled={field.disabled}
              readOnly={readOnly}
              required={field.required}
              aria-label={label}
              aria-invalid={field.invalid || undefined}
              aria-describedby={[field.describedBy, `${uid}-syntax`].filter(Boolean).join(' ')}
              spellCheck
              onChange={event => onChange(event.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        )}

        {showPreview && (
          <div
            className="cds-md-editor__preview"
            id={`${uid}-pane-preview`}
            // Split mode gets a named region rather than `aria-hidden`. Hiding
            // it would be tidier — the source is right there in the textarea —
            // but the rendered prose contains links, and an `aria-hidden`
            // subtree with focusable children is a keyboard trap: tab order
            // still lands on them while the screen reader says nothing.
            {...(preview === 'tabs'
              ? { role: 'tabpanel' as const, 'aria-labelledby': `${uid}-tab-preview` }
              : { role: 'region' as const, 'aria-label': 'Preview' })}
            style={preview === 'split' ? undefined : { minHeight: `${rows * 1.6}em` }}
          >
            {value.trim() ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="cds-md-editor__empty cds-body-sm">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="cds-md-editor__foot">
        <p className="cds-md-editor__hint cds-body-sm" id={`${uid}-syntax`}>
          {hint ?? (
            <>
              Markdown: <code>**bold**</code>, <code>*italic*</code>, <code>`code`</code>,{' '}
              <code>- list</code>, <code>&gt; quote</code>
            </>
          )}
        </p>
        {showCount && (
          <p className={cx('cds-md-editor__count', 'cds-numeric', 'cds-body-sm', over && 'is-over')}>
            {/* Announced on change, because a limit you only discover on submit
                is a limit you discover too late. */}
            <span aria-live="polite">
              {nf.format(words)} {words === 1 ? 'word' : 'words'}
              {maxLength !== undefined && ` · ${nf.format(value.length)}/${nf.format(maxLength)}`}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

/** `Mod+B` reads as `⌘B` on a Mac and `Ctrl+B` everywhere else. */
function shortcutLabel(shortcut: string) {
  const isApple =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  return shortcut.replace('Mod+', isApple ? '⌘' : 'Ctrl+')
}
