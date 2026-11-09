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
  /** Custom cell. Defaults to the accessor value. `depth` is 1 for rows shown nested under a parent (tree mode). */
  cell?: (row: T, meta: { depth: number }) => React.ReactNode
  sortable?: boolean
  align?: "left" | "right"
  mono?: boolean
  /** Hide this column below the sm breakpoint. */
  hideOnMobile?: boolean
  /** Hide this column below a wider breakpoint, so narrow desktops need no sideways scroll. */
  hideBelow?: "md" | "lg" | "xl" | "2xl"
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  /** Stable id per row (needed for selection). */
  rowId?: (row: T, index: number) => string
  /** Show the search field and filter on these keys (default: all columns). Keys that are not columns read row[key]. */
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
  /** Phone layout: render each row as a card instead of a table row (below sm). */
  renderCard?: (row: T) => React.ReactNode
  /**
   * Tree mode (one level): returns the id of the row's parent, or null for a
   * top-level row. Children are listed under their parent, collapsed until the
   * parent's toggle is opened; sorting orders parents and keeps children with
   * them; pages count top-level rows. While searching, matching children show
   * opened. A child whose parent is filtered out is shown on its own.
   * The phone card layout (renderCard) has no toggle; use it without tree mode.
   */
  parentId?: (row: T) => string | null
  /** UI strings, for translation. */
  labels?: Partial<DataTableLabels>
  className?: string
  "aria-label"?: string
}

export interface DataTableLabels {
  of: string
  rows: string
  selectPage: string
  selectRow: string
  table: string
  selected: string
  /** Tree toggle; receives the number of child rows. */
  expand: (count: number) => string
  collapse: (count: number) => string
}
const DEFAULT_LABELS: DataTableLabels = {
  of: "of", rows: "rows", selectPage: "Select page", selectRow: "Select row", table: "Data table", selected: "selected",
  expand: (n) => `Expand ${n} ${n === 1 ? "child row" : "child rows"}`,
  collapse: (n) => `Collapse ${n} ${n === 1 ? "child row" : "child rows"}`,
}

type Sort = { key: string; dir: "asc" | "desc" } | null

// Literal classes so Tailwind generates them
const HIDE_BELOW = { md: "max-md:hidden", lg: "max-lg:hidden", xl: "max-xl:hidden", "2xl": "max-2xl:hidden" } as const

/**
 * Table with sorting, search, row selection and pagination on top of the
 * Halcyon table style. Headless enough to keep: pass columns and data.
 */
