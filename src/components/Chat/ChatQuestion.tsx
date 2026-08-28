import { useId, useState } from 'react'
import { cx } from '../../utils/cx'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Input } from '../Input/Input'
import { Tabs } from '../Tabs/Tabs'
import type { ChatQuestionOption } from './chat-types'
import './Chat.css'

export interface ChatQuestionSpec {
  /** Identifies the question in the answer map. */
  id: string
  question: string
  /** A short chip label — what this question is about, in two or three words. */
  header?: string
  /** A line under the question: why the answer changes what happens next. */
  hint?: string
  options: ChatQuestionOption[]
  /** Several answers rather than one. */
  multiple?: boolean
  /**
   * Let the reader write options the model did not think of. On by default: a
   * model's options are a guess, and forcing someone into the closest wrong one
   * produces a worse answer than letting them say what they meant.
   */
  allowOther?: boolean
  otherLabel?: string
}

export interface ChatAnswer {
  /** Chosen option ids. */
  ids: string[]
  /** Anything the reader typed in. More than one only when `multiple`. */
  other: string[]
}

export interface ChatQuestionProps {
  /**
   * Ask several at once. A model that needs three facts should not have to
   * spend three turns and three round-trips getting them — and the reader
   * would rather answer a short form than be interrogated.
   */
  questions: ChatQuestionSpec[]
  onAnswer: (answers: Record<string, ChatAnswer>) => void
  /** Locks the card once answered, so the transcript stays readable. */
  answered?: Record<string, ChatAnswer>
  submitLabel?: string
  className?: string
}

const EMPTY: ChatAnswer = { ids: [], other: [] }

/**
 * The model asking the reader something, with the answers it can act on.
 *
 * This is the piece that makes a tool-using assistant workable. Without it a
 * model that needs one more fact has to ask in prose and then parse a sentence
 * back, which fails often and quietly. Here it gets a map of ids it chose
 * itself, plus whatever the reader typed instead.
 *
 * Rendered as real `fieldset`s with real radios and checkboxes, so it is
 * answerable from the keyboard and a screen reader is told which choices belong
 * to which question. A row of buttons would not.
 *
 * More than one question goes into tabs rather than a stack. Three questions
 * stacked is a form the reader has to scroll before they know how much they are
 * being asked for; three tabs is a set they can see the size of at a glance,
 * with a tick on the ones already done. A single question skips the tab bar —
 * a tab strip of one is furniture.
 */
