"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeatmapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One number per cell, column by column (e.g. 7 per week). */
  values: number[]
  /** Cells per column. 7 gives a GitHub-style year grid. */
  rows?: number
  /** Number of intensity steps above zero. */
  levels?: number
  /** Tooltip / accessible label for a cell. */
  label?: (value: number, index: number) => string
  /** Row labels on the left, e.g. ["Mon", "", "Wed", "", "Fri", "", ""]. */
  rowLabels?: string[]
  cell?: number
  gap?: number
}

/**
 * Dot-matrix heatmap. Each value is a dot whose glow grows with its level.
 * Dots fade in column by column. Scrolls sideways on narrow screens.
 */
export function Heatmap({ values, rows = 7, levels = 4, label, rowLabels, cell = 12, gap = 4, className, ...props }: HeatmapProps) {
  const max = Math.max(1, ...values)
  const cols = Math.ceil(values.length / rows)
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t) }, [])

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-none", className)} {...props}>
      {rowLabels && (
        <div className="grid shrink-0" style={{ gridTemplateRows: `repeat(${rows}, ${cell}px)`, rowGap: gap }}>
          {rowLabels.map((l, i) => <span key={i} className="font-mono text-[10px] leading-none text-muted" style={{ lineHeight: `${cell}px` }}>{l}</span>)}
        </div>
      )}
      <div
        role="img"
        aria-label={`Heatmap of ${values.length} values, peak ${max}`}
        className="grid shrink-0 grid-flow-col"
        style={{ gridTemplateRows: `repeat(${rows}, ${cell}px)`, gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}
      >
        {values.map((v, i) => {
          const lvl = v <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * levels))
          const k = lvl / levels
          const col = Math.floor(i / rows)
          return (
            <span
              key={i}
              title={label?.(v, i) ?? String(v)}
              className="grid place-items-center"
            >
              <span
                className={cn("block rounded-full transition-[opacity,scale] duration-500 ease-spring", shown ? "scale-100 opacity-100" : "scale-0 opacity-0")}
                style={{
                  width: cell * (0.5 + k * 0.35),
                  height: cell * (0.5 + k * 0.35),
                  background: lvl ? `color-mix(in oklab, var(--hc-glow) ${30 + k * 70}%, var(--hc-dot-off))` : "var(--hc-dot-off)",
                  boxShadow: lvl === levels ? "0 0 6px var(--hc-glow)" : undefined,
                  transitionDelay: `${Math.min(col * 14, 700)}ms`,
                }}
              />
            </span>
          )
        })}
      </div>
    </div>
  )
}
