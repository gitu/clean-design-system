import { createContext, useContext, type ReactNode } from 'react'

interface BrandLink {
  /** Where the wordmark goes, relative to the page rendering it. */
  href: string
  /** What is there. Used to give the link an accessible name that says so. */
  label: string
}

const BrandLinkContext = createContext<BrandLink | null>(null)

/**
 * Makes every wordmark inside it a link.
 *
 * Nothing in Storybook provides this, which is the point: a story is one screen
 * with nowhere above it, so its masthead wordmark is text and stays text. The
 * examples site renders the same stories as standalone pages that *do* sit
 * inside something, and there the top-left wordmark is the conventional way
 * back — so it supplies an href and the same markup becomes a link.
 */
export function BrandLinkProvider({ href, label, children }: BrandLink & { children: ReactNode }) {
  return <BrandLinkContext.Provider value={{ href, label }}>{children}</BrandLinkContext.Provider>
}

/**
 * The wordmark, as a link when there is somewhere to go and as text otherwise.
 *
 * Lowercase, monospace, trailing underscore — a terminal prompt rather than a
 * masthead. Static, not blinking: content that flashes for more than five
 * seconds needs a way to stop it (WCAG 2.2.2), and a logo is not the place to
 * owe the reader a control.
 *
 * When it is a link, its accessible name says where it goes rather than just
 * reading the wordmark out. "archiv_" tells a screen-reader user what the
 * product is called and nothing about the fact that following it leaves the
 * demo they are in.
 */
export function BrandMark({ brand }: { brand: string }) {
  const link = useContext(BrandLinkContext)
  if (!link) return <span className="sb-masthead__brand">{brand}</span>
  return (
    <a
      className="sb-masthead__brand sb-masthead__brand--link"
      href={link.href}
      aria-label={`${brand} — ${link.label}`}
    >
      {brand}
    </a>
  )
}
