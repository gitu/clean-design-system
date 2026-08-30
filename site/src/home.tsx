import { createRoot } from 'react-dom/client'
import { Icon, Stack, Tag } from '../../src/index'
import { Card, SiteBar, SiteFooter, type SiteLinks } from './Chrome'
import { LinkButton } from './LinkButton'
import { Shell } from './Shell'
import { EXAMPLES } from './catalog'
// Same imports, in the same order, as `.storybook/preview.tsx`.
import '../../fonts/fonts.css'
import '../../src/styles/index.css'
import '../../.storybook/preview.css'
import './site.css'

const LINKS: SiteLinks = {
  home: './',
  storybook: './storybook/',
  examples: './examples/',
  install: './storybook/?path=/docs/foundations-installation--docs',
}

/**
 * The install command, which is the one line on this site that needs a host.
 *
 * Everything else is deliberately relative, but a command someone pastes into a
 * terminal cannot be — so this asks the browser where it is rather than
 * hardcoding a guess, and a fork's copy prints the fork's URL. Read once, at
 * module scope: it cannot change without the page being reloaded.
 */
const INSTALL_URL = new URL('r/button.json', window.location.href).href

function Home() {
  return (
    <Shell layout="fullscreen">
      <div className="sb-landing">
        <SiteBar section="Design system" links={LINKS} />

        <main>
          <section className="sb-landing__hero">
            <Stack gap={5} style={{ maxWidth: '46rem' }}>
              <h1 className="cds-display" style={{ margin: 0 }}>
                A quiet design system for complex search applications.
              </h1>
              <p className="cds-lede" style={{ margin: 0 }}>
                Its manners come from Swiss and British newspaper design: a serif
                for editorial content, a grotesque for interface chrome, hairline
                rules instead of boxes and shadows, and exactly one loud colour.
                Its job is dense application work — faceted search, long result
                lists, sortable tables, saved queries.
              </p>
              <div className="sb-landing__cta">
                <LinkButton
                  variant="primary"
                  size="lg"
                  href={LINKS.storybook}
                  iconStart={<Icon name="document" size={15} />}
                >
                  Component documentation
                </LinkButton>
                <LinkButton variant="secondary" size="lg" href={LINKS.examples}>
                  Sample applications
                </LinkButton>
              </div>
            </Stack>

            <div className="sb-landing__demo">
              <span className="cds-label">Install one component</span>
              <code className="site-command">npx shadcn@latest add {INSTALL_URL}</code>
              <div className="sb-landing__demo-tags">
                {['React 18 & 19', 'TypeScript', 'Plain CSS', 'WCAG 2.2 AA', 'MIT'].map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
              <p className="cds-body-sm" style={{ margin: 0, color: 'var(--cds-color-text-muted)' }}>
                The registry is plain JSON over HTTPS and needs no account. The
                npm package is on GitHub Packages and needs a token — the
                installation page covers both.
              </p>
            </div>
          </section>

          <section className="sb-landing__section">
            <Stack gap={2} style={{ maxWidth: '46rem' }}>
              <h2 className="cds-headline" style={{ margin: 0 }}>
                Three ways in
              </h2>
              <p className="cds-body" style={{ margin: 0, color: 'var(--cds-color-text-muted)' }}>
                All three are built from the same commit, by the same run, and
                gated on the same checks.
              </p>
            </Stack>
            <div className="site-grid site-grid--fill">
              <Card href={LINKS.storybook} title="Component documentation" meta="/storybook/">
                Every component with its states, and a props table generated from
                the JSDoc in its source. The doc comments are load-bearing — if a
                prop’s behaviour is surprising, its comment is where the reasoning
                lives.
              </Card>
              <Card
                href={LINKS.examples}
                title="Sample applications"
                meta={`/examples/ · ${EXAMPLES.length} pages`}
              >
                Whole screens, each at its own address with no documentation
                chrome around it: faceted search, a task tracker, an analytics
                dashboard, a reader, a map. The honest test of whether the parts
                compose.
              </Card>
              <Card href={LINKS.install} title="Install it" meta="/r/*.json">
                A shadcn registry at the root of this site — plain JSON, no
                account — or the npm package from GitHub Packages if you would
                rather take an upgrade than own the source.
              </Card>
            </div>
          </section>
        </main>

        <SiteFooter links={LINKS} />
      </div>
    </Shell>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(<Home />)
