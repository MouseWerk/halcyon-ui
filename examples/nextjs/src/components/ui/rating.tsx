"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RatingProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  /** Read-only display (no hover, no keyboard). */
  readOnly?: boolean
  size?: number
  className?: string
  "aria-label"?: string
}

/** Dot-matrix star. 5x5 dots look like a star at icon sizes and stay on-brand. */
const STAR = ["..#..", ".###.", "#####", ".###.", "#...#"]

function Star({ lit, size }: { lit: boolean; size: number }) {
  return (
    <svg viewBox="0 0 5 5" width={size} height={size} aria-hidden="true" className={cn("overflow-visible transition-[filter] duration-300", lit && "drop-shadow-[0_0_3px_var(--hc-glow-soft)]")}>
      {STAR.flatMap((row, y) => [...row].map((c, x) => c === "#" && (
        <circle
          key={`${x}-${y}`}
          cx={x + 0.5}
          cy={y + 0.5}
          r={0.36}
          className={cn("transition-[fill] duration-200", lit ? "fill-glow" : "fill-dot-off")}
          style={{ transitionDelay: lit ? `${(x + y) * 12}ms` : "0ms" }}
        />
      )))}
    </svg>
  )
}

/**
 * Rating built from dot-matrix stars. Hover previews, click sets (click the
 * current value again to clear). Arrow keys work; it is a slider for assistive tech.
 */
export function Rating({ value, defaultValue = 0, onValueChange, max = 5, readOnly, size = 22, className, ...aria }: RatingProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const [hover, setHover] = React.useState<number | null>(null)
  const shown = hover ?? v
  const set = (n: number) => { if (readOnly) return; const next = Math.max(0, Math.min(max, n)); setInner(next); onValueChange?.(next) }

  return (
    <div
      role={readOnly ? "img" : "slider"}
      tabIndex={readOnly ? undefined : 0}
      aria-label={readOnly ? `${aria["aria-label"] ?? "Rating"}: ${v} of ${max}` : aria["aria-label"] ?? "Rating"}
      aria-valuemin={readOnly ? undefined : 0}
      aria-valuemax={readOnly ? undefined : max}
      aria-valuenow={readOnly ? undefined : v}
      aria-valuetext={readOnly ? undefined : `${v} of ${max}`}
      onKeyDown={(e) => {
        if (readOnly) return
        const map: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }
        if (e.key in map) { e.preventDefault(); set(v + map[e.key]) }
        else if (e.key === "Home") { e.preventDefault(); set(0) }
        else if (e.key === "End") { e.preventDefault(); set(max) }
      }}
      onPointerLeave={() => setHover(null)}
      className={cn("inline-flex items-center gap-1 rounded-xl outline-offset-4", className)}
    >
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          onPointerEnter={(e) => { if (!readOnly && e.pointerType === "mouse") setHover(i + 1) }}
          onClick={() => set(v === i + 1 ? 0 : i + 1)}
          className={cn("grid place-items-center p-0.5 transition-[scale] duration-300 ease-spring", !readOnly && "cursor-pointer hover:scale-115 active:scale-90")}
        >
          <Star lit={i < shown} size={size} />
        </span>
      ))}
    </div>
  )
}
