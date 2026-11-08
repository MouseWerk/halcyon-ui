"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DotChartProps extends Omit<React.SVGAttributes<SVGSVGElement>, "format" | "values"> {
  labels: string[]
  values: number[]
  /** Value of one lit dot. */
  unit: number
  /** Dot rows (height of the matrix). */
  rows?: number
  /** Dots per column. */
  dotsPerColumn?: number
  /** Formats the y-axis tick values. */
  format?: (v: number) => string
  /** Every n-th row gets a tick label. */
  tickEvery?: number
}

/**
 * Dot-matrix bar chart. Each lit dot is one `unit`. Columns pop in with a
 * staggered spring; the peak dot glows. Colors follow the theme tokens.
 */
export function DotChart({
  labels, values, unit, rows = 12, dotsPerColumn = 3, format = (v) => String(v), tickEvery = 4, className, ...props
}: DotChartProps) {
  const W = 640, H = 230, padL = 38, padB = 26, padT = 8
  const cols = labels.length
  const cw = (W - padL) / cols
  const rh = (H - padB - padT) / rows
  const gap = 4
  const r = Math.max(1.5, Math.min(rh / 2 - 1, (cw - 10) / (dotsPerColumn * 2) - gap / 2))
  const max = Math.max(...values)
  const peak = values.indexOf(max)
  const [shown, setShown] = React.useState(false)
  const key = labels.join("|") + values.join("|")

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) { setShown(true); return }
    setShown(false)
    const t = setTimeout(() => setShown(true), 30)
    return () => clearTimeout(t)
  }, [key])

  const dots: React.ReactNode[] = []
  for (let c = 0; c < cols; c++) {
    const lit = Math.round(values[c] / unit)
    const x0 = padL + c * cw + cw / 2 - ((dotsPerColumn - 1) * (r * 2 + gap)) / 2
    for (let row = 0; row < rows; row++) {
      const cy = H - padB - (row + 0.5) * rh
      for (let k = 0; k < dotsPerColumn; k++) {
        const on = row < lit
        const isPeak = c === peak && row === lit - 1
        dots.push(
          <circle
            key={`${c}-${row}-${k}`}
            cx={x0 + k * (r * 2 + gap)}
            cy={cy}
            r={r}
            className={cn(
              // scale (not the r attribute) so the pop animates in every engine, Safari included
              "origin-center transition-[scale,fill] duration-[450ms] ease-spring [transform-box:fill-box]",
              on && !shown ? "scale-0" : "scale-100",
              on ? "fill-glow" : "fill-dot-off",
              isPeak && "drop-shadow-[0_0_3px_var(--hc-glow)]",
            )}
            style={{ transitionDelay: on && shown ? `${c * 40 + row * 18}ms, 0ms` : "0ms" }}
          />,
        )
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" className={cn("block h-auto w-full min-w-[520px]", className)} {...props}>
      {Array.from({ length: Math.floor(rows / tickEvery) + 1 }, (_, i) => i * tickEvery).map((g) => (
        <text key={g} x={padL - 8} y={H - padB - g * rh + 3} textAnchor="end" className="fill-muted font-mono text-[11px]">
          {format(g * unit)}
        </text>
      ))}
      {dots}
      {labels.map((l, c) => (
        <text key={l + c} x={padL + c * cw + cw / 2} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">
          {l}
        </text>
      ))}
    </svg>
  )
}
