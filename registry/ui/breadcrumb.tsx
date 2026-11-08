import * as React from "react"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: React.ReactNode
  href?: string
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: Crumb[]
}

/** Monospace path with dot separators; the current page sits in a small raised chip. */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)} {...props}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 font-mono text-[12px] text-muted">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="inline-flex min-h-6 items-center rounded-md bg-surface px-1.5 text-ink shadow-raised-sm">{c.label}</span>
              ) : c.href ? (
                <a href={c.href} className="inline-flex min-h-6 items-center rounded-md px-1 transition-colors hover:text-ink">{c.label}</a>
              ) : (
                <span className="px-1">{c.label}</span>
              )}
              {!last && <span aria-hidden="true" className="size-1 rounded-full bg-dot-off" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
