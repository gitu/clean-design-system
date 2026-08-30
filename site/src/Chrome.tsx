import type { ReactNode } from 'react'
import { Icon, ThemeToggle } from '../../src/index'
import { LinkButton } from './LinkButton'

/**
 * Where each page on the site is, relative to the page doing the linking.
 *
 * Spelled out per page rather than derived from `location`, because these are
 * static files served from a path nobody controls — a project site's subpath, a
 * fork's, a local `file://` directory — and a link built from the current URL
 * would have to guess which of those it was in.
 */
export interface SiteLinks {
  home: string
  storybook: string
  examples: string
  /** The registry is a directory of JSON, so this points at its front door. */
  install: string
}

export const REPO = 'https://github.com/gitu/clean-design-system'

/**
 * The bar every page on the site carries.
 *
 * It is the Landing pattern's bar — `.sb-landing__bar`, the same wordmark class
 * the pattern stories use for theirs — because the one page that must not look
 * borrowed is the one introducing the system.
 */
export function SiteBar({
  section,
  links,
  children,
}: {
  /** The kicker beside the wordmark. */
  section: string
  links: SiteLinks
  /** Extra actions, placed before the theme toggle. */
  children?: ReactNode
}) {
  return (
    <header className="sb-landing__bar">
      <a className="sb-masthead__brand sb-masthead__brand--link" href={links.home}>
        clean_
      </a>
      <span className="sb-masthead__section cds-kicker">{section}</span>
      <div className="sb-landing__bar-actions">
        <ThemeToggle />
        {children}
        <LinkButton
          variant="secondary"
          size="sm"
          href={REPO}
          iconEnd={<Icon name="external" size={14} />}
        >
          GitHub
        </LinkButton>
      </div>
    </header>
  )
}

/** The rule and the small print under it. Also the same on every page. */
export function SiteFooter({ links }: { links: SiteLinks }) {
  return (
    <footer className="sb-landing__footer">
      <span className="cds-body-sm" style={{ color: 'var(--cds-color-text-subtle)' }}>
        <a className="cds-link" href={REPO}>
          @gitu/clean-design-system
        </a>{' '}
        — components in the{' '}
        <a className="cds-link" href={links.storybook}>
          Storybook
        </a>
        , screens in the{' '}
        <a className="cds-link" href={links.examples}>
          examples
        </a>
        , and a{' '}
        <a className="cds-link" href={links.install}>
          shadcn registry
        </a>{' '}
        at the root of this site.
      </span>
    </footer>
  )
}

/**
 * A link that is a whole card.
 *
 * Not `ResultCard`: that one is a search result, with a query to highlight
 * against and a metadata row, and bending it into a navigation tile would make
 * both jobs worse. This is four lines of CSS in `site.css`.
 */
export function Card({
  href,
  title,
  children,
  meta,
}: {
  href: string
  title: string
  /** The description. One or two sentences. */
  children: ReactNode
  /** A quiet monospace footnote — a source file, a count, a URL shape. */
  meta: string
}) {
  return (
    <a className="site-card" href={href}>
      <span className="cds-title site-card__title">
        {title}
        <Icon name="arrow-right" size={16} className="site-card__arrow" />
      </span>
      <p className="cds-body-sm site-card__summary">{children}</p>
      <span className="cds-mono site-card__meta">{meta}</span>
    </a>
  )
}
