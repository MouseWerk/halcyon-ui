import * as React from "react"
import { cn } from "@/lib/utils"

export interface TimelineItem {
  title: React.ReactNode
  description?: React.ReactNode
  time?: React.ReactNode
  tone?: "glow" | "ok" | "warn" | "bad" | "off"
  icon?: React.ReactNode
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[]
  /** Stagger the entrance of each entry. */
  animate?: boolean
}

const lamp = {
  glow: "bg-glow text-glow",
  ok: "bg-ok text-ok",
  warn: "bg-warn text-warn",
  bad: "bg-bad text-bad",
  off: "bg-dot-off text-transparent",
} as const

/** Activity feed. Each entry hangs off a dotted rail with a status LED in a recessed socket. */
export function Timeline({ items, animate = true, className, ...props }: TimelineProps) {
  return (
    <ol className={cn("m-0 flex list-none flex-col p-0", className)} {...props}>
      {items.map((it, i) => (
        <li
          key={i}
          className={cn("relative flex gap-3.5 pb-5 last:pb-0", animate && "animate-hc-rise")}
          style={animate ? { animationDelay: `${i * 60}ms` } : undefined}
        >
          {i < items.length - 1 && (
            <span aria-hidden="true" className="absolute bottom-0 left-[13px] top-8 w-1 bg-[radial-gradient(circle,var(--hc-dot-off)_1.1px,transparent_1.4px)] bg-[length:4px_6px] bg-repeat-y" />
          )}
          <span className="relative mt-0.5 grid size-[30px] shrink-0 place-items-center rounded-full bg-bg shadow-inset-sm [&_svg]:size-3.5 [&_svg]:text-muted">
            {it.icon ?? <span className={cn("size-2 rounded-full shadow-[0_0_8px_currentColor]", lamp[it.tone ?? "glow"])} />}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <div className="text-[13.5px] font-medium">{it.title}</div>
              {it.time && <time className="font-mono text-[11px] text-muted">{it.time}</time>}
            </div>
            {it.description && <div className="mt-0.5 text-[13px] leading-relaxed text-muted">{it.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}
