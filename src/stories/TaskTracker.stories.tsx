import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
  ActiveFilters,
  AppShell,
  Avatar,
  Badge,
  BarChart,
  Button,
  Calendar,
  ChartFrame,
  ChartLegend,
  Checkbox,
  DataTable,
  Dialog,
  Divider,
  Drawer,
  EmptyState,
  FacetGroup,
  FacetItem,
  Field,
  Icon,
  IconButton,
  Input,
  LineChart,
  Menu,
  NavList,
  Panel,
  Progress,
  SearchInput,
  SegmentedControl,
  Select,
  Stack,
  Tag,
  Textarea,
  ToastProvider,
  Toolbar,
  useToast,
  type ActiveFilter,
  type IsoDate,
  type MenuItem,
  type NavItem,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import {
  MEMBERS,
  SPRINT_BURNDOWN,
  TASKS,
  TASK_EPICS,
  TASK_LABELS,
  type Member,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from './fixtures'

const meta = {
  title: 'Patterns/Task tracker',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The demo's "now". Everything relative — overdue, due soon — is measured off it. */
const TODAY = '2024-07-08'
/** Who is signed in, for "my tasks" and "assign to me". */
const ME = 'u-03'
/** Last day of the sprint, for the "Due this sprint" view. */
const SPRINT_END = '2024-07-12'

const STATUSES: TaskStatus[] = ['backlog', 'ready', 'doing', 'review', 'done']

const STATUS: Record<TaskStatus, { label: string; hint: string }> = {
  backlog: { label: 'Backlog', hint: 'Agreed, not scheduled' },
  ready: { label: 'Ready', hint: 'Next up' },
  doing: { label: 'In progress', hint: 'Someone is on it' },
  review: { label: 'In review', hint: 'Waiting on a second pair of eyes' },
  done: { label: 'Done', hint: 'Shipped this sprint' },
}

/**
 * Priority carries a glyph as well as a colour.
 *
 * Four levels is exactly the range where a colour-only scale stops working:
 * `high` and `urgent` are both warm, and a red/amber pair is the first thing
 * to collapse under protanopia. The arrow says which is which without asking
 * anyone to compare two hues.
 */
const PRIORITY: Record<
  TaskPriority,
  { label: string; icon: 'arrow-up' | 'dash' | 'arrow-down'; tone: 'danger' | 'warning' | 'neutral' }
> = {
  urgent: { label: 'Urgent', icon: 'arrow-up', tone: 'danger' },
  high: { label: 'High', icon: 'arrow-up', tone: 'warning' },
  normal: { label: 'Normal', icon: 'dash', tone: 'neutral' },
  low: { label: 'Low', icon: 'arrow-down', tone: 'neutral' },
}

const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'normal', 'low']

const SAVED_VIEWS: NavItem[] = [
  { id: 'mine', label: 'My tasks', group: 'Views' },
  { id: 'open', label: 'All open', group: 'Views' },
  { id: 'due', label: 'Due this sprint', group: 'Views' },
  { id: 'blocked', label: 'Blocked', group: 'Views' },
  { id: 'all', label: 'Everything', group: 'Views' },
]

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
})

const longDayFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const MEMBER_BY_ID = new Map<string, Member>(MEMBERS.map(member => [member.id, member]))

function memberName(id: string | null): string {
  return id ? (MEMBER_BY_ID.get(id)?.name ?? 'Unknown') : 'Unassigned'
}

/** Done tasks never count as blocking — the relationship is about waiting. */
function blockers(task: Task, tasks: Task[]): Task[] {
  return task.blockedBy
    .map(id => tasks.find(candidate => candidate.id === id))
    .filter((candidate): candidate is Task => Boolean(candidate) && candidate?.status !== 'done')
}

function checklist(task: Task) {
  const done = task.subtasks.filter(subtask => subtask.done).length
  return { done, total: task.subtasks.length }
}

/* --- The screen ----------------------------------------------------------- */

/**
 * A work tracker: a board you can drag on, the same tasks as a table, a due-date
 * calendar, and the sprint's numbers — over one set of filters.
 *
 * It is here because it is the densest screen the system has been asked to
 * hold, and because three of its problems have no tidy component answer:
 *
 * **Dragging is not an accessible way to move a card.** Native HTML5
 * drag-and-drop does not work from a touchscreen and does not work from a
 * keyboard, so every card also carries a `Menu` with the columns in it. That is
 * not a courtesy path — on a phone it is the *only* path, which is why it is a
 * first-class item in the menu rather than something hidden behind a long
 * press. Each move is announced in a polite live region, because a card
 * silently changing column is invisible to a screen reader.
 *
 * **Blocked is not a column.** Blocking is a relationship between two tasks;
 * a task waiting on another is still in whichever column its own work belongs
 * to. Giving it a column would mean a card's position stopped describing its
 * progress. It is marked on the card and filterable in the sidebar instead.
 *
 * **Four views, one filter set.** Switching from Board to Schedule keeps the
 * assignee and label filters applied, so the view is a way of *looking* at a
 * set of tasks rather than a separate screen with its own state to re-establish.
 */
