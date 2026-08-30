/**
 * The chart's data as a real table, visually hidden.
 *
 * Every chart renders one, always. The SVG is `aria-hidden`, so this is what a
 * screen reader actually reads — and unlike the live region, it survives being
 * navigated at the reader's own pace rather than the cursor's.
 *
 * Hand-rolled rather than reusing `DataTable` on purpose: `DataTable` pulls in
 * `Checkbox`, `Skeleton` and `Icon`, so importing it here would mean anyone
 * importing `LineChart` also ships a table component they never render. A
 * *visible* data table is a different feature — pass one into `ChartFrame`'s
 * `table` slot and pay for it only then.
 */
interface ChartSrTableProps {
  caption: string
  /** Column headers — the x labels. */
  columns: string[]
  rows: {
    key: string
    label: string
    /** Already formatted; the table does no arithmetic. */
    values: string[]
  }[]
}

export function ChartSrTable({ caption, columns, rows }: ChartSrTableProps) {
  return (
    // The wrapper carries `cds-sr-only`, not the table. That rule works by
    // clamping to 1px and hiding the overflow — but `width` on a table is only
    // a minimum, so a table of thirty date columns ignores it and drags the
    // page's scroll width out to two thousand pixels. A block element clips it
    // properly.
    <div className="cds-sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Series</th>
            {columns.map((column, index) => (
              <th key={`${column}-${index}`} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              {row.values.map((value, index) => (
                <td key={`${row.key}-${index}`}>{value}</td>
              ))}
            </tr>
          ))}
          </tbody>
      </table>
    </div>
  )
}
