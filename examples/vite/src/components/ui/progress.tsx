import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..max. Leave undefined for an indeterminate bar. */
  value?: number
  max?: number
  tone?: "glow" | "ok" | "warn" | "bad"
  size?: "sm" | "md"
}

const tones = { glow: "var(--hc-glow)", ok: "var(--hc-ok)", warn: "var(--hc-warn)", bad: "var(--hc-bad)" } as const

/**
 * Linear progress in a recessed track. The fill is a run of lit dots that
 * glides to its value. Without a value it becomes a comet sweeping across.
 */
export function Progress({ value, max = 100, tone = "glow", size = "md", className, ...props }: ProgressProps) {
  const indeterminate = value === undefined
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  const c = tones[tone]
  const dots = `radial-gradient(circle, ${c} 1.5px, transparent 1.9px)`
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      aria-label={props["aria-label"] ?? (indeterminate ? "Loading" : "Progress")}
      className={cn("relative w-full overflow-hidden rounded-full bg-bg shadow-inset-sm", size === "sm" ? "h-2" : "h-3", className)}
      {...props}
    >
      {indeterminate ? (
        <span
          className="absolute inset-y-0 left-0 w-2/5 animate-[hc-sweep_1.4s_var(--ease-out-soft)_infinite]"
          style={{ backgroundImage: dots, backgroundSize: "7px 100%", backgroundPosition: "3px center", filter: `drop-shadow(0 0 3px ${c})`, maskImage: "linear-gradient(to right, transparent, #000 40%, #000 60%, transparent)" }}
        />
      ) : (
        <span
          className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out-soft"
          style={{ width: `${pct}%`, backgroundImage: dots, backgroundSize: "7px 100%", backgroundPosition: "3px center", filter: `drop-shadow(0 0 3px ${c})` }}
        />
      )}
    </div>
  )
}