export const Tracker: Story = {
  name: 'Task tracker',
  render: () => (
    // The provider has to sit above whatever calls useToast.
    <ToastProvider>
      <TrackerScreen />
    </ToastProvider>
  ),
  /**
   * The keyboard route, asserted rather than assumed.
   *
   * Drag-and-drop cannot be tested this way and cannot be *used* this way
   * either, which is the whole reason the menu exists — so this is the path
   * that has to keep working, and the one worth a test.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const columnOf = (id: string) =>
      canvasElement
        .querySelector(`[data-task="${id}"]`)
        ?.closest('.sb-board__column')
        ?.querySelector('.cds-panel__title')?.textContent

    await expect(columnOf('ARC-104')).toBe('In progress')

    await userEvent.click(canvas.getByRole('button', { name: 'Actions for ARC-104' }))
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'Ready' }))

    await expect(columnOf('ARC-104')).toBe('Ready')
    // A card changing column in silence is invisible to a screen reader.
    await expect(canvas.getByRole('status')).toHaveTextContent('ARC-104 moved to Ready.')

    // Move it back — both because the round trip is the thing that has to work,
    // and because this story is what the Mobile frame and the docs page render.
    // A test that leaves the demo somewhere else is a test with side effects.
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for ARC-104' }))
    await userEvent.click(await canvas.findByRole('menuitem', { name: 'In progress' }))
    await expect(columnOf('ARC-104')).toBe('In progress')

    // Clicking scrolls the target into view, which on a narrow screen leaves
    // the board parked on column three. Put it back at the start.
    canvasElement.querySelector('.sb-board')?.scrollTo({ left: 0 })
  },
}

/**
 * The same tasks as a table, with selection and bulk moves.
 *
 * A board is good at *where things are* and bad at *comparing twenty rows*.
 * This is the same filter set rendered as `DataTable`, which is why the view
 * switch sits beside the count rather than in the sidebar: it changes the
 * shape of the answer, not the question.
 */
export const List: Story = {
  render: () => (
    <ToastProvider>
      <TrackerScreen initialView="list" />
    </ToastProvider>
  ),
}

/** Due dates on a month grid, with the overdue and undated tails underneath. */
export const Schedule: Story = {
  render: () => (
    <ToastProvider>
      <TrackerScreen initialView="schedule" />
    </ToastProvider>
  ),
}

/** Where the sprint actually is, as against where it said it would be. */
export const ProgressReport: Story = {
  name: 'Progress',
  render: () => (
    <ToastProvider>
      <TrackerScreen initialView="progress" />
    </ToastProvider>
  ),
}

/**
 * The detail panel, open.
 *
 * Every field in it is editable, because a detail panel that only displays is
 * a second place to read the row you just clicked. The dependencies are links:
 * following a blocker replaces the panel's contents rather than opening a
 * second one, which is the only version of this that works on a phone.
 */
export const Detail: Story = {
  name: 'Task detail',
  render: () => (
    <ToastProvider>
      <TrackerScreen initialOpenId="ARC-104" />
    </ToastProvider>
  ),
}

type View = 'board' | 'list' | 'schedule' | 'progress'

function TrackerScreen({
  initialView = 'board',
  initialOpenId = null,
}: {
  initialView?: View
  initialOpenId?: string | null
}) {
  const { toast } = useToast()

  const [tasks, setTasks] = useState<Task[]>(TASKS)
  const [view, setView] = useState<View>(initialView)
  const [savedView, setSavedView] = useState('open')
  const [query, setQuery] = useState('')
  const [assignees, setAssignees] = useState<string[]>([])
  const [priorities, setPriorities] = useState<TaskPriority[]>([])
  const [labels, setLabels] = useState<string[]>([])

  const [openId, setOpenId] = useState<string | null>(initialOpenId)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  // The schedule opens on the next day that has something on it rather than on
  // today — landing on an empty panel teaches the reader nothing about a view
  // whose whole job is showing what is coming.
  const [day, setDay] = useState<IsoDate | null>(
    () =>
      TASKS.filter(item => item.due && item.due >= TODAY && item.status !== 'done')
        .map(item => item.due!)
        .sort()[0] ?? TODAY
  )

  /**
   * Live-region text for board moves. Deliberately not a toast: a move is
   * undone by moving it back, so a dismissible card for every drag would be
   * noise. What it must not be is silent.
   */
  const [announcement, setAnnouncement] = useState('')

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return tasks.filter(task => {
      if (savedView === 'mine' && (task.assignee !== ME || task.status === 'done')) return false
      if (savedView === 'open' && task.status === 'done') return false
      if (savedView === 'due' && (task.status === 'done' || !task.due || task.due > SPRINT_END))
        return false
      if (savedView === 'blocked' && blockers(task, tasks).length === 0) return false

      if (assignees.length > 0 && !assignees.includes(task.assignee ?? 'none')) return false
      if (priorities.length > 0 && !priorities.includes(task.priority)) return false
      if (labels.length > 0 && !task.labels.some(label => labels.includes(label))) return false

      if (!term) return true
      return (
        task.title.toLowerCase().includes(term) ||
        task.id.toLowerCase().includes(term) ||
        task.epic.toLowerCase().includes(term)
      )
    })
  }, [tasks, savedView, query, assignees, priorities, labels])

  const patch = (id: string, change: Partial<Task>) =>
    setTasks(current =>
      current.map(task => (task.id === id ? { ...task, ...change, updated: TODAY } : task))
    )

  const move = (id: string, status: TaskStatus) => {
    const task = tasks.find(candidate => candidate.id === id)
    if (!task || task.status === status) return
    patch(id, { status })
    setAnnouncement(`${id} moved to ${STATUS[status].label}.`)
  }

  const remove = (task: Task) => {
    const previous = tasks
    setTasks(current => current.filter(candidate => candidate.id !== task.id))
    setSelected(current => current.filter(id => id !== task.id))
    setOpenId(null)
    toast({
      title: `${task.id} deleted`,
      description: task.title,
      tone: 'danger',
      action: { label: 'Undo', onClick: () => setTasks(previous) },
    })
  }

  const activeFilters: ActiveFilter[] = [
    ...assignees.map(id => ({ id: `a:${id}`, facet: 'Assignee', value: memberName(id === 'none' ? null : id) })),
    ...priorities.map(value => ({ id: `p:${value}`, facet: 'Priority', value: PRIORITY[value].label })),
    ...labels.map(value => ({ id: `l:${value}`, facet: 'Label', value })),
  ]

  const removeFilter = (id: string) => {
    const [kind, value] = id.split(':')
    if (!value) return
    if (kind === 'a') setAssignees(current => current.filter(item => item !== value))
    if (kind === 'p') setPriorities(current => current.filter(item => item !== value))
    if (kind === 'l') setLabels(current => current.filter(item => item !== value))
  }

  const clearFilters = () => {
    setAssignees([])
    setPriorities([])
    setLabels([])
  }

  const toggle = <T,>(set: (updater: (current: T[]) => T[]) => void, value: T) =>
    set(current => (current.includes(value) ? current.filter(item => item !== value) : [...current, value]))

  const openTasks = tasks.filter(task => task.status !== 'done')
  const points = {
    done: tasks.filter(task => task.status === 'done').reduce((sum, task) => sum + task.estimate, 0),
    total: tasks.reduce((sum, task) => sum + task.estimate, 0),
  }

  /** Each saved view carries the size of what it would show. */
  const countForView = (id: string) => {
    switch (id) {
      case 'mine':
        return openTasks.filter(task => task.assignee === ME).length
      case 'open':
        return openTasks.length
      case 'due':
        return openTasks.filter(task => task.due && task.due <= SPRINT_END).length
      case 'blocked':
        return tasks.filter(task => blockers(task, tasks).length > 0).length
      default:
        return tasks.length
    }
  }

  /* The sidebar is built once and rendered twice — into `AppShell` on a wide
     screen, and into a `Drawer` on a narrow one, where AppShell drops it. */
  const filters = (
    <Stack gap={5} style={{ padding: 'var(--cds-space-4)' }}>
      <NavList
        items={SAVED_VIEWS.map(item => ({ ...item, count: countForView(item.id) }))}
        value={savedView}
        onChange={id => {
          setSavedView(id)
          setFiltersOpen(false)
        }}
        label="Saved views"
        size="sm"
      />

      <div>
        <Divider label="Filters" />
        <Stack gap={4} style={{ paddingTop: 'var(--cds-space-3)' }}>
          <FacetGroup
            title="Assignee"
            selectedCount={assignees.length}
            onClear={() => setAssignees([])}
          >
            {[...MEMBERS.slice(0, 6), null].map(member => {
              const id = member?.id ?? 'none'
              return (
                <FacetItem
                  key={id}
                  label={member?.name ?? 'Unassigned'}
                  count={tasks.filter(task => (task.assignee ?? 'none') === id).length}
                  checked={assignees.includes(id)}
                  onChange={() => toggle(setAssignees, id)}
                />
              )
            })}
          </FacetGroup>

          <FacetGroup
            title="Priority"
            selectedCount={priorities.length}
            onClear={() => setPriorities([])}
          >
            {PRIORITY_ORDER.map(value => (
              <FacetItem
                key={value}
                label={PRIORITY[value].label}
                count={tasks.filter(task => task.priority === value).length}
                checked={priorities.includes(value)}
                onChange={() => toggle(setPriorities, value)}
              />
            ))}
          </FacetGroup>

          <FacetGroup title="Label" selectedCount={labels.length} onClear={() => setLabels([])}>
            {TASK_LABELS.map(value => (
              <FacetItem
                key={value}
                label={value}
                count={tasks.filter(task => task.labels.includes(value)).length}
                checked={labels.includes(value)}
                onChange={() => toggle(setLabels, value)}
              />
            ))}
          </FacetGroup>
        </Stack>
      </div>

      <div>
        <Divider label="Sprint" />
        <div style={{ paddingTop: 'var(--cds-space-3)' }}>
          <Progress
            label="Points completed"
            value={points.done}
            max={points.total}
            showLabel
            valueLabel={`${points.done} of ${points.total}`}
            size="sm"
          />
        </div>
      </div>
    </Stack>
  )

  const task = tasks.find(candidate => candidate.id === openId) ?? null

  return (
    <AppShell
      header={
        <Masthead
          section="Tasks"
          actions={
            <>
              <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
                <Icon name="plus" size={13} /> New task
              </Button>
              <span className="sb-burger">
                <IconButton
                  icon={<Icon name="filter" size={16} />}
                  label="Open views and filters"
                  variant="secondary"
                  size="sm"
                  aria-expanded={filtersOpen}
                  onClick={() => setFiltersOpen(true)}
                />
              </span>
            </>
          }
        >
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search tasks"
            aria-label="Search tasks"
          />
        </Masthead>
      }
      sidebar={filters}
      sidebarWidth="17rem"
      maxWidth="1600px"
    >
      <Stack gap={4} className="sb-page">
        <Toolbar
          end={
            <SegmentedControl<View>
              size="sm"
              label="View"
              value={view}
              onChange={setView}
              options={[
                { value: 'board', label: 'Board' },
                { value: 'list', label: 'List' },
                { value: 'schedule', label: 'Schedule' },
                { value: 'progress', label: 'Progress' },
              ]}
            />
          }
        >
          <span className="cds-kicker">
            {visible.length} of {tasks.length} tasks
          </span>
        </Toolbar>

        {activeFilters.length > 0 && (
          <ActiveFilters filters={activeFilters} onRemove={removeFilter} onClearAll={clearFilters} />
        )}

        {view === 'board' && (
          <BoardView
            tasks={visible}
            all={tasks}
            onMove={move}
            onOpen={setOpenId}
            onAssignToMe={id => patch(id, { assignee: ME })}
            onDelete={remove}
          />
        )}

        {view === 'list' && (
          <ListView
            tasks={visible}
            all={tasks}
            selected={selected}
            onSelectionChange={setSelected}
            onOpen={setOpenId}
            onMove={move}
            onAssignToMe={ids => ids.forEach(id => patch(id, { assignee: ME }))}
          />
        )}

        {view === 'schedule' && (
          <ScheduleView tasks={visible} all={tasks} day={day} onDayChange={setDay} onOpen={setOpenId} />
        )}

        {view === 'progress' && <ProgressView tasks={tasks} />}
      </Stack>

      {/* One polite region for the whole board, so a move announces once. */}
      <div className="cds-sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <TaskDrawer
        task={task}
        all={tasks}
        onClose={() => setOpenId(null)}
        onOpen={setOpenId}
        onPatch={patch}
        onDelete={remove}
      />

      <NewTaskDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={draft => {
          setTasks(current => [draft, ...current])
          setCreating(false)
          toast({
            title: `${draft.id} created`,
            description: draft.title,
            tone: 'success',
            action: { label: 'Open', onClick: () => setOpenId(draft.id) },
          })
        }}
        nextId={`ARC-${130 + tasks.length - TASKS.length}`}
      />

      {/* Narrow screens: the sidebar AppShell dropped, behind one button. */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Views and filters"
        side="start"
        size="sm"
      >
        {filters}
      </Drawer>
    </AppShell>
  )
}

