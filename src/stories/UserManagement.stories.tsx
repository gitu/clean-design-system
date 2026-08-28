import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AppShell,
  Avatar,
  Badge,
  Button,
  DataTable,
  Dialog,
  Field,
  Icon,
  IconButton,
  Input,
  Menu,
  SearchInput,
  SegmentedControl,
  Select,
  Stack,
  ToastProvider,
  Toolbar,
  useToast,
  type MenuItem,
  type TableColumn,
} from '../index'
import { Masthead } from './Masthead'
import { PhoneFrame } from './PhoneFrame'
import { MEMBERS, type Member } from './fixtures'

const meta = {
  title: 'Patterns/User management',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const STATUS_TONE = { active: 'success', invited: 'info', suspended: 'danger' } as const
const ROLES = ['Owner', 'Editor', 'Analyst', 'Viewer'] as const

const seen = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * The screen that pushed `Dialog`, `Menu`, `Avatar` and `Toast` into the
 * system — every one of them is here because a member list needs it, not
 * because a design system is supposed to have them.
 *
 * The destructive action is the interesting part: it opens a `danger` dialog
 * that names what will happen, and the toast that follows carries an Undo.
 * Neither auto-dismisses.
 */
export const Members: Story = {
  name: 'Members',
  render: () => (
    // The provider has to sit above whatever calls useToast.
    <ToastProvider>
      <MembersScreen />
    </ToastProvider>
  ),
}

function MembersScreen() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [selected, setSelected] = useState<string[]>([])
  const [members, setMembers] = useState<Member[]>(MEMBERS)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<Member | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Viewer')

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    return members.filter(member => {
      if (scope !== 'all' && member.status !== scope) return false
      if (!term) return true
      return (
        member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term)
      )
    })
  }, [members, query, scope])

  const remove = (member: Member) => {
    const previous = members
    setMembers(current => current.filter(m => m.id !== member.id))
    setRemoving(null)
    setSelected(current => current.filter(id => id !== member.id))
    toast({
      title: `${member.name} removed`,
      description: 'They no longer have access to this workspace.',
      tone: 'danger',
      action: { label: 'Undo', onClick: () => setMembers(previous) },
    })
  }

  const rowMenu = (member: Member): MenuItem[] => [
    { id: 'edit', label: 'Edit role', icon: <Icon name="tag" size={14} />, onSelect: () => toast({ title: `Editing ${member.name}` }) },
    { id: 'resend', label: 'Resend invitation', disabled: member.status !== 'invited', onSelect: () => toast({ title: 'Invitation resent', tone: 'success' }) },
    {
      id: 'suspend',
      label: member.status === 'suspended' ? 'Restore access' : 'Suspend access',
      group: 'Danger zone',
      onSelect: () =>
        setMembers(current =>
          current.map(m =>
            m.id === member.id
              ? { ...m, status: m.status === 'suspended' ? 'active' : 'suspended' }
              : m
          )
        ),
    },
    {
      id: 'remove',
      label: 'Remove from workspace',
      tone: 'danger',
      disabled: member.role === 'Owner',
      onSelect: () => setRemoving(member),
    },
  ]

  const columns: Array<TableColumn<Member>> = [
    {
      key: 'name',
      header: 'Member',
      cell: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-space-3)' }}>
          <Avatar name={row.name} size="sm" tinted decorative />
          <div style={{ minWidth: 0 }}>
            <div>{row.name}</div>
            <div className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', width: '7rem', hideBelow: 'sm', cell: row => row.role },
    {
      key: 'status',
      header: 'Status',
      width: '7rem',
      cell: row => (
        <Badge tone={STATUS_TONE[row.status]} size="sm">
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Last seen',
      width: '8rem',
      numeric: true,
      align: 'end',
      hideBelow: 'md',
      cell: row => (row.lastSeen === '—' ? '—' : seen.format(new Date(row.lastSeen))),
    },
    {
      key: 'actions',
      // An empty <th> has no accessible name; the column still needs one.
      header: <span className="cds-sr-only">Actions</span>,
      width: '3rem',
      cell: row => (
        <Menu
          align="end"
          label={`Actions for ${row.name}`}
          items={rowMenu(row)}
          trigger={props => (
            <IconButton
              {...props}
              icon={<Icon name="more" size={15} />}
              label={`Actions for ${row.name}`}
              size="sm"
              variant="ghost"
            />
          )}
        />
      ),
    },
  ]

  return (
    <AppShell
      header={
        <Masthead
          section="Members"
          actions={
            <Button variant="primary" size="sm" onClick={() => setInviting(true)}>
              <Icon name="plus" size={13} /> Invite
            </Button>
          }
        >
          <SearchInput value={query} onValueChange={setQuery} placeholder="Search members" />
        </Masthead>
      }
      sidebarHidden
      maxWidth="1120px"
    >
      <Stack gap={5} className="sb-page">
        <Toolbar
          end={
            <SegmentedControl
              size="sm"
              value={scope}
              onChange={setScope}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Invited' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          }
        >
          <span className="cds-kicker">
            {rows.length} of {members.length} members
          </span>
        </Toolbar>

        {selected.length > 0 && (
          <Toolbar
            border="both"
            end={
              <>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
                <Button variant="secondary" size="sm">
                  Change role
                </Button>
              </>
            }
          >
            <span className="cds-body-sm">{selected.length} selected</span>
          </Toolbar>
        )}

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={row => row.id}
          label="Workspace members"
          selected={selected}
          onSelectionChange={setSelected}
          empty={<span className="cds-body-sm">Nobody matches that search.</span>}
        />
      </Stack>

      <Dialog
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite a member"
        description="They will get an email with a link that expires in seven days."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!inviteEmail.includes('@')}
              onClick={() => {
                setInviting(false)
                toast({
                  title: 'Invitation sent',
                  description: `${inviteEmail} was invited as ${inviteRole}.`,
                  tone: 'success',
                })
                setInviteEmail('')
              }}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          <Field label="Email address" hint="One address at a time.">
            <Input
              data-autofocus
              type="email"
              value={inviteEmail}
              onChange={event => setInviteEmail(event.target.value)}
              placeholder="name@archiv.ch"
            />
          </Field>
          <Field label="Role" hint="Analysts can read the dashboards but not edit the index.">
            <Select
              value={inviteRole}
              onChange={event => setInviteRole(event.target.value)}
              options={ROLES.map(role => ({ value: role, label: role }))}
            />
          </Field>
        </Stack>
      </Dialog>

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        tone="danger"
        title={removing ? `Remove ${removing.name}?` : ''}
        description="They lose access immediately. Saved searches they own stay in the workspace."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => removing && remove(removing)}>
              Remove member
            </Button>
          </>
        }
      />
    </AppShell>
  )
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-user-management--members"
      theme={String(context.globals.theme ?? 'light')}
      caption="Members at 390 x 844"
    />
  ),
}
