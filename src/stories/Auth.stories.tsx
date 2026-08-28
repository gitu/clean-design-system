import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  EmptyState,
  Field,
  Icon,
  Input,
  Kbd,
  Stack,
  ThemeToggle,
} from '../index'
import { PhoneFrame } from './PhoneFrame'

const meta = {
  title: 'Patterns/Sign in',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="sb-auth">
      <div className="sb-auth__bar">
        <span className="sb-masthead__brand">archiv_</span>
        <ThemeToggle />
      </div>
      <main className="sb-auth__main">
        <div className="sb-auth__card">{children}</div>
      </main>
      <footer className="sb-auth__footer">
        <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
          Trouble signing in? <a className="cds-link" href="#">Ask your workspace owner.</a>
        </span>
      </footer>
    </div>
  )
}

/**
 * Sign-in, which adds nothing to the system and is the point.
 *
 * `Field`, `Input`, `Checkbox` and `Button` already do this; the only work is
 * layout, and the only decision worth naming is that the error goes on the
 * `Field` rather than in a banner — an error about a password belongs next to
 * the password.
 */
export const SignIn: Story = {
  name: 'Sign in',
  render: () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [busy, setBusy] = useState(false)

    // Any password but the demo one fails, so the error state is reachable.
    const failed = submitted && password.length > 0 && password !== 'archiv'

    return (
      <AuthPage>
        <Stack gap={6}>
          <Stack gap={2}>
            <h1 className="cds-title" style={{ margin: 0 }}>
              Sign in
            </h1>
            <p className="cds-body-sm" style={{ margin: 0, color: 'var(--cds-color-text-muted)' }}>
              Use your workspace address. Try the password <Kbd keys="archiv" size="sm" />.
            </p>
          </Stack>

          <form
            onSubmit={event => {
              event.preventDefault()
              setSubmitted(true)
              if (password === 'archiv') {
                setBusy(true)
                setTimeout(() => setBusy(false), 900)
              }
            }}
          >
            <Stack gap={4}>
              <Field label="Email address">
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="name@archiv.ch"
                />
              </Field>

              <Field
                label="Password"
                error={failed ? 'That password does not match this address.' : undefined}
                action={
                  <a className="cds-link cds-body-sm" href="#">
                    Forgot?
                  </a>
                }
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
              </Field>

              <Checkbox defaultChecked label="Keep me signed in on this device" />

              <Button type="submit" variant="primary" size="lg" loading={busy} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider label="or" align="center" />

          <Stack gap={2}>
            <Button variant="secondary" fullWidth>
              <Icon name="external" size={14} /> Continue with SSO
            </Button>
            <p className="cds-body-sm" style={{ margin: 0, textAlign: 'center', color: 'var(--cds-color-text-subtle)' }}>
              No account? <a className="cds-link" href="#">Request access.</a>
            </p>
          </Stack>
        </Stack>
      </AuthPage>
    )
  },
}

/** The other half: what a session looks like when it ends. */
export const SignedOut: Story = {
  name: 'Signed out',
  render: () => (
    <AuthPage>
      <Stack gap={6} align="center">
        <Avatar name="Marta Brunner" size="lg" tinted />
        <EmptyState
          title="You are signed out"
          description="Your session on this device has ended. Anything you had saved is still in the workspace."
        />
        <Stack gap={2} style={{ width: '100%' }}>
          <Button variant="primary" fullWidth>
            Sign back in
          </Button>
          <Button variant="ghost" fullWidth>
            Use a different account
          </Button>
        </Stack>
      </Stack>
    </AuthPage>
  ),
}

export const Mobile: Story = {
  name: 'Mobile',
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-sign-in--sign-in"
      theme={String(context.globals.theme ?? 'light')}
      caption="Sign in at 390 x 844"
    />
  ),
}
