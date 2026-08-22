import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandPalette, type CommandItem } from './CommandPalette'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Kbd } from '../Kbd/Kbd'

const ITEMS: CommandItem[] = [
  { id: 'new', group: 'Actions', label: 'New search', icon: <Icon name="search" size={14} />, shortcut: 'Cmd+N' },
  { id: 'save', group: 'Actions', label: 'Save this search', icon: <Icon name="bookmark" size={14} />, shortcut: 'Cmd+S' },
  { id: 'export', group: 'Actions', label: 'Export results as CSV', icon: <Icon name="document" size={14} />, keywords: ['download', 'csv'] },
  { id: 'clear', group: 'Actions', label: 'Clear all filters', icon: <Icon name="refresh" size={14} /> },
  { id: 'q1', group: 'Saved searches', label: 'Banking consolidation', description: 'section:finance · 2020–2024 · 1,284 results' },
  { id: 'q2', group: 'Saved searches', label: 'Referendum coverage', description: 'section:politics · last 12 months · 312 results' },
  { id: 'q3', group: 'Saved searches', label: 'Rail freight', description: 'Shared by R. Keller · 88 results' },
  { id: 'settings', group: 'Navigate', label: 'Index settings', icon: <Icon name="filter" size={14} /> },
  { id: 'help', group: 'Navigate', label: 'Query syntax reference', icon: <Icon name="info" size={14} /> },
  { id: 'admin', group: 'Navigate', label: 'Administration', disabled: true },
]

const meta = {
  title: 'Search/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onOpenChange: () => {}, items: ITEMS },
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 480 }}>
        <Button variant="secondary" onClick={() => setOpen(true)} iconStart={<Icon name="search" />}>
          Open palette <Kbd keys="Cmd+K" size="sm" />
        </Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          items={ITEMS}
          hotkey="mod+k"
          placeholder="Search commands and saved searches…"
        />
      </div>
    )
  },
}

export const Filtered: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 480 }}>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          items={ITEMS}
          query="sea"
          onQueryChange={() => {}}
        />
      </div>
    )
  },
}

export const NoMatches: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div style={{ padding: 24, minHeight: 480 }}>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          items={ITEMS}
          query="zzzzz"
          onQueryChange={() => {}}
        />
      </div>
    )
  },
}