/* --- Board ---------------------------------------------------------------- */

interface BoardProps {
  tasks: Task[]
  all: Task[]
  onMove: (id: string, status: TaskStatus) => void
  onOpen: (id: string) => void
  onAssignToMe: (id: string) => void
  onDelete: (task: Task) => void
}

function BoardView({ tasks, all, onMove, onOpen, onAssignToMe, onDelete }: BoardProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<TaskStatus | null>(null)

  // Without preventDefault on dragover the browser refuses the drop outright —
  // the default action of a drag is "no". dragenter is where the column lights
  // up; doing it on dragover would set state on every frame of the drag.
  const allowDrop = (event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  return (
    <div className="sb-board">
      {STATUSES.map(status => {
        const column = tasks.filter(task => task.status === status)
        return (
          <Panel
            key={status}
            variant="sunken"
            padding="sm"
            className="sb-board__column"
            data-over={over === status && dragId !== null ? 'true' : undefined}
            title={STATUS[status].label}
            actions={<span className="cds-numeric cds-body-sm">{column.length}</span>}
            onDragOver={allowDrop}
            onDragEnter={(event: DragEvent) => {
              allowDrop(event)
              setOver(status)
            }}
            onDragLeave={(event: DragEvent) => {
              // dragleave also fires when the pointer crosses into a child, so
              // only clear when it has genuinely left the column.
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(null)
            }}
            onDrop={(event: DragEvent) => {
              event.preventDefault()
              const id = event.dataTransfer.getData('text/plain')
              setOver(null)
              setDragId(null)
              if (id) onMove(id, status)
            }}
          >
            {column.length === 0 ? (
              <p className="sb-board__empty cds-body-sm">Nothing here</p>
            ) : (
              <ul className="sb-board__list">
                {column.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    all={all}
                    dragging={dragId === task.id}
                    onDragStart={id => setDragId(id)}
                    onDragEnd={() => {
                      setDragId(null)
                      setOver(null)
                    }}
                    onMove={onMove}
                    onOpen={onOpen}
                    onAssignToMe={onAssignToMe}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            )}
          </Panel>
        )
      })}
    </div>
  )
}

interface CardProps {
  task: Task
  all: Task[]
  dragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onMove: (id: string, status: TaskStatus) => void
  onOpen: (id: string) => void
  onAssignToMe: (id: string) => void
  onDelete: (task: Task) => void
}

function TaskCard({
  task,
  all,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onOpen,
  onAssignToMe,
  onDelete,
}: CardProps) {
  const blocked = blockers(task, all)
  const list = checklist(task)
  const overdue = task.due !== null && task.due < TODAY && task.status !== 'done'
  const priority = PRIORITY[task.priority]

  const items: MenuItem[] = [
    { id: 'open', label: 'Open', icon: <Icon name="external" size={14} />, onSelect: () => onOpen(task.id) },
    ...STATUSES.filter(status => status !== task.status).map(status => ({
      id: `move:${status}`,
      label: STATUS[status].label,
      group: 'Move to',
      onSelect: () => onMove(task.id, status),
    })),
    {
      id: 'assign',
      label: 'Assign to me',
      group: 'Actions',
      disabled: task.assignee === ME,
      onSelect: () => onAssignToMe(task.id),
    },
    { id: 'delete', label: 'Delete', tone: 'danger', group: 'Actions', onSelect: () => onDelete(task) },
  ]

  return (
    <li
      className="sb-task-card"
      data-task={task.id}
      data-dragging={dragging ? 'true' : undefined}
      draggable
      onDragStart={(event: DragEvent) => {
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
    >
      <div className="sb-task-card__top">
        {/* Decorative: the card is draggable as a whole, and the keyboard route
            is the menu. A handle that were the only affordance would be a trap. */}
        <Icon name="grip" size={13} className="sb-task-card__grip" />
        <span className="sb-task-card__ref cds-mono cds-body-sm">{task.id}</span>
        <Icon
          name={priority.icon}
          size={13}
          label={`${priority.label} priority`}
          className={`sb-task-card__priority is-${task.priority}`}
        />
        <Menu
          align="end"
          label={`Actions for ${task.id}`}
          items={items}
          trigger={props => (
            <IconButton
              {...props}
              icon={<Icon name="more" size={15} />}
              label={`Actions for ${task.id}`}
              size="sm"
              variant="ghost"
            />
          )}
        />
      </div>

      <button type="button" className="sb-task-card__title" onClick={() => onOpen(task.id)}>
        {task.title}
      </button>

      <div className="sb-task-card__meta">
        {blocked.length > 0 && (
          <Badge tone="warning" size="sm">
            <Icon name="link" size={11} /> Blocked by {blocked.map(item => item.id).join(', ')}
          </Badge>
        )}
        {task.labels.map(label => (
          <Tag key={label} size="sm">
            {label}
          </Tag>
        ))}
      </div>

      <div className="sb-task-card__foot">
        {task.assignee ? (
          <Avatar name={memberName(task.assignee)} size="xs" tinted decorative />
        ) : (
          <span className="sb-task-card__unassigned cds-body-sm">Unassigned</span>
        )}
        {list.total > 0 && (
          <span className="sb-task-card__count cds-numeric cds-body-sm">
            <Icon name="check" size={12} /> {list.done}/{list.total}
          </span>
        )}
        {task.due && (
          <span className={`sb-task-card__due cds-numeric cds-body-sm${overdue ? ' is-overdue' : ''}`}>
            <Icon name="calendar" size={12} />
            {dayFormat.format(new Date(`${task.due}T00:00:00Z`))}
            {overdue && <span className="cds-sr-only"> — overdue</span>}
          </span>
        )}
      </div>
    </li>
  )
}

/* --- List ----------------------------------------------------------------- */

interface ListProps {
  tasks: Task[]
  all: Task[]
  selected: string[]
  onSelectionChange: (keys: string[]) => void
  onOpen: (id: string) => void
  onMove: (id: string, status: TaskStatus) => void
  onAssignToMe: (ids: string[]) => void
}

function ListView({
  tasks,
  all,
  selected,
  onSelectionChange,
  onOpen,
  onMove,
  onAssignToMe,
}: ListProps) {
  const columns: TableColumn<Task>[] = [
    {
      key: 'id',
      header: 'Ref',
      width: '6rem',
      cell: row => <span className="cds-mono cds-body-sm">{row.id}</span>,
    },
    {
      key: 'title',
      header: 'Task',
      // A percentage rather than a rem: the table lays out automatically, so a
      // fixed width here is only a suggestion and the slack lands on whichever
      // column has the longest cell. This claims it.
      width: '38%',
      cell: row => (
        <button type="button" className="cds-link-quiet sb-task-row__title" onClick={() => onOpen(row.id)}>
          {row.title}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '7.5rem',
      cell: row => (
        <Badge tone={row.status === 'done' ? 'success' : 'neutral'} size="sm">
          {STATUS[row.status].label}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '6.5rem',
      hideBelow: 'md',
      cell: row => (
        <span className="sb-task-row__priority">
          <Icon name={PRIORITY[row.priority].icon} size={12} className={`is-${row.priority}`} />
          {PRIORITY[row.priority].label}
        </span>
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee',
      width: '10rem',
      hideBelow: 'sm',
      cell: row =>
        row.assignee ? (
          <span className="sb-task-row__person">
            <Avatar name={memberName(row.assignee)} size="xs" tinted decorative />
            {memberName(row.assignee)}
          </span>
        ) : (
          <span style={{ color: 'var(--cds-color-text-subtle)' }}>Unassigned</span>
        ),
    },
    {
      key: 'due',
      header: 'Due',
      width: '6rem',
      numeric: true,
      align: 'end',
      hideBelow: 'md',
      cell: row =>
        row.due ? (
          <span className={row.due < TODAY && row.status !== 'done' ? 'sb-task-row__overdue' : undefined}>
            {dayFormat.format(new Date(`${row.due}T00:00:00Z`))}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'blocked',
      header: <span className="cds-sr-only">Blocked</span>,
      width: '2.5rem',
      cell: row => {
        const blocked = blockers(row, all)
        if (blocked.length === 0) return null
        return (
          <Icon
            name="link"
            size={14}
            label={`Blocked by ${blocked.map(item => item.id).join(', ')}`}
            className="sb-task-row__blocked"
          />
        )
      },
    },
  ]

  const bulk: MenuItem[] = STATUSES.map(status => ({
    id: status,
    label: STATUS[status].label,
    onSelect: () => selected.forEach(id => onMove(id, status)),
  }))

  return (
    <Stack gap={4}>
      {selected.length > 0 && (
        <Toolbar
          border="both"
          end={
            <>
              <Button variant="ghost" size="sm" onClick={() => onSelectionChange([])}>
                Clear
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onAssignToMe(selected)}>
                Assign to me
              </Button>
              <Menu
                align="end"
                label="Move selected tasks"
                items={bulk}
                trigger={props => (
                  <Button {...props} variant="secondary" size="sm">
                    Move to <Icon name="chevron-down" size={12} />
                  </Button>
                )}
              />
            </>
          }
        >
          <span className="cds-body-sm">{selected.length} selected</span>
        </Toolbar>
      )}

      <DataTable
        columns={columns}
        rows={tasks}
        rowKey={row => row.id}
        label="Tasks"
        density="compact"
        selected={selected}
        onSelectionChange={onSelectionChange}
        empty={<span className="cds-body-sm">No task matches these filters.</span>}
      />
    </Stack>
  )
}

/* --- Schedule ------------------------------------------------------------- */

function ScheduleView({
  tasks,
  all,
  day,
  onDayChange,
  onOpen,
}: {
  tasks: Task[]
  all: Task[]
  day: IsoDate | null
  onDayChange: (day: IsoDate | null) => void
  onOpen: (id: string) => void
}) {
  const [month, setMonth] = useState<IsoDate>('2024-07-01')

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      if (!task.due) continue
      map.set(task.due, [...(map.get(task.due) ?? []), task])
    }
    return map
  }, [tasks])

  const dayTasks = day ? (byDay.get(day) ?? []) : []
  const overdue = tasks.filter(task => task.due && task.due < TODAY && task.status !== 'done')
  const undated = tasks.filter(task => !task.due)

  return (
    <div className="sb-tasks-split">
      <Calendar
        month={month}
        onMonthChange={setMonth}
        value={day}
        onChange={onDayChange}
        markedDates={[...byDay.keys()]}
        label="Task due dates"
        renderDay={iso => {
          const count = byDay.get(iso)?.length ?? 0
          return count > 1 ? count : null
        }}
      />

      <Stack gap={5}>
        <Panel
          variant="ruled"
          padding="md"
          title={day ? longDayFormat.format(new Date(`${day}T00:00:00Z`)) : 'No day selected'}
          description={day ? `${dayTasks.length} due` : undefined}
        >
          {dayTasks.length === 0 ? (
            <EmptyState size="sm" title="Nothing due" description="Pick another day in the calendar." />
          ) : (
            <Stack gap={3} dividers>
              {dayTasks.map(task => (
                <ScheduleRow key={task.id} task={task} all={all} onOpen={onOpen} />
              ))}
            </Stack>
          )}
        </Panel>

        {overdue.length > 0 && (
          <Panel
            variant="ruled"
            padding="md"
            title="Overdue"
            description={`${overdue.length} past their date and not done`}
          >
            <Stack gap={3} dividers>
              {overdue.map(task => (
                <ScheduleRow key={task.id} task={task} all={all} onOpen={onOpen} />
              ))}
            </Stack>
          </Panel>
        )}

        {undated.length > 0 && (
          <Panel variant="ruled" padding="md" title="No date" description={`${undated.length} unscheduled`}>
            <Stack gap={3} dividers>
              {undated.map(task => (
                <ScheduleRow key={task.id} task={task} all={all} onOpen={onOpen} />
              ))}
            </Stack>
          </Panel>
        )}
      </Stack>
    </div>
  )
}

function ScheduleRow({ task, all, onOpen }: { task: Task; all: Task[]; onOpen: (id: string) => void }) {
  const blocked = blockers(task, all)
  return (
    <div style={{ paddingTop: 'var(--cds-space-3)' }}>
      <Stack gap={2}>
        <Stack direction="row" gap={2} align="center" wrap>
          <span className="cds-mono cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
            {task.id}
          </span>
          <Badge tone={task.status === 'done' ? 'success' : 'neutral'} size="sm">
            {STATUS[task.status].label}
          </Badge>
          {blocked.length > 0 && (
            <Badge tone="warning" size="sm">
              Blocked
            </Badge>
          )}
        </Stack>
        <button type="button" className="cds-link-quiet sb-task-row__title" onClick={() => onOpen(task.id)}>
          {task.title}
        </button>
        <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
          {memberName(task.assignee)} · {task.epic}
        </span>
      </Stack>
    </div>
  )
}

/* --- Progress ------------------------------------------------------------- */

function ProgressView({ tasks }: { tasks: Task[] }) {
  const epics = useMemo(
    () =>
      TASK_EPICS.map(epic => {
        const inEpic = tasks.filter(task => task.epic === epic)
        const points = (subset: Task[]) => subset.reduce((sum, task) => sum + task.estimate, 0)
        return {
          epic,
          done: points(inEpic.filter(task => task.status === 'done')),
          remaining: points(inEpic.filter(task => task.status !== 'done')),
          count: inEpic.length,
        }
      }),
    [tasks]
  )

  /**
   * Points per person, split by how far along they are.
   *
   * Deliberately *not* a second cut of the epic numbers — the panel below
   * already says how each epic is doing, and a chart that restates the thing
   * underneath it is decoration. What nothing else on this screen answers is
   * who is carrying how much, and how much of it has not been started.
   */
  const people = useMemo(() => {
    const points = (subset: Task[]) => subset.reduce((sum, task) => sum + task.estimate, 0)
    return MEMBERS.slice(0, 6)
      .map(member => {
        const theirs = tasks.filter(task => task.assignee === member.id)
        return {
          name: member.name,
          done: points(theirs.filter(task => task.status === 'done')),
          active: points(theirs.filter(task => task.status === 'doing' || task.status === 'review')),
          queued: points(
            theirs.filter(task => task.status === 'backlog' || task.status === 'ready')
          ),
        }
      })
      .filter(row => row.done + row.active + row.queued > 0)
      .sort((a, b) => b.done + b.active + b.queued - (a.done + a.active + a.queued))
  }, [tasks])

  const BURNDOWN_SERIES = [
    { key: 'remaining', label: 'Remaining' },
    { key: 'ideal', label: 'Ideal', dashed: true },
  ]

  const PEOPLE_SERIES = [
    { key: 'done', label: 'Done' },
    { key: 'active', label: 'In flight' },
    { key: 'queued', label: 'Not started' },
  ]

  return (
    <Stack gap={5}>
      <div className="sb-tasks-charts">
        <ChartFrame
          variant="ruled"
          title="Sprint burndown"
          description="Points remaining against the straight line to zero"
          legend={
            <ChartLegend
              items={BURNDOWN_SERIES.map((item, index) => ({
                key: item.key,
                label: item.label,
                color: `var(--cds-color-series-${index + 1})`,
                dashed: item.dashed,
              }))}
            />
          }
          footnote="Actual stops at today"
        >
          <LineChart
            label="Points remaining against the ideal burndown"
            data={SPRINT_BURNDOWN}
            x={point => new Date(point.day)}
            datumKey={point => point.day}
            series={[
              { key: 'remaining', label: 'Remaining', value: point => point.remaining },
              { key: 'ideal', label: 'Ideal', value: point => point.ideal, dashed: true },
            ]}
            height={240}
            yDomain="zero"
          />
        </ChartFrame>

        <ChartFrame
          variant="ruled"
          title="Points by assignee"
          description="Done, in flight, and not started"
          legend={
            <ChartLegend
              items={PEOPLE_SERIES.map((item, index) => ({
                key: item.key,
                label: item.label,
                color: `var(--cds-color-series-${index + 1})`,
              }))}
              swatch="square"
            />
          }
        >
          <BarChart
            label="Points per assignee, split by how far along the work is"
            data={people}
            x={row => row.name}
            datumKey={row => row.name}
            series={PEOPLE_SERIES.map(item => ({
              key: item.key,
              label: item.label,
              value: (row: (typeof people)[number]) =>
                row[item.key as 'done' | 'active' | 'queued'],
            }))}
            layout="horizontal"
            stacked
            height={240}
            // Full names in the axis, not "Marta Brunn…".
            margin={{ left: 108 }}
          />
        </ChartFrame>
      </div>

      <Panel variant="ruled" padding="lg" title="Epics" description="Share of points completed">
        <Stack gap={5}>
          {epics.map(row => (
            <Progress
              key={row.epic}
              label={row.epic}
              value={row.done}
              max={row.done + row.remaining || 1}
              showLabel
              valueLabel={`${row.done} of ${row.done + row.remaining} points · ${row.count} tasks`}
            />
          ))}
        </Stack>
      </Panel>
    </Stack>
  )
}

/* --- Detail --------------------------------------------------------------- */

function TaskDrawer({
  task,
  all,
  onClose,
  onOpen,
  onPatch,
  onDelete,
}: {
  task: Task | null
  all: Task[]
  onClose: () => void
  onOpen: (id: string) => void
  onPatch: (id: string, change: Partial<Task>) => void
  onDelete: (task: Task) => void
}) {
  const blocked = task ? blockers(task, all) : []
  const blocking = task ? all.filter(candidate => candidate.blockedBy.includes(task.id)) : []
  const list = task ? checklist(task) : { done: 0, total: 0 }

  const toggleSubtask = (subtaskId: string) => {
    if (!task) return
    onPatch(task.id, {
      subtasks: task.subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
      ),
    })
  }

  return (
    <Drawer
      open={task !== null}
      onClose={onClose}
      title={task?.title ?? ''}
      description={task ? `${task.id} · ${task.epic}` : undefined}
      side="end"
      size="md"
      footer={
        task && (
          <>
            <Button variant="danger" onClick={() => onDelete(task)}>
              Delete
            </Button>
            <Button
              variant="primary"
              disabled={task.status === 'done'}
              onClick={() => onPatch(task.id, { status: 'done' })}
            >
              Mark done
            </Button>
          </>
        )
      }
    >
      {task && (
        <Stack gap={5}>
          {/* Editable where editing is the point. A detail panel that only
              displays is a second place to read the same row. */}
          <div className="sb-task-fields">
            <Field label="Status">
              <Select
                size="sm"
                value={task.status}
                onChange={event => onPatch(task.id, { status: event.target.value as TaskStatus })}
                options={STATUSES.map(status => ({ value: status, label: STATUS[status].label }))}
              />
            </Field>
            <Field label="Assignee">
              <Select
                size="sm"
                value={task.assignee ?? ''}
                onChange={event => onPatch(task.id, { assignee: event.target.value || null })}
                placeholder="Unassigned"
                options={MEMBERS.slice(0, 6).map(member => ({ value: member.id, label: member.name }))}
              />
            </Field>
            <Field label="Priority">
              <Select
                size="sm"
                value={task.priority}
                onChange={event => onPatch(task.id, { priority: event.target.value as TaskPriority })}
                options={PRIORITY_ORDER.map(value => ({ value, label: PRIORITY[value].label }))}
              />
            </Field>
            <Field label="Due">
              <Input
                size="sm"
                type="date"
                value={task.due ?? ''}
                onChange={event => onPatch(task.id, { due: event.target.value || null })}
              />
            </Field>
          </div>

          <p className="cds-body">{task.description}</p>

          {(blocked.length > 0 || blocking.length > 0) && (
            <div>
              <Divider label="Dependencies" />
              <Stack gap={3} style={{ paddingTop: 'var(--cds-space-3)' }}>
                {blocked.length > 0 && (
                  <DependencyRow label="Blocked by" tasks={blocked} onOpen={onOpen} />
                )}
                {blocking.length > 0 && (
                  <DependencyRow label="Blocks" tasks={blocking} onOpen={onOpen} />
                )}
              </Stack>
            </div>
          )}

          {task.subtasks.length > 0 && (
            <div>
              <Divider label="Checklist" />
              <Stack gap={3} style={{ paddingTop: 'var(--cds-space-3)' }}>
                <Progress
                  label="Subtasks"
                  value={list.done}
                  max={list.total}
                  size="sm"
                  showLabel
                  valueLabel={`${list.done} of ${list.total}`}
                />
                <Stack gap={2}>
                  {task.subtasks.map(subtask => (
                    <Checkbox
                      key={subtask.id}
                      size="sm"
                      label={subtask.label}
                      checked={subtask.done}
                      onChange={() => toggleSubtask(subtask.id)}
                    />
                  ))}
                </Stack>
              </Stack>
            </div>
          )}

          <div>
            <Divider label="Labels" />
            <div className="sb-task-labels">
              {TASK_LABELS.map(label => {
                const on = task.labels.includes(label)
                return (
                  <Checkbox
                    key={label}
                    size="sm"
                    label={label}
                    checked={on}
                    onChange={() =>
                      onPatch(task.id, {
                        labels: on
                          ? task.labels.filter(item => item !== label)
                          : [...task.labels, label],
                      })
                    }
                  />
                )
              })}
            </div>
          </div>

          <div>
            <Divider label="Activity" />
            <ol className="sb-task-activity">
              {activityFor(task).map((entry, index) => (
                <li key={index}>
                  <span className="sb-task-activity__when cds-numeric cds-body-sm">
                    {dayFormat.format(new Date(`${entry.at}T00:00:00Z`))}
                  </span>
                  <span className="cds-body-sm">
                    <strong>{entry.who}</strong> {entry.what}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Stack>
      )}
    </Drawer>
  )
}

function DependencyRow({
  label,
  tasks,
  onOpen,
}: {
  label: string
  tasks: Task[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="sb-task-deps">
      <span className="cds-kicker">{label}</span>
      <div className="sb-task-deps__items">
        {tasks.map(task => (
          <button
            key={task.id}
            type="button"
            className="sb-task-deps__link"
            onClick={() => onOpen(task.id)}
          >
            <Icon name="link" size={12} />
            <span className="cds-mono">{task.id}</span>
            <span className="sb-task-deps__title">{task.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The history a real tracker would store, derived here from the task itself.
 *
 * Storing three hand-written entries per task in the fixture would be forty
 * lines of prose nobody reads; what the story needs to show is the shape of an
 * activity feed, and the shape is honest either way.
 */
function activityFor(task: Task): { at: string; who: string; what: string }[] {
  const owner = memberName(task.assignee)
  const entries = [{ at: task.created, who: 'Marta Brunner', what: 'created this task' }]
  if (task.assignee) {
    entries.push({ at: task.created, who: 'Marta Brunner', what: `assigned it to ${owner}` })
  }
  if (task.blockedBy.length > 0) {
    entries.push({
      at: task.created,
      who: owner,
      what: `marked it blocked by ${task.blockedBy.join(', ')}`,
    })
  }
  entries.push({
    at: task.updated,
    who: task.assignee ? owner : 'Marta Brunner',
    what: `moved it to ${STATUS[task.status].label}`,
  })
  return entries
}

/* --- Create --------------------------------------------------------------- */

function NewTaskDialog({
  open,
  onClose,
  onCreate,
  nextId,
}: {
  open: boolean
  onClose: () => void
  onCreate: (task: Task) => void
  nextId: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [epic, setEpic] = useState<string>(TASK_EPICS[0])
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [assignee, setAssignee] = useState<string>(ME)
  const [due, setDue] = useState<IsoDate | null>(null)

  const reset = () => {
    setTitle('')
    setDescription('')
    setDue(null)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New task"
      description={`It will be filed as ${nextId} in the backlog.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={title.trim().length < 4}
            onClick={() => {
              onCreate({
                id: nextId,
                title: title.trim(),
                status: 'backlog',
                priority,
                assignee: assignee || null,
                epic,
                labels: [],
                due,
                estimate: 3,
                subtasks: [],
                blockedBy: [],
                description: description.trim() || 'No description yet.',
                created: TODAY,
                updated: TODAY,
              })
              reset()
            }}
          >
            Create task
          </Button>
        </>
      }
    >
      <div className="sb-task-new">
        <Stack gap={4}>
          <Field label="Title" hint="What has to be true when this is done.">
            <Input
              data-autofocus
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Resume the crawl after a 503"
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={4}
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="The context somebody picking this up in three weeks will need."
            />
          </Field>
          <div className="sb-task-fields">
            <Field label="Epic">
              <Select
                value={epic}
                onChange={event => setEpic(event.target.value)}
                options={TASK_EPICS.map(value => ({ value, label: value }))}
              />
            </Field>
            <Field label="Priority">
              <Select
                value={priority}
                onChange={event => setPriority(event.target.value as TaskPriority)}
                options={PRIORITY_ORDER.map(value => ({ value, label: PRIORITY[value].label }))}
              />
            </Field>
            <Field label="Assignee">
              <Select
                value={assignee}
                onChange={event => setAssignee(event.target.value)}
                placeholder="Unassigned"
                options={MEMBERS.slice(0, 6).map(member => ({ value: member.id, label: member.name }))}
              />
            </Field>
          </div>
        </Stack>

        <Field label="Due date" hint={due ? undefined : 'Optional.'}>
          <Calendar
            value={due}
            onChange={setDue}
            month="2024-07-01"
            label="Due date"
            className="sb-task-new__calendar"
          />
        </Field>
      </div>
    </Dialog>
  )
}

/* --- Mobile --------------------------------------------------------------- */

/**
 * The same screen at 390 × 844.
 *
 * The board keeps all five columns and scrolls sideways with scroll-snap
 * rather than collapsing into an accordion: a board's value is that you can see
 * what is in the next column, and a stack of five headings you have to open one
 * at a time is a list with extra steps. What does change is the move: dragging
 * a card is not possible here at all, which is why the menu carries the columns.
 */
export const Mobile: Story = {
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-task-tracker--tracker"
      theme={String(context.globals.theme ?? 'light')}
      caption="Task tracker at 390 × 844"
    />
  ),
}
