import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

export type Column<T> = {
  key: string
  header: ReactNode
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  hideBelow?: 'sm' | 'md' | 'lg'
}

export type SortState = { key: string; dir: 'asc' | 'desc' } | null

const hide = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSort,
  caption,
  empty,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  sort?: SortState
  onSort?: (s: SortState) => void
  caption?: string
  empty?: ReactNode
}) {
  function toggle(key: string) {
    if (!onSort) return
    if (!sort || sort.key !== key) onSort({ key, dir: 'asc' })
    else if (sort.dir === 'asc') onSort({ key, dir: 'desc' })
    else onSort(null)
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper">
      <table className="w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-concrete/70 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-3 py-2.5 font-semibold text-steel text-xs uppercase tracking-wide whitespace-nowrap ${c.hideBelow ? hide[c.hideBelow] : ''} ${c.className ?? ''}`}>
                {c.sortValue && onSort ? (
                  <button type="button" onClick={() => toggle(c.key)} className="inline-flex items-center gap-1 hover:text-ink min-h-[32px]">
                    {c.header}
                    {sort?.key === c.key ? sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6">
                {empty ?? <span className="text-steel">Nothing here yet.</span>}
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr
              key={rowKey(r)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(r) } } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`border-t border-line ${onRowClick ? 'cursor-pointer hover:bg-blueprint-50/50 focus-visible:bg-blueprint-50/50' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2.5 align-top break-words ${c.hideBelow ? hide[c.hideBelow] : ''} ${c.className ?? ''}`}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState): T[] {
  if (!sort) return rows
  const col = columns.find((c) => c.key === sort.key)
  if (!col?.sortValue) return rows
  const sv = col.sortValue
  return [...rows].sort((a, b) => {
    const av = sv(a)
    const bv = sv(b)
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return sort.dir === 'asc' ? cmp : -cmp
  })
}