export function DataTable<T>({
  data, columns, rowId = (_, i) => String(i), searchable = true, searchPlaceholder = "Search", pageSize = 10,
  selectable, onSelectionChange, onRowClick, toolbar, empty = "No results.", initialSort, renderCard, parentId, labels: labelsProp, className, ...aria
}: DataTableProps<T>) {
  const L = { ...DEFAULT_LABELS, ...labelsProp }
  const [q, setQ] = React.useState("")
  const [sort, setSort] = React.useState<Sort>(initialSort ?? null)
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  /** Tree mode: parents whose children are shown (collapsed by default). */
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const get = React.useCallback((row: T, c: DataTableColumn<T>) => (c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key] as string | number | null | undefined), [])

  const rows = React.useMemo(() => {
    const keys = Array.isArray(searchable) ? searchable : columns.map((c) => c.key)
    const needle = q.trim().toLowerCase()
    let out = data.map((row, i) => ({ row, id: rowId(row, i) }))
    if (needle) {
      const byKey = new Map(columns.map((c) => [c.key, c]))
      const text = (row: T, key: string) => {
        const c = byKey.get(key)
        const v = c ? get(row, c) : (row as Record<string, unknown>)[key]
        return v == null ? "" : String(v).toLowerCase()
      }
      out = out.filter(({ row }) => keys.some((k) => text(row, k).includes(needle)))
    }
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

  // Tree mode: top-level rows (or children whose parent is filtered out) and children per parent, both in sort order
  const tree = React.useMemo(() => {
    if (!parentId) return null
    const ids = new Set(rows.map((r) => r.id))
    const roots: typeof rows = []
    const children = new Map<string, typeof rows>()
    for (const r of rows) {
      const pid = parentId(r.row)
      if (pid && ids.has(pid)) children.set(pid, [...(children.get(pid) ?? []), r])
      else roots.push(r)
    }
    return { roots, children }
  }, [rows, parentId])
  const searching = q.trim() !== ""
  const isOpen = (id: string) => searching || expanded.has(id)
  const toggleOpen = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const top = tree ? tree.roots : rows
  const pages = pageSize ? Math.max(1, Math.ceil(top.length / pageSize)) : 1
  const p = Math.min(page, pages)
  const pageTop = pageSize ? top.slice((p - 1) * pageSize, p * pageSize) : top
  type Shown = (typeof rows)[number] & { depth: number; kids: number }
  const visible: Shown[] = tree
    ? pageTop.flatMap((r) => {
        const kids = tree.children.get(r.id) ?? []
        return [{ ...r, depth: 0, kids: kids.length }, ...(kids.length && isOpen(r.id) ? kids.map((k) => ({ ...k, depth: 1, kids: 0 })) : [])]
      })
    : pageTop.map((r) => ({ ...r, depth: 0, kids: 0 }))

  // Selection only ever covers rows that are still in the (filtered) result,
  // so bulk actions never touch rows the user can no longer see.
  const visibleIds = React.useMemo(() => new Set(rows.map((r) => r.id)), [rows])
  const effective = React.useMemo(() => [...selected].filter((id) => visibleIds.has(id)), [selected, visibleIds])
  const effectiveKey = effective.join("\u0000")
  const notify = React.useRef(onSelectionChange)
  React.useEffect(() => { notify.current = onSelectionChange })
  React.useEffect(() => { notify.current?.(effectiveKey ? effectiveKey.split("\u0000") : []) }, [effectiveKey])

  const isOn = (id: string) => selected.has(id) && visibleIds.has(id)
  const update = (next: Set<string>) => setSelected(new Set([...next].filter((id) => visibleIds.has(id))))
  const toggle = (id: string) => { const n = new Set(selected); if (isOn(id)) n.delete(id); else n.add(id); update(n) }
  const allOnPage = visible.length > 0 && visible.every((r) => isOn(r.id))
  const someOnPage = visible.some((r) => isOn(r.id))

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
          {selectable && effective.length > 0 && <span className="font-mono text-xs text-muted" aria-live="polite">{effective.length} {L.selected}</span>}
        </div>
      )}
      {renderCard && (
        <ul aria-label={aria["aria-label"] ?? L.table} className="flex flex-col gap-2 sm:hidden">
          {visible.length === 0 && <li className="rounded-xl bg-bg px-3 py-10 text-center text-muted">{empty}</li>}
          {visible.map(({ row, id, depth }) => {
            const on = isOn(id)
            return (
              <li
                data-depth={tree ? depth : undefined}
                key={id}
                data-selected={on || undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("flex items-start gap-3 rounded-xl p-3 transition-colors duration-300", on ? "bg-raise" : "bg-bg", onRowClick && "cursor-pointer active:bg-raise", depth > 0 && "ml-6")}
              >
                {selectable && (
                  <span className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label={L.selectRow} checked={on} onCheckedChange={() => toggle(id)} />
                  </span>
                )}
                <div className="min-w-0 flex-1">{renderCard(row)}</div>
              </li>
            )
          })}
        </ul>
      )}
      <div tabIndex={0} role="region" aria-label={aria["aria-label"] ?? L.table} className={cn("-mx-1.5 overflow-x-auto rounded-xl outline-offset-2", renderCard && "max-sm:hidden")}>
        <table className="w-full border-separate border-spacing-x-0 border-spacing-y-1.5 px-1.5 text-[13.5px]">
          <thead>
            <tr>
              {selectable && (
                <th className="w-10 px-3 py-1">
                  <Checkbox aria-label={L.selectPage} checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                    onCheckedChange={() => { const n = new Set(selected); visible.forEach((r) => (allOnPage ? n.delete(r.id) : n.add(r.id))); update(n) }} />
                </th>
              )}
              {columns.map((c) => {
                const s = sort?.key === c.key ? sort.dir : null
                return (
                  <th
                    key={c.key}
                    aria-sort={s === "asc" ? "ascending" : s === "desc" ? "descending" : c.sortable ? "none" : undefined}
                    className={cn("px-3 py-1 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.12em] text-muted", c.align === "right" && "text-right", c.hideOnMobile && "max-sm:hidden", c.hideBelow && HIDE_BELOW[c.hideBelow], c.className)}
                  >
                    {c.sortable ? (
                      <button type="button" onClick={() => toggleSort(c.key)} className={cn("inline-flex min-h-6 cursor-pointer items-center gap-1.5 uppercase tracking-[.12em] transition-colors hover:text-ink", s && "text-ink", c.align === "right" && "flex-row-reverse")}>
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
            {visible.map(({ row, id, depth, kids }) => {
              const on = isOn(id)
              return (
                <tr
                  key={id}
                  data-depth={tree ? depth : undefined}
                  aria-selected={selectable ? on : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn("group", onRowClick && "cursor-pointer")}
                >
                  {selectable && (
                    <td className={cn("rounded-l-xl px-3 py-[11px] transition-colors duration-300", on ? "bg-raise" : "bg-bg group-hover:bg-raise")} onClick={(e) => e.stopPropagation()}>
                      <Checkbox aria-label={L.selectRow} checked={on} onCheckedChange={() => toggle(id)} />
                    </td>
                  )}
                  {columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        // Long words (names, places) wrap instead of pushing the table sideways
                        "px-3 py-[11px] tabular-nums transition-colors duration-300 [overflow-wrap:anywhere]",
                        on ? "bg-raise" : "bg-bg group-hover:bg-raise",
                        !selectable && ci === 0 && "rounded-l-xl",
                        ci === columns.length - 1 && "rounded-r-xl",
                        c.mono && "whitespace-nowrap font-mono text-[12.5px]",
                        c.align === "right" && "text-right font-mono",
                        c.hideOnMobile && "max-sm:hidden",
                        c.hideBelow && HIDE_BELOW[c.hideBelow],
                        c.className,
                      )}
                    >
                      {tree && ci === 0 ? (
                        <div className={cn("flex min-w-0 items-start gap-2", depth > 0 && "pl-3 sm:pl-7")}>
                          {depth > 0 ? (
                            <span aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 rounded-bl-[5px] border-b-2 border-l-2 border-dot-off" />
                          ) : kids > 0 ? (
                            <button
                              type="button"
                              aria-expanded={isOpen(id)}
                              aria-label={isOpen(id) ? L.collapse(kids) : L.expand(kids)}
                              disabled={searching}
                              onClick={(e) => { e.stopPropagation(); toggleOpen(id) }}
                              className={cn(
                                "-my-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-lg transition-[box-shadow,background-color,color] duration-200 disabled:cursor-default",
                                isOpen(id) ? "bg-surface text-glow-ink shadow-raised-sm" : "bg-bg text-muted shadow-inset-sm hover:text-ink",
                              )}
                            >
                              <svg viewBox="0 0 12 12" className={cn("size-3 transition-transform duration-300 ease-spring", isOpen(id) ? "rotate-90" : "rotate-0")} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5 8 6 4.5 9.5" /></svg>
                            </button>
                          ) : (
                            // keeps names aligned with their siblings' toggles; dropped on phones to save width
                            <span aria-hidden="true" className="size-6 shrink-0 max-sm:hidden" />
                          )}
                          <div className="min-w-0 flex-1">{c.cell ? c.cell(row, { depth }) : String(get(row, c) ?? "")}</div>
                        </div>
                      ) : c.cell ? c.cell(row, { depth }) : String(get(row, c) ?? "")}
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
            {top.length ? `${(p - 1) * pageSize + 1}–${Math.min(p * pageSize, top.length)} ${L.of} ${top.length}` : `0 ${L.rows}`}
          </span>
          {pages > 1 && <Pagination page={p} pageCount={pages} onPageChange={setPage} siblings={0} />}
        </div>
      )}
    </div>
  )
}
