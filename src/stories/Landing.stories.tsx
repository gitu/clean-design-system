import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Badge,
  Button,
  Divider,
  Icon,
  Kbd,
  NavList,
  ResultCard,
  ResultList,
  SearchInput,
  Sparkline,
  Stack,
  ThemeToggle,
  Tag,
} from '../index'
import { BrandMark } from './BrandMark'
import { PhoneFrame } from './PhoneFrame'
import { ARTICLES, formatDate } from './fixtures'

const meta = {
  title: 'Patterns/Landing page',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const FEATURES = [
  {
    title: 'Facets that survive a million documents',
    body: 'Counts stay live as filters narrow, and the applied set is always visible as a receipt you can take apart one chip at a time.',
  },
  {
    title: 'Relevance you can argue with',
    body: 'Every result carries its score breakdown. Compare two rankers side by side over a judged query set before you ship one.',
  },
  {
    title: 'An index you can watch',
    body: 'Crawl jobs, throughput, and the errors nobody notices until a search comes back empty — on one page, updated as they happen.',
  },
]

const NUMBERS = [
  { label: 'Documents', value: '359,065', trend: [180, 210, 198, 240, 268, 291, 344] },
  { label: 'Searches / week', value: '42,340', trend: [820, 906, 874, 1012, 1140, 1264, 1440] },
  { label: 'Zero-result rate', value: '2.8%', trend: [9.1, 8.4, 7.2, 6.1, 4.8, 3.9, 2.8] },
]

/**
 * A marketing page, built from the same parts as the application.
 *
 * The point of including one is the test it applies: a system tuned for dense
 * interface work usually has nothing to say at display sizes, and a hero is
 * where that shows. Everything here is `--cds-display`, `Divider`, `Tag` and
 * the real `SearchInput` — no component was added to make this page possible,
 * and the one flourish is that the demo search box is the component a customer
 * would actually get.
 */
export const Landing: Story = {
  render: () => (
    <div className="sb-landing">
      <header className="sb-landing__bar">
        <BrandMark brand="archiv_" />
        <NavList
          orientation="horizontal"
          size="sm"
          label="Sections"
          value="product"
          items={[
            { id: 'product', label: 'Product', href: '#' },
            { id: 'pricing', label: 'Pricing', href: '#' },
            { id: 'docs', label: 'Docs', href: '#' },
          ]}
        />
        <div className="sb-landing__bar-actions">
          <ThemeToggle />
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button variant="primary" size="sm">
            Request access
          </Button>
        </div>
      </header>

      <main>
        <section className="sb-landing__hero">
          <Stack gap={5} style={{ maxWidth: '46rem' }}>
            <div>
              <Badge tone="info" size="sm">
                Now indexing 359,065 documents
              </Badge>
            </div>
            <h1 className="cds-display" style={{ margin: 0 }}>
              Search that behaves like an archive, not a feed.
            </h1>
            <p className="cds-lede" style={{ margin: 0 }}>
              Facets, relevance tuning and an index you can watch — for the
              collections where the long tail is the point, and the answer is
              usually on page four.
            </p>
            <div className="sb-landing__cta">
              <Button variant="primary" size="lg">
                Request access
              </Button>
              <Button variant="secondary" size="lg">
                <Icon name="document" size={15} /> Read the docs
              </Button>
            </div>
            <p className="cds-body-sm" style={{ margin: 0, color: 'var(--cds-color-text-subtle)' }}>
              Press <Kbd keys="/" size="sm" /> anywhere to search.
            </p>
          </Stack>

          {/* The real component, not a picture of one. */}
          <div className="sb-landing__demo">
            <SearchInput
              size="xl"
              defaultValue="swiss banking"
              shortcut="/"
              placeholder="Search the archive"
            />
            <div className="sb-landing__demo-tags">
              {['section:finance', 'lang:de', 'after:2019', '"exact phrase"'].map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </section>

        <section className="sb-landing__numbers">
          {NUMBERS.map((item, index) => (
            <div key={item.label} className="sb-landing__number">
              <span className="cds-kicker" style={{ color: 'var(--cds-color-text-subtle)' }}>
                {item.label}
              </span>
              <span className="cds-display sb-landing__figure cds-numeric">{item.value}</span>
              <Sparkline
                data={item.trend}
                value={n => n}
                label={`${item.label} trend`}
                kind="area"
                color={`var(--cds-color-series-${index + 1})`}
                fluid
                height={44}
                endpoint
              />
            </div>
          ))}
        </section>

        <section className="sb-landing__section">
          <Divider label="What it does" tone="accent" />
          <div className="sb-landing__features">
            {FEATURES.map(feature => (
              <Stack key={feature.title} gap={2}>
                <h2 className="cds-title" style={{ margin: 0 }}>
                  {feature.title}
                </h2>
                <p className="cds-body" style={{ margin: 0 }}>
                  {feature.body}
                </p>
              </Stack>
            ))}
          </div>
        </section>

        <section className="sb-landing__section">
          <Divider label="What a result looks like" />
          <div style={{ marginTop: 'var(--cds-space-5)', maxWidth: 'var(--cds-measure)' }}>
            <ResultList dividers>
              {ARTICLES.slice(0, 3).map(article => (
                <ResultCard
                  key={article.id}
                  kicker={article.section}
                  title={article.title}
                  snippet={article.snippet}
                  query="swiss banking"
                  href="#"
                  meta={[formatDate(article.published), article.author]}
                />
              ))}
            </ResultList>
          </div>
        </section>

        <section className="sb-landing__closing">
          <Stack gap={4} align="center">
            <h2 className="cds-headline" style={{ margin: 0, textAlign: 'center' }}>
              Bring your collection.
            </h2>
            <p className="cds-lede" style={{ margin: 0, textAlign: 'center', maxWidth: '34rem' }}>
              Import is a directory of files and a mapping. Most archives are
              searchable the same afternoon.
            </p>
            <Button variant="primary" size="lg">
              Request access
            </Button>
          </Stack>
        </section>
      </main>

      <footer className="sb-landing__footer">
        <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
          archiv_ — a demonstration built entirely from this design system.
        </span>
      </footer>
    </div>
  ),
}

export const Mobile: Story = {
  parameters: { layout: 'padded', a11y: { disable: true } },
  render: (_args, context) => (
    <PhoneFrame
      storyId="patterns-landing-page--landing"
      theme={String(context.globals.theme ?? 'light')}
      caption="Landing at 390 x 844"
    />
  ),
}
