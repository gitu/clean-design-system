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
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Colour', 'Typography', 'Spacing'],
          'Primitives',
          'Forms',
          'Search',
          'Data',
          'Layout',
          'Patterns',
        ],
      },
    },
  },
}

export default preview
