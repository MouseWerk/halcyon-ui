import * as React from "react"
import { cn } from "@/lib/utils"

export interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[]
  /** Draw the line in on mount. */
  animate?: boolean
}

/** Glow-tinted sparkline with a soft area fill and an emphasised endpoint. */
export function Sparkline({ data, animate = true, className, ...props }: SparklineProps) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data.map((n, i) => [
    (i / Math.max(1, data.length - 1)) * 96 + 2,
    25 - ((n - min) / (max - min || 1)) * 21,
  ])
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")
  const last = pts[pts.length - 1]
  return (
    <div className={cn("relative h-7 w-full min-w-0", className)} {...props}>
      {/* the wipe runs on an HTML wrapper: clip-path animations on <svg> are unreliable in some engines */}
      <div className={cn("absolute inset-0", animate && "animate-hc-wipe")}>
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="size-full overflow-visible">
        <path d={`${d} L98 28 L2 28 Z`} className="fill-glow-soft opacity-45 transition-[fill] duration-500" />
        <path
          d={d}
          className="fill-none stroke-glow [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6] [vector-effect:non-scaling-stroke] transition-[stroke] duration-500"
        />
      </svg>
      </div>
      <span
        className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow shadow-[0_0_6px_var(--hc-glow)] transition-colors duration-500"
        style={{ left: `${last[0]}%`, top: `${(last[1] / 28) * 100}%` }}
      />
    </div>
  )
}
