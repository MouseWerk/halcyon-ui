import * as React from "react"
import { cn } from "@/lib/utils"

export interface BarListItem {
  label: React.ReactNode
  value: number
  icon?: React.ReactNode
  href?: string
}

export interface BarListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: BarListItem[]
  format?: (v: number) => string
  /** Sort by value, largest first. */
  sort?: boolean
}

/**
 * Ranked list with horizontal dot bars, for top pages, referrers or regions.
 * Bars grow in with a stagger; the leader glows.
 */
export function BarList({ items, format = (v) => v.toLocaleString("en-US"), sort = true, className, ...props }: BarListProps) {
  const rows = sort ? [...items].sort((a, b) => b.value - a.value) : items
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className={cn("m-0 flex list-none flex-col gap-1.5 p-0", className)} {...props}>
      {rows.map((r, i) => {
        const pct = (r.value / max) * 100
        const Inner = r.href ? "a" : "div"
        return (
          <li key={i}>
            <Inner
              {...(r.href ? { href: r.href } : {})}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-xl bg-bg px-3 py-2.5 shadow-inset-sm",
                r.href && "transition-[translate] duration-300 ease-spring hover:translate-x-1",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-1 left-1 origin-left animate-[hc-grow_0.9s_var(--ease-out-soft)_both] rounded-[9px]"
                style={{
                  width: `calc(${pct}% - 8px)`,
                  animationDelay: `${i * 70}ms`,
                  backgroundImage: `radial-gradient(circle, ${i === 0 ? "var(--hc-glow)" : "var(--hc-glow-soft)"} 1.3px, transparent 1.7px)`,
                  backgroundSize: "6px 6px",
                  opacity: i === 0 ? 0.55 : 0.9,
                }}
              />
              {r.icon && <span className="relative shrink-0 text-muted [&_svg]:size-4">{r.icon}</span>}
              <span className="relative min-w-0 flex-1 truncate text-[13px]">{r.label}</span>
              <span className="relative font-mono text-[12px] tabular-nums text-muted">{format(r.value)}</span>
            </Inner>
          </li>
        )
      })}
    </ul>
  )
}
