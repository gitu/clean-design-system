import type { Decorator, Preview } from '@storybook/react-vite'
import { ThemeProvider, type ThemeSetting } from '../src/components/ThemeProvider/ThemeProvider'
import '../fonts/fonts.css'
import '../src/styles/index.css'
import './preview.css'

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme ?? 'light') as ThemeSetting
  return (
    <ThemeProvider theme={theme} applyTo="document">
      <div className="sb-canvas" data-layout={context.parameters.layout ?? 'padded'}>
        <Story />
      </div>
    </ThemeProvider>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  // addon-docs gives every story a Docs tab; this turns on the generated
  // component page as well, which is where the JSDoc on each prop surfaces.
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    // Run the axe rules as part of `pnpm test`, not just as a panel someone
    // might open. A violation fails the run.
    a11y: { test: 'error' },
    docs: {
      // The page is a reference, not a gallery — a story per section reads
      // better than every story stacked into one scroll.
      toc: true,
    },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Colour', 'Typography', 'Spacing', 'Elevation'],
          'Primitives',
          'Forms',
          'Search',
          'Data',
          'Charts',
          ['Overview'],
          'Prose',
          'Assistant',
          'Layout',
          'Patterns',
        ],
      },
    },
  },
}

export default preview
