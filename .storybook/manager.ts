import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

/**
 * Gives the Storybook a way back to the rest of the site.
 *
 * The component documentation is one of three things published from this repo,
 * and until it moved under `/storybook/` it was the whole site, so there was
 * nowhere to go back to. Now there is: the landing page at the root, and the
 * sample applications beside it.
 *
 * `brandUrl` is what Storybook puts on the wordmark at the top left of the
 * sidebar — the same gesture that gets you out of a sample application and off
 * the examples index, so it behaves the same in all three places. It is
 * relative, like every other link on this site, so it resolves wherever the
 * site happens to be served from.
 *
 * `create({ base: 'light' })` starts from Storybook's own default theme rather
 * than inventing one. The manager chrome is not this design system and should
 * not pretend to be — the system is what is inside the canvas.
 */
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'clean_ design system',
    brandUrl: '../',
    brandTarget: '_self',
  }),
})