export function ChatQuestion({
  questions,
  onAnswer,
  answered,
  submitLabel = 'Answer',
  className,
}: ChatQuestionProps) {
  const baseId = useId()
  const [draft, setDraft] = useState<Record<string, ChatAnswer>>({})
  const [pending, setPending] = useState<Record<string, string>>({})

  const locked = answered !== undefined
  const valueFor = (id: string): ChatAnswer => (locked ? (answered[id] ?? EMPTY) : (draft[id] ?? EMPTY))

  const update = (id: string, next: ChatAnswer) =>
    setDraft(current => ({ ...current, [id]: next }))

  const toggle = (spec: ChatQuestionSpec, optionId: string) => {
    if (locked) return
    const current = valueFor(spec.id)
    update(spec.id, {
      ids: spec.multiple
        ? current.ids.includes(optionId)
          ? current.ids.filter(value => value !== optionId)
          : [...current.ids, optionId]
        : [optionId],
      // A single-choice question replaces whatever was typed; a multi keeps it.
      other: spec.multiple ? current.other : [],
    })
  }

  const addOther = (spec: ChatQuestionSpec) => {
    const text = (pending[spec.id] ?? '').trim()
    if (!text) return
    const current = valueFor(spec.id)
    update(spec.id, {
      ids: spec.multiple ? current.ids : [],
      other: spec.multiple ? [...current.other, text] : [text],
    })
    setPending(state => ({ ...state, [spec.id]: '' }))
  }

  const removeOther = (spec: ChatQuestionSpec, text: string) => {
    const current = valueFor(spec.id)
    update(spec.id, { ...current, other: current.other.filter(value => value !== text) })
  }

  // Every question needs something in it before the set can be sent.
  const complete = questions.every(spec => {
    const value = valueFor(spec.id)
    return value.ids.length > 0 || value.other.length > 0
  })

  const answeredCount = questions.filter(spec => {
    const value = valueFor(spec.id)
    return value.ids.length > 0 || value.other.length > 0
  }).length

  const [active, setActive] = useState(questions[0]?.id ?? '')
  const tabbed = questions.length > 1
  const current = questions.find(spec => spec.id === active) ?? questions[0]

  const renderQuestion = (spec: ChatQuestionSpec) => {
    const value = valueFor(spec.id)
    const allowOther = spec.allowOther ?? true
    const name = `${baseId}-${spec.id}`

    return (
      <fieldset key={spec.id} className="cds-chat-question__set" disabled={locked}>
        <legend className="cds-chat-question__legend">
          {!tabbed && spec.header && (
            <span className="cds-chat-question__chip cds-kicker">{spec.header}</span>
          )}
          {spec.question}
        </legend>
        {spec.hint && <p className="cds-chat-question__hint cds-body-sm">{spec.hint}</p>}

        <div className="cds-chat-question__options">
          {spec.options.map(option => {
            const chosen = value.ids.includes(option.id)
            return (
              <label
                key={option.id}
                className={cx('cds-chat-question__option', chosen && 'is-chosen')}
              >
                <input
                  type={spec.multiple ? 'checkbox' : 'radio'}
                  name={name}
                  className="cds-chat-question__input"
                  checked={chosen}
                  onChange={() => toggle(spec, option.id)}
                />
                <span className="cds-chat-question__label">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="cds-chat-question__description">{option.description}</span>
                  )}
                </span>
              </label>
            )
          })}

          {value.other.map(text => (
            <span key={text} className="cds-chat-question__own">
              <span className="cds-chat-question__label">{text}</span>
              {!locked && (
                <button
                  type="button"
                  className="cds-chat-question__remove"
                  aria-label={`Remove \u201c${text}\u201d`}
                  onClick={() => removeOther(spec, text)}
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </span>
          ))}

          {allowOther && !locked && (
            <div className="cds-chat-question__other">
              <Input
                size="sm"
                value={pending[spec.id] ?? ''}
                placeholder={spec.otherLabel ?? 'Something else\u2026'}
                aria-label={`${spec.question} \u2014 your own answer`}
                onChange={event =>
                  setPending(state => ({ ...state, [spec.id]: event.target.value }))
                }
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addOther(spec)
                  }
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!(pending[spec.id] ?? '').trim()}
                onClick={() => addOther(spec)}
              >
                Add
              </Button>
            </div>
          )}
        </div>
      </fieldset>
    )
  }

  const submit = () => {
    const answers: Record<string, ChatAnswer> = {}
    for (const spec of questions) answers[spec.id] = valueFor(spec.id)
    onAnswer(answers)
  }

  return (
    <div className={cx('cds-chat-question', locked && 'is-locked', className)}>
      {tabbed ? (
        <Tabs
          size="sm"
          label="Questions"
          value={current?.id}
          onChange={setActive}
          className="cds-chat-question__tabs"
          items={questions.map(spec => {
            const value = valueFor(spec.id)
            const done = value.ids.length > 0 || value.other.length > 0
            return {
              value: spec.id,
              label: spec.header ?? spec.question,
              // The tick is the marker. It also carries a text label for a
              // screen reader, since a bare icon says nothing.
              icon: done ? (
                <span className="cds-chat-question__done">
                  <Icon name="check" size={12} />
                  <span className="cds-sr-only">answered</span>
                </span>
              ) : undefined,
            }
          })}
        >
          {current && renderQuestion(current)}
        </Tabs>
      ) : (
        current && renderQuestion(current)
      )}

      {!locked && (
        <div className="cds-chat-question__actions">
          {tabbed && (
            <span className="cds-chat-question__progress cds-body-sm cds-numeric">
              {answeredCount} of {questions.length} answered
            </span>
          )}
          <Button size="sm" variant="primary" disabled={!complete} onClick={submit}>
            {submitLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
