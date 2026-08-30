import { createRoot } from 'react-dom/client'
import { Badge, Icon, Stack, Tag } from '../../src/index'
import { Card, SiteBar, SiteFooter, type SiteLinks } from './Chrome'
import { LinkButton } from './LinkButton'
import { Shell } from './Shell'
import { EXAMPLES, GROUPS, type Group } from './catalog'
// Same imports, in the same order, as `.storybook/preview.tsx`.
import '../../fonts/fonts.css'
import '../../src/styles/index.css'
import '../../.storybook/preview.css'
import './site.css'

const LINKS: SiteLinks = {
  home: '../',
  storybook: '../storybook/',
  examples: './',
  install: '../storybook/?path=/docs/foundations-installation--docs',
}

/** A line under each section heading, saying what the section is about. */
const GROUP_NOTES: Record<Group, string> = {
  Search: 'Finding things, and the machinery around it — facets, relevance, and the console that keeps the index honest.',
  Operations: 'Screens for the work itself: what is in flight, who is doing it, and when it is due.',
  Documents: 'Reading and writing — the long text, the long form, and the assistant that has to show its sources.',
  'Front door': 'The two pages every product has, built from exactly the same parts as the ones behind them.',
}

/**
 * The index of sample applications.
 *
 * It reuses the Landing pattern's own layout classes rather than inventing a
 * second set — same bar, same hero measure, same section rhythm, same footer
 * rule. That is the point of putting it here: a directory of demos that did not
 * itself look like the system would be the one page on the site arguing against
 * it.
 */
function Examples() {
  return (
    <Shell layout="fullscreen">
      <div className="sb-landing">
        <SiteBar section="Examples" links={LINKS}>
          <LinkButton variant="ghost" size="sm" href={LINKS.storybook}>
            Storybook
          </LinkButton>
        </SiteBar>

        <main>
          <section className="sb-landing__hero">
            <Stack gap={5} style={{ maxWidth: '46rem' }}>
              <div>
                <Badge tone="info" size="sm">
                  {EXAMPLES.length} sample applications
                </Badge>
              </div>
              <h1 className="cds-display" style={{ margin: 0 }}>
                The pattern stories, running as real pages.
              </h1>
              <p className="cds-lede" style={{ margin: 0 }}>
                Each one is a whole screen built only from this system’s
                components — no wrapper chrome, no screenshots, nothing added to
                make the demo work. They are the same stories the Storybook
                documents, served from their own address so you can open one,
                resize it, tab through it and read its source.
              </p>
              <div className="sb-landing__cta">
                <LinkButton
                  variant="primary"
                  size="lg"
                  href={`./${EXAMPLES[0]?.slug ?? ''}/`}
                >
                  Open the search application
                </LinkButton>
                <LinkButton
                  variant="secondary"
                  size="lg"
                  href={LINKS.storybook}
                  iconStart={<Icon name="document" size={15} />}
                >
                  Component documentation
                </LinkButton>
              </div>
            </Stack>

            {/* The Landing pattern puts a live search box here. The honest
                equivalent for a directory of demos is the parts list. */}
            <div className="sb-landing__demo">
              <span className="cds-label">What they are made of</span>
              <div className="sb-landing__demo-tags">
                {[
                  'AppShell',
                  'FacetGroup',
                  'DataTable',
                  'CommandPalette',
                  'BarChart',
                  'Calendar',
                  'MarkdownEditor',
                  'Drawer',
                  'Toast',
                ].map(name => (
                  <Tag key={name}>{name}</Tag>
                ))}
              </div>
              <p className="cds-body-sm" style={{ margin: 0, color: 'var(--cds-color-text-muted)' }}>
                Every one of them is a component from the package, used the way
                a consumer would use it. Nothing was added to the system to make
                any of these pages possible.
              </p>
            </div>
          </section>

          {GROUPS.map(group => {
            const inGroup = EXAMPLES.filter(e => e.group === group)
            if (inGroup.length === 0) return null
            return (
              <section className="sb-landing__section" key={group}>
                <Stack gap={2} style={{ maxWidth: '46rem' }}>
                  <h2 className="cds-headline" style={{ margin: 0 }}>
                    {group}
                  </h2>
                  <p className="cds-body" style={{ margin: 0, color: 'var(--cds-color-text-muted)' }}>
                    {GROUP_NOTES[group]}
                  </p>
                </Stack>
                <div className="site-grid">
                  {inGroup.map(example => (
                    // The source file is on the card deliberately. Every one of
                    // these pages is a story that already exists in
                    // `src/stories`, and the fastest thing a reader can be
                    // given is the name of the file to open.
                    <Card
                      key={example.slug}
                      href={`./${example.slug}/`}
                      title={example.title}
                      meta={`${example.module}.stories.tsx`}
                    >
                      {example.summary}
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </main>

        <SiteFooter links={LINKS} />
      </div>
    </Shell>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(<Examples />)
