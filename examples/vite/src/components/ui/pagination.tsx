"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Pages shown on each side of the current one. */
  siblings?: number
}

function range(page: number, count: number, sib: number): (number | "gap")[] {
  const out: (number | "gap")[] = []
  const start = Math.max(2, page - sib)
  const end = Math.min(count - 1, page + sib)
  out.push(1)
  if (start > 2) out.push("gap")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < count - 1) out.push("gap")
  if (count > 1) out.push(count)
  return out
}

/** Keys for each page in a recessed rail; the current page is a glowing raised key. */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, className, ...props }: PaginationProps) {
  const key = "grid h-9 min-w-9 cursor-pointer place-items-center rounded-[10px] px-2 font-mono text-[12.5px] transition-[color,box-shadow,scale,background-color] duration-300 ease-spring active:scale-90 disabled:pointer-events-none disabled:opacity-35"
  const arrow = (d: -1 | 1) => (
    <button type="button" aria-label={d < 0 ? "Previous page" : "Next page"} disabled={d < 0 ? page <= 1 : page >= pageCount} onClick={() => onPageChange(page + d)} className={cn(key, "text-muted hover:text-ink")}>
      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d < 0 ? "M7.5 2.5 4 6l3.5 3.5" : "M4.5 2.5 8 6 4.5 9.5"} /></svg>
    </button>
  )
  return (
    <nav aria-label="Pagination" className={cn("inline-flex items-center gap-1 rounded-[14px] bg-bg p-1 shadow-inset-sm", className)} {...props}>
      {arrow(-1)}
      {range(page, pageCount, siblings).map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className="grid h-9 w-6 place-items-center text-muted">&middot;&middot;</span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange(p)}
            className={cn(key, p === page ? "bg-surface text-ink shadow-glow" : "text-muted hover:text-ink")}
          >
            {p}
          </button>
        ),
      )}
      {arrow(1)}
    </nav>
  )
}
