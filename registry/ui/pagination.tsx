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
  // A gap only when it hides two or more pages; a single hidden page is shown instead
  if (start === 3) out.push(2)
  else if (start > 3) out.push("gap")
  for (let i = start; i <= end; i++) out.push(i)
  if (end === count - 2) out.push(count - 1)
  else if (end < count - 2) out.push("gap")
  if (count > 1) out.push(count)
  return out
}

const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia("(max-width: 479px)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
/** True on phone-width screens (SSR: false). */
function useNarrow() {
  return React.useSyncExternalStore(subscribeNarrow, () => window.matchMedia("(max-width: 479px)").matches, () => false)
}

/** Keys for each page in a recessed rail; the current page is a glowing raised key. */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, className, ...props }: PaginationProps) {
  // On phones show only first, current and last page so the rail always fits.
  const narrow = useNarrow()
  if (narrow) siblings = 0
  const key = "grid h-9 min-w-9 max-[479px]:h-8 max-[479px]:min-w-8 cursor-pointer place-items-center rounded-[10px] px-2 font-mono text-[12.5px] transition-[color,box-shadow,scale,background-color] duration-300 ease-spring active:scale-90 disabled:pointer-events-none disabled:opacity-35"
  const arrow = (d: -1 | 1) => (
    <button type="button" aria-label={d < 0 ? "Previous page" : "Next page"} disabled={d < 0 ? page <= 1 : page >= pageCount} onClick={() => onPageChange(page + d)} className={cn(key, "text-muted hover:text-ink")}>
      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d < 0 ? "M7.5 2.5 4 6l3.5 3.5" : "M4.5 2.5 8 6 4.5 9.5"} /></svg>
    </button>
  )
  return (
    <nav aria-label="Pagination" className={cn("inline-flex max-w-full items-center gap-1 rounded-[14px] bg-bg p-1 shadow-inset-sm", className)} {...props}>
      {arrow(-1)}
      {range(page, pageCount, siblings).map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className="grid h-9 w-5 place-items-center text-muted max-[479px]:h-8">&middot;&middot;</span>
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
