import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'
import { Stack } from '../Stack/Stack'
import { SearchInput } from '../SearchInput/SearchInput'
import { FacetGroup } from '../FacetGroup/FacetGroup'
import { FacetItem } from '../FacetItem/FacetItem'
import { ResultCard } from '../ResultCard/ResultCard'
import { ResultList } from '../ResultList/ResultList'
import { ResultMeta } from '../ResultMeta/ResultMeta'
import { Button } from '../Button/Button'
import { Kbd } from '../Kbd/Kbd'
import { ARTICLES, SECTION_FACETS, LANGUAGE_FACETS, formatDate } from '../../stories/fixtures'

const meta = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

function Masthead() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        height: 'var(--cds-header-height)',
        padding: '0 24px',
        maxWidth: 'var(--cds-content-max)',
        margin: '0 auto',
      }}
    >
      <span
        className="cds-display"
        style={{ fontSize: 20, color: 'var(--cds-color-brand-mark)', letterSpacing: '-0.02em' }}
      >
        Archiv
      </span>
      <div style={{ flex: 1, maxWidth: 520 }}>
        <SearchInput size="md" defaultValue="swiss banking" shortcut="/" />
      </div>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" variant="ghost">Saved</Button>
        <Button size="sm" variant="ghost">Help <Kbd keys="?" size="sm" /></Button>
      </Stack>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <AppShell
      header={<Masthead />}
      sidebar={
        <>
          <FacetGroup title="Section" selectedCount={1} onClear={() => {}} maxVisible={6}>
            {SECTION_FACETS.map(f => (
              <FacetItem key={f.value} label={f.label} count={f.count} onOnly={() => {}} />
            ))}
          </FacetGroup>
          <FacetGroup title="Language">
            {LANGUAGE_FACETS.map(f => (
              <FacetItem key={f.value} label={f.label} count={f.count} />
            ))}
          </FacetGroup>
        </>
      }
    >
      <ResultMeta total={4231} from={1} to={6} took={82} query="swiss banking" />
      <ResultList>
        {ARTICLES.map(a => (
          <ResultCard
            key={a.id}
            title={a.title}
            snippet={a.snippet}
            kicker={a.section}
            query="swiss banking"
            href="#"
            meta={[formatDate(a.published), a.author, a.id]}
          />
        ))}
      </ResultList>
    </AppShell>
  ),
}
