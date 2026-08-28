import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Badge,
  Button,
  Checkbox,
  DateInput,
  DateTimeInput,
  Dialog,
  Divider,
  Field,
  Icon,
  Input,
  MarkdownEditor,
  NavList,
  Panel,
  Progress,
  Radio,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Tag,
  Textarea,
  ToastProvider,
  Toolbar,
  useToast,
  type IsoDate,
  type LocalDateTime,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { MEMBERS, SECTION_FACETS } from './fixtures'

const meta = {
  title: 'Patterns/Document form',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Pinned, so relative date entry and the calendar's month read the same every day. */
const TODAY = '2024-07-08'

const BODY = `## The limits of density

Planners have spent a decade arguing that building upwards would ease pressure
on rents. The evidence from the last four years is **more equivocal** than
either side admits.

Three things changed at the same time, which is why the effect is so hard to
read:

1. The zoning rules were relaxed in 2019
2. Construction costs rose by a third
3. Interest rates followed, eighteen months later

> "We built the towers. The rents went up anyway." — a planner, on condition of
> anonymity.

The full working is in [the dataset](https://example.org/housing), and the model
itself is a single function in \`housing/density.ts\`.`

interface Draft {
  title: string
  slug: string
  standfirst: string
  body: string
  section: string
  language: string
  author: string
  tags: string[]
  visibility: 'public' | 'internal' | 'embargoed'
  embargo: LocalDateTime | null
  published: IsoDate | null
  indexNow: boolean
  allowComments: boolean
  notify: boolean
}

const INITIAL: Draft = {
  title: 'Zurich’s housing market and the limits of density',
  slug: 'zurich-housing-density',
  standfirst:
    'Planners spent a decade arguing that building upwards would ease pressure on rents. The evidence is **more equivocal** than either side admits.',
  body: BODY,
  section: 'economy',
  language: 'en',
  author: 'u-02',
  tags: ['housing', 'zurich', 'planning'],
  visibility: 'embargoed',
  embargo: '2024-07-12T06:00',
  published: '2024-07-12',
  indexNow: true,
  allowComments: false,
  notify: true,
}

const SECTIONS = [
  { id: 'about', label: 'The document' },
  { id: 'body', label: 'Body' },
  { id: 'publication', label: 'Publication' },
  { id: 'options', label: 'Options' },
]

/**
 * The long form: a document on its way to being published.
 *
 * It exists to answer the questions a form of this length actually raises,
 * which a row of `Input`s in a component story never does.
 *
 * **The body is a `<textarea>`, not a rich-text surface.** What gets stored is
 * markdown — the source people wrote — and the preview is the same `Markdown`
 * renderer the published page uses, so what you see here is what the page gets.
 * Nothing on the path from this field to the page ever passes a string to the
 * DOM as markup, which is why there is no sanitiser anywhere in it.
 *
 * **Dates are typed first and pointed at second.** `+3d`, `8.7.` and `friday`
 * all work, because the people filling this in are at a keyboard all day and a
 * month grid is four clicks. The calendar stays for the case it wins: picking a
 * day by its shape in the week.
 *
 * **The embargo is a wall-clock time with no zone in it.** 06:00 means 06:00 on
 * the desk. Storing it as an instant would mean choosing a zone at the moment
 * of entry and being wrong the next time the clocks change; the label says which
 * clock, and the publishing system owns the conversion.
 *
 * **Validation runs on submit, not on keystroke.** A field that turns red while
 * you are still typing the first three letters of a slug is telling you off for
 * not having finished. Errors appear when you ask to save, and clear as soon as
 * the field is right.
 */
export const Editor: Story = {
  name: 'Document form',
  render: () => (
    <ToastProvider>
      <FormScreen />
    </ToastProvider>
  ),
}

function FormScreen() {
  const { toast } = useToast()
  const [draft, setDraft] = useState<Draft>(INITIAL)
  const [saved, setSaved] = useState<Draft>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [discarding, setDiscarding] = useState(false)
  const [tagDraft, setTagDraft] = useState('')

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft(current => ({ ...current, [key]: value }))

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved])

  /**
   * Every rule in one place, evaluated every render.
   *
   * Not stored in state: derived state that can disagree with the thing it is
   * derived from is the single most common bug in a form this size. `submitted`
   * decides whether the errors are *shown*, which is a different question from
   * whether they exist.
   */
  const errors = useMemo(() => {
    const found: Partial<Record<keyof Draft, string>> = {}
    if (draft.title.trim().length < 8) found.title = 'A headline needs at least eight characters.'
    if (!/^[a-z0-9-]+$/.test(draft.slug)) found.slug = 'Lower case, digits and hyphens only.'
    if (draft.standfirst.trim().length < 20) found.standfirst = 'The standfirst carries the search result. Write at least twenty characters.'
    if (draft.body.trim().length < 40) found.body = 'The body is too short to publish.'
    if (draft.visibility === 'embargoed' && !draft.embargo)
      found.embargo = 'An embargoed document needs the moment it lifts.'
    if (draft.embargo && draft.published && draft.embargo.slice(0, 10) > draft.published)
      found.published = 'Publication cannot be before the embargo lifts.'
    return found
  }, [draft])

  const show = (key: keyof Draft) => (submitted ? errors[key] : undefined)
  const complete = Object.keys(errors).length === 0

  const save = () => {
    setSubmitted(true)
    if (!complete) {
      // Take the writer to the first thing that is wrong rather than making
      // them hunt for it in a form this long.
      const first = Object.keys(errors)[0]
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.scrollIntoView({ block: 'center' })
      toast({
        title: 'Not saved',
        description: `${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'field needs' : 'fields need'} attention.`,
        tone: 'danger',
      })
      return
    }
    setSaved(draft)
    setSubmitted(false)
    toast({ title: 'Draft saved', description: draft.title, tone: 'success' })
  }

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase()
    if (!tag || draft.tags.includes(tag)) return
    set('tags', [...draft.tags, tag])
    setTagDraft('')
  }

  const filled = [
    draft.title.trim().length >= 8,
    draft.standfirst.trim().length >= 20,
    draft.body.trim().length >= 40,
    draft.tags.length > 0,
    draft.visibility !== 'embargoed' || Boolean(draft.embargo),
  ]

  return (
    <AppShell
      header={
        <Masthead
          section="Draft"
          // No Save button up here. The action bar at the foot of the form is
          // always on screen, so a second copy in the masthead is two places to
          // look for one action — and the one further from the fields.
          actions={
            dirty ? (
              <Badge tone="warning" size="sm" dot>
                Unsaved
              </Badge>
            ) : undefined
          }
        />
      }
      sidebar={
        <Stack gap={5} style={{ padding: 'var(--cds-space-4)' }}>
          <NavList
            items={SECTIONS.map(section => ({ id: section.id, label: section.label, href: `#${section.id}` }))}
            value="about"
            label="Sections"
            size="sm"
          />
          <div>
            <Divider label="Readiness" />
            <div style={{ paddingTop: 'var(--cds-space-3)' }}>
              <Progress
                label="Required fields"
                value={filled.filter(Boolean).length}
                max={filled.length}
                showLabel
                valueLabel={`${filled.filter(Boolean).length} of ${filled.length}`}
                size="sm"
              />
            </div>
          </div>
        </Stack>
      }
      sidebarWidth="15rem"
      maxWidth="1180px"
    >
      {/* A real <form>: submit on Enter in a text field is what people expect,
          and it is free as long as the button says what it does. */}
      <form
        className="sb-form sb-page"
        noValidate
        onSubmit={event => {
          event.preventDefault()
          save()
        }}
      >
        <Stack gap={6}>
          <section id="about" className="sb-form__section">
            <Toolbar border="bottom">
              <h2 className="cds-kicker">The document</h2>
            </Toolbar>

            <Stack gap={5} style={{ paddingTop: 'var(--cds-space-5)' }}>
              <div data-field="title">
                <Field label="Headline" required error={show('title')} hint="Shown in search results and at the top of the page.">
                  <Input
                    size="lg"
                    value={draft.title}
                    onChange={event => set('title', event.target.value)}
                  />
                </Field>
              </div>

              <div data-field="slug">
                <Field
                  label="Slug"
                  required
                  error={show('slug')}
                  hint="Permanent once published."
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        set(
                          'slug',
                          draft.title
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[̀-ͯ]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-|-$/g, '')
                        )
                      }
                    >
                      From headline
                    </Button>
                  }
                >
                  <Input
                    mono
                    prefix="/archive/"
                    value={draft.slug}
                    onChange={event => set('slug', event.target.value)}
                  />
                </Field>
              </div>

              <div data-field="standfirst">
                <Field
                  label="Standfirst"
                  required
                  error={show('standfirst')}
                  hint="One or two sentences. This is what a reader sees in a result list."
                >
                  <MarkdownEditor
                    value={draft.standfirst}
                    onChange={next => set('standfirst', next)}
                    commands={['bold', 'italic', 'link']}
                    preview="off"
                    rows={3}
                    maxLength={280}
                  />
                </Field>
              </div>

              <div className="sb-form__row">
                <Field label="Section">
                  <Select
                    value={draft.section}
                    onChange={event => set('section', event.target.value)}
                    options={SECTION_FACETS.map(facet => ({ value: facet.value, label: facet.label }))}
                  />
                </Field>
                <Field label="Language">
                  <Select
                    value={draft.language}
                    onChange={event => set('language', event.target.value)}
                    options={[
                      { value: 'de', label: 'German' },
                      { value: 'en', label: 'English' },
                      { value: 'fr', label: 'French' },
                    ]}
                  />
                </Field>
                <Field label="Byline">
                  <Select
                    value={draft.author}
                    onChange={event => set('author', event.target.value)}
                    options={MEMBERS.slice(0, 6).map(member => ({ value: member.id, label: member.name }))}
                  />
                </Field>
              </div>

              <Field label="Tags" hint="Enter to add. These drive the related-documents panel.">
                <Stack gap={3}>
                  <div className="sb-form__tags">
                    {draft.tags.map(tag => (
                      <Tag
                        key={tag}
                        size="sm"
                        onRemove={() => set('tags', draft.tags.filter(item => item !== tag))}
                        removeLabel={`Remove ${tag}`}
                      >
                        {tag}
                      </Tag>
                    ))}
                    {draft.tags.length === 0 && <span className="cds-body-sm">No tags yet.</span>}
                  </div>
                  <Input
                    value={tagDraft}
                    placeholder="Add a tag"
                    aria-label="Add a tag"
                    onChange={event => setTagDraft(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addTag()
                      }
                    }}
                    iconEnd={
                      <Button variant="ghost" size="sm" disabled={!tagDraft.trim()} onClick={addTag}>
                        Add
                      </Button>
                    }
                  />
                </Stack>
              </Field>
            </Stack>
          </section>

          <section id="body" className="sb-form__section">
            <Toolbar border="bottom">
              <h2 className="cds-kicker">Body</h2>
            </Toolbar>
            <div data-field="body" style={{ paddingTop: 'var(--cds-space-5)' }}>
              <Field
                label="Article"
                required
                error={show('body')}
                hint="Markdown. The preview is the same renderer the published page uses."
              >
                <MarkdownEditor
                  value={draft.body}
                  onChange={next => set('body', next)}
                  preview="split"
                  rows={18}
                />
              </Field>
            </div>
          </section>

          <section id="publication" className="sb-form__section">
            <Toolbar border="bottom">
              <h2 className="cds-kicker">Publication</h2>
            </Toolbar>

            <Stack gap={5} style={{ paddingTop: 'var(--cds-space-5)' }}>
              <Field label="Who can see it" hint="An embargoed document is indexed but hidden until it lifts.">
                <Stack gap={3}>
                  {(
                    [
                      ['public', 'Public', 'Visible to everyone, immediately.'],
                      ['internal', 'Internal', 'Staff only. Never appears in public search.'],
                      ['embargoed', 'Embargoed', 'Hidden until the moment below.'],
                    ] as const
                  ).map(([value, label, description]) => (
                    <Radio
                      key={value}
                      name="visibility"
                      value={value}
                      label={label}
                      description={description}
                      checked={draft.visibility === value}
                      onChange={() => set('visibility', value)}
                    />
                  ))}
                </Stack>
              </Field>

              {draft.visibility === 'embargoed' && (
                <div data-field="embargo">
                  <Field
                    label="Embargo lifts"
                    required
                    error={show('embargo')}
                    hint="Newsroom time. Try “+3d”, “friday”, “930” or “6am”."
                  >
                    <DateTimeInput
                      value={draft.embargo}
                      onChange={next => set('embargo', next)}
                      today={TODAY}
                      min={TODAY}
                      defaultTime="06:00"
                      step={30}
                      zone="CET"
                    />
                  </Field>
                </div>
              )}

              <div className="sb-form__row" data-field="published">
                <Field
                  label="Publication date"
                  error={show('published')}
                  hint="The date printed on the document."
                >
                  <DateInput
                    value={draft.published}
                    onChange={next => set('published', next)}
                    today={TODAY}
                    min="2024-01-01"
                  />
                </Field>
                <Field label="Review by" hint="Optional.">
                  <DateInput value={null} onChange={() => {}} today={TODAY} label="Review by" />
                </Field>
              </div>
            </Stack>
          </section>

          <section id="options" className="sb-form__section">
            <Toolbar border="bottom">
              <h2 className="cds-kicker">Options</h2>
            </Toolbar>

            <Stack gap={4} style={{ paddingTop: 'var(--cds-space-5)' }}>
              <Switch
                checked={draft.indexNow}
                onChange={event => set('indexNow', event.target.checked)}
                label="Index immediately"
                description="Otherwise it waits for the next scheduled crawl."
              />
              <Switch
                checked={draft.allowComments}
                onChange={event => set('allowComments', event.target.checked)}
                label="Allow comments"
              />
              <Checkbox
                checked={draft.notify}
                onChange={event => set('notify', event.target.checked)}
                label="Tell the desk when this publishes"
                description="One message to #desk, at the moment it goes live."
              />
              <Field label="Internal note" hint="Never published. Visible to editors only.">
                <Textarea rows={3} placeholder="Anything the next editor should know." />
              </Field>
            </Stack>
          </section>
        </Stack>

        {/* The bar follows the form to the bottom of the viewport, because a
            form this long otherwise means scrolling back to the top to save. */}
        <Toolbar
          className="sb-form__actions"
          border="top"
          end={
            <>
              <Button variant="ghost" disabled={!dirty} onClick={() => setDiscarding(true)}>
                Discard changes
              </Button>
              <Button type="submit" variant="primary">
                Save draft
              </Button>
            </>
          }
        >
          <span className="cds-body-sm">
            {submitted && !complete ? (
              <span style={{ color: 'var(--cds-color-danger)' }}>
                <Icon name="alert" size={13} /> {Object.keys(errors).length} to fix
              </span>
            ) : dirty ? (
              'Unsaved changes'
            ) : (
              'All changes saved'
            )}
          </span>
        </Toolbar>
      </form>

      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        tone="danger"
        title="Discard changes?"
        description="The draft returns to the last saved version. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDiscarding(false)}>
              Keep editing
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDraft(saved)
                setSubmitted(false)
                setDiscarding(false)
                toast({ title: 'Changes discarded' })
              }}
            >
              Discard
            </Button>
          </>
        }
      />
    </AppShell>
  )
}

