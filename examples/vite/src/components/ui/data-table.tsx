"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"

export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  /** Value used for sorting and filtering. Defaults to row[key]. */
  accessor?: (row: T) => string | number | Date | null | undefined
  /** Custom cell. Defaults to the accessor value. */
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  align?: "left" | "right"
  mono?: boolean
  /** Hide this column below the sm breakpoint. */
  hideOnMobile?: boolean
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  /** Stable id per row (needed for selection). */
  rowId?: (row: T, index: number) => string
  /** Show the search field and filter on these column keys (default: all). */
  searchable?: boolean | string[]
  searchPlaceholder?: string
  /** Rows per page; 0 shows everything. */
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (ids: string[]) => void
  onRowClick?: (row: T) => void
  /** Content above the table next to the search, e.g. filter chips or buttons. */
  toolbar?: React.ReactNode
  empty?: React.ReactNode
  initialSort?: { key: string; dir: "asc" | "desc" }
  className?: string
  "aria-label"?: string
}

type Sort = { key: string; dir: "asc" | "desc" } | null

/**
 * Table with sorting, search, row selection and pagination on top of the
 * Halcyon table style. Headless enough to keep: pass columns and data.
 */
export function DataTable<T>({
  data, columns, rowId = (_, i) => String(i), searchable = true, searchPlaceholder = "Search", pageSize = 10,
  selectable, onSelectionChange, onRowClick, toolbar, empty = "No results.", initialSort, className, ...aria
}: DataTableProps<T>) {
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<Sort>(initialSort ?? null)
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const get = React.useCallback((row: T, c: DataTableColumn<T>) => (c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key] as string | number | null | undefined), [])

  const rows = React.useMemo(() => {
    const keys = Array.isArray(searchable) ? searchable : columns.map((c) => c.key)
    const needle = q.trim().toLowerCase()
    let out = data.map((row, i) => ({ row, id: rowId(row, i) }))
    if (needle) out = out.filter(({ row }) => columns.some((c) => keys.includes(c.key) && String(get(row, c) ?? "").toLowerCase().includes(needle)))
    if (sort) {
      const c = columns.find((x) => x.key === sort.key)
      if (c) {
        const m = sort.dir === "asc" ? 1 : -1
        out = [...out].sort((a, b) => {
          const x = get(a.row, c), y = get(b.row, c)
          if (x == null) return 1
          if (y == null) return -1
          return (x instanceof Date && y instanceof Date ? x.getTime() - y.getTime() : typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * m
        })
      }
    }
    return out
  }, [data, columns, q, sort, searchable, rowId, get])

  const pages = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const p = Math.min(page, pages)
  const visible = pageSize ? rows.slice((p - 1) * pageSize, p * pageSize) : rows

  const update = (next: Set<string>) => { setSelected(next); onSelectionChange?.([...next]) }
  const allOnPage = visible.length > 0 && visible.every((r) => selected.has(r.id))
  const someOnPage = visible.some((r) => selected.has(r.id))

  const toggleSort = (key: string) => {
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2.5">
          {searchable && (
            <label className="flex h-10 min-w-0 flex-1 basis-56 items-center gap-2 rounded-xl bg-bg px-3 text-muted shadow-inset-sm transition-[box-shadow] focus-within:shadow-[inset_2px_2px_5px_var(--hc-sh-dark),inset_-2px_-2px_5px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1) }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted sm:text-[13.5px]"
              />
            </label>
          )}
          {toolbar}
          {selectable && selected.size > 0 && <span className="font-mono text-xs text-muted" aria-live="polite">{selected.size} selected</span>}
        </div>
      )}
      <div tabIndex={0} role="region" aria-label={aria["aria-label"] ?? "Data table"} className="-mx-1.5 overflow-x-auto rounded-xl outline-offset-2">
        <table className="w-full border-separate border-spacing-x-0 border-spacing-y-1.5 px-1.5 text-[13.5px]">
          <thead>
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-1">
                  <Checkbox aria-label="Select page" checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={() => { const n = new Set(selected); visible.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id))); update(n) }} />
                </th>
              )}
              {columns.map((c) => {
                const s = sort?.key === c.key ? sort.dir : null
                return (
                  <th
                    key={c.key}
                    aria-sort={s === "asc" ? "ascending" : s === "desc" ? "descending" : c.sortable ? "none" : undefined}
                    className={cn("px-3 py-1 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.12em] text-muted", c.align === "right" && "text-right", c.hideOnMobile && "max-sm:hidden", c.className)}
                  >
                    {c.sortable ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className={cn("inline-flex cursor-pointer items-center gap-1.5 uppercase tracking-[.12em] transition-colors hover:text-ink", s && "text-ink", c.align === "right" && "flex-row-reverse")}>
                        {c.header}
                        <span aria-hidden="true" className="flex flex-col gap-[2px]">
                          <span className={cn("size-1 rounded-full", s === "asc" ? "bg-glow shadow-[0_0_4px_var(--hc-glow)]" : "bg-dot-off")} />
                          <span className={cn("size-1 rounded-full", s === "desc" ? "bg-glow shadow-[0_0_4px_var(--hc-glow)]" : "bg-dot-off")} />
                        </span>
                      </button>
                    ) : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="rounded-xl bg-bg px-3 py-10 text-center text-muted">{empty}</td></tr>
            )}
            {visible.map(({ row, id }) => {
              const on = selected.has(id)
              return (
                <tr
                  key={id}
                  aria-selected={selectable ? on : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn("group transition-transform duration-300 ease-spring hover:translate-x-1", onRowClick && "cursor-pointer")}
                >
                  {selectable && (
                    <td className={cn("rounded-l-xl px-3 py-[11px] transition-colors duration-300", on ? "bg-raise" : "bg-bg group-hover:bg-raise")} onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label="Select row" checked={on} onCheckedChange={() => { const n = new Set(selected); if (on) n.delete(id); else n.add(id); update(n) }} />
                    </td>
                  )}
                  {columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-[11px] tabular-nums transition-colors duration-300",
                        on ? "bg-raise" : "bg-bg group-hover:bg-raise",
                        !selectable && ci === 0 && "rounded-l-xl",
                        ci === columns.length - 1 && "rounded-r-xl",
                        c.mono && "font-mono text-[12.5px]",
                        c.align === "right" && "text-right font-mono",
                        c.hideOnMobile && "max-sm:hidden",
                        c.className,
                      )}
                    >
                      {c.cell ? c.cell(row) : String(get(row, c) ?? "")}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pageSize > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted">
            {rows.length ? `${(p - 1) * pageSize + 1}–${Math.min(p * pageSize, rows.length)} of ${rows.length}` : "0 rows"}
          </span>
          {pages > 1 && <Pagination page={p} pageCount={pages} onPageChange={setPage} siblings={0} />}
        </div>
      )}
    </div>
  )
}
