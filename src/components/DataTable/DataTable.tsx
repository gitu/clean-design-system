import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils/cx'
import { Icon } from '../Icon/Icon'
import { Checkbox } from '../Checkbox/Checkbox'
import { Skeleton } from '../Skeleton/Skeleton'
import './DataTable.css'

export type SortDir = 'asc' | 'desc'

export interface Column<Row> {
  /** Stable key. Also the sort key reported by `onSortChange`. */
  key: string
  /** Header text. */
  header: ReactNode
  /** Cell renderer. Return a string for the default typography. */
  cell: (row: Row, index: number) => ReactNode
  /** Fixed width, e.g. `"12rem"` or `"90px"`. Omit to size by content. */
  width?: string
  /** Right-align for money and counts; the numeric class handles the figures. */
  align?: 'start' | 'center' | 'end'
  /** Marks the column sortable and enables its header button. */
  sortable?: boolean
  /** Tabular figures and the mono face — for ids, sizes, timestamps. */
  numeric?: boolean
  /** Keep this column visible when the table scrolls sideways. */
  sticky?: boolean
  /** Drop this column below a named breakpoint: sm 640px, md 900px, lg 1200px. */
  hideBelow?: 'sm' | 'md' | 'lg'
}

export interface DataTableProps<Row> {
  columns: Array<Column<Row>>
  rows: Row[]
  /** Stable identity per row — required for selection and React keys. */
  rowKey: (row: Row, index: number) => string
  /** Current sort. Sorting itself is the caller's job. */
  sort?: { key: string; direction: SortDir }
  onSortChange?: (key: string, direction: SortDir) => void
  /** Selected row keys. Passing this turns on the selection column. */
  selected?: string[]
  onSelectionChange?: (keys: string[]) => void
  onRowClick?: (row: Row, index: number) => void
  /** Row keys to draw as active — usually the row open in a detail pane. */
  activeKey?: string
  /** `compact` fits roughly a third more rows on screen. */
  density?: 'comfortable' | 'compact'
  /** Header stays put while the body scrolls. */
  stickyHeader?: boolean
  loading?: boolean
  loadingRows?: number
  /** Shown in place of the body when there are no rows. */
  empty?: ReactNode
  /** Accessible name for the table. */
  label?: string
  className?: string
}

/**
 * A dense, ruled table. Sorting, filtering and paging stay outside — this
 * renders what it is given, which keeps it usable against a server that does
 * the work.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  sort,
  onSortChange,
  selected,
  onSelectionChange,
  onRowClick,
  activeKey,
  density = 'comfortable',
  stickyHeader = false,
  loading = false,
  loadingRows = 8,
  empty,
  label,
  className,
}: DataTableProps<Row>) {
  const selectable = selected !== undefined && onSelectionChange !== undefined
  const selectedSet = new Set(selected ?? [])
  const allKeys = rows.map((row, i) => rowKey(row, i))
  const allSelected = allKeys.length > 0 && allKeys.every(key => selectedSet.has(key))
  const someSelected = allKeys.some(key => selectedSet.has(key)) && !allSelected

  function toggleAll() {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : allKeys)
  }

  function toggleRow(key: string) {
    if (!onSelectionChange) return
    const next = new Set(selectedSet)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectionChange([...next])
  }

  function headerClick(column: Column<Row>) {
    if (!column.sortable || !onSortChange) return
    const isCurrent = sort?.key === column.key
    onSortChange(column.key, isCurrent && sort?.direction === 'asc' ? 'desc' : 'asc')
  }

  const colCount = columns.length + (selectable ? 1 : 0)

  return (
    <div className={cx('cds-table-wrap', stickyHeader && 'cds-table-wrap--sticky', className)}>
      <table
        className={cx('cds-table', `cds-table--${density}`)}
        aria-label={label}
        aria-busy={loading || undefined}
      >
        <thead className="cds-table__head">
          <tr>
            {selectable && (
              <th className="cds-table__th cds-table__th--select" scope="col">
                <Checkbox
                  size="sm"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                />
              </th>
            )}
            {columns.map(column => {
              const isSorted = sort?.key === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  style={{ width: column.width } as CSSProperties}
                  className={cx(
                    'cds-table__th',
                    `cds-table__cell--${column.align ?? (column.numeric ? 'end' : 'start')}`,
                    column.sticky && 'cds-table__cell--sticky',
                    column.hideBelow && `cds-table__cell--hide-${column.hideBelow}`
                  )}
                  aria-sort={
                    isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      className={cx('cds-table__sort', isSorted && 'is-sorted')}
                      onClick={() => headerClick(column)}
                    >
                      <span className="cds-kicker">{column.header}</span>
                      <Icon
                        name={isSorted ? (sort.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'sort'}
                        size={12}
                        className="cds-table__sort-icon"
                      />
                    </button>
                  ) : (
                    <span className="cds-kicker">{column.header}</span>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="cds-table__body">
          {loading &&
            Array.from({ length: loadingRows }, (_, i) => (
              <tr key={`skeleton-${i}`} className="cds-table__row">
                {selectable && (
                  <td className="cds-table__td">
                    <Skeleton variant="block" width={14} height={14} />
                  </td>
                )}
                {columns.map(column => (
                  <td key={column.key} className="cds-table__td">
                    <Skeleton variant="block" height={11} width={`${45 + ((i * 13) % 45)}%`} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && empty && (
            <tr>
              <td className="cds-table__empty" colSpan={colCount}>
                {empty}
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row, index) => {
              const key = rowKey(row, index)
              const isSelected = selectedSet.has(key)
              return (
                <tr
                  key={key}
                  className={cx(
                    'cds-table__row',
                    isSelected && 'is-selected',
                    activeKey === key && 'is-active',
                    onRowClick && 'is-clickable'
                  )}
                  aria-selected={selectable ? isSelected : undefined}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {selectable && (
                    <td
                      className="cds-table__td cds-table__td--select"
                      onClick={event => event.stopPropagation()}
                    >
                      <Checkbox
                        size="sm"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={cx(
                        'cds-table__td',
                        `cds-table__cell--${column.align ?? (column.numeric ? 'end' : 'start')}`,
                        column.numeric && 'cds-table__cell--numeric',
                        column.sticky && 'cds-table__cell--sticky',
                        column.hideBelow && `cds-table__cell--hide-${column.hideBelow}`
                      )}
                    >
                      {column.cell(row, index)}
                    </td>
                  ))}
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