/**
 * The same form, invalid, so the error treatment is reviewable without having
 * to break it by hand.
 */
export const WithErrors: Story = {
  name: 'Validation',
  render: () => (
    <ToastProvider>
      <ErrorScreen />
    </ToastProvider>
  ),
}

function ErrorScreen() {
  const [value, setValue] = useState('')
  const [slug, setSlug] = useState('Zurich Housing!')
  const [embargo, setEmbargo] = useState<LocalDateTime | null>(null)
  const [date, setDate] = useState<IsoDate | null>(null)

  return (
    <div className="sb-page" style={{ maxWidth: 620 }}>
      <Stack gap={5}>
        <SegmentedControl
          size="sm"
          label="State"
          value="errors"
          options={[{ value: 'errors', label: 'After a failed save' }]}
          onChange={() => {}}
        />
        <Field label="Headline" required error="A headline needs at least eight characters.">
          <Input size="lg" value={value} onChange={event => setValue(event.target.value)} />
        </Field>
        <Field label="Slug" required error="Lower case, digits and hyphens only.">
          <Input mono prefix="/archive/" value={slug} onChange={event => setSlug(event.target.value)} />
        </Field>
        <Field label="Standfirst" required error="Write at least twenty characters.">
          <MarkdownEditor
            value=""
            onChange={() => {}}
            commands={['bold', 'italic', 'link']}
            preview="off"
            rows={3}
            maxLength={280}
          />
        </Field>
        <Field label="Embargo lifts" required error="An embargoed document needs the moment it lifts.">
          <DateTimeInput value={embargo} onChange={setEmbargo} today={TODAY} zone="CET" />
        </Field>
        <Field label="Publication date" error="Publication cannot be before the embargo lifts.">
          <DateInput value={date} onChange={setDate} today={TODAY} />
        </Field>
        <Panel variant="sunken" padding="md">
          <p className="cds-body-sm" style={{ margin: 0 }}>
            Errors appear on save, not on keystroke. A field that turns red while you are still
            typing the first three letters is telling you off for not having finished.
          </p>
        </Panel>
      </Stack>
    </div>
  )
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-document-form--editor"
      theme={String(context.globals.theme ?? 'light')}
      caption="Document form at 390 × 844"
    />
  ),
}
