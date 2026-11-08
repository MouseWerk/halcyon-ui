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
  // The drawing is laid out in real pixels of the rendered width, so it never
  // needs a min-width: on narrow screens columns get fewer dots and only every
  // n-th label is shown, while the text stays readable.
  const ref = React.useRef<SVGSVGElement>(null)
  const [measured, setMeasured] = React.useState(640)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width)
      if (w > 0) setMeasured((p) => (Math.abs(p - w) > 2 ? w : p))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const W = Math.max(240, measured)
  const H = Math.round(Math.min(230, Math.max(170, W * 0.36)))
  const padL = W < 420 ? 34 : 38, padB = 24, padT = 8
  const cols = labels.length
  const cw = (W - padL) / cols
  const rh = (H - padB - padT) / rows
  const gap = W < 420 ? 2.5 : 4
  const perCol = Math.max(1, Math.min(dotsPerColumn, cw >= 38 ? 3 : cw >= 22 ? 2 : 1))
  const r = Math.max(1.5, Math.min(rh / 2 - 1, (cw - 6) / (perCol * 2) - gap / 2))
  const labelEvery = Math.max(1, Math.ceil(30 / cw))
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
    const x0 = padL + c * cw + cw / 2 - ((perCol - 1) * (r * 2 + gap)) / 2
    for (let row = 0; row < rows; row++) {
      const cy = H - padB - (row + 0.5) * rh
      for (let k = 0; k < perCol; k++) {
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
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Chart: ${labels.map((l, i) => `${l} ${format(values[i])}`).join(", ")}`} className={cn("block h-auto w-full", className)} {...props}>
      {Array.from({ length: Math.floor(rows / tickEvery) + 1 }, (_, i) => i * tickEvery).map((g) => (
        <text key={g} x={padL - 8} y={H - padB - g * rh + 3} textAnchor="end" className="fill-muted font-mono text-[11px]">
          {format(g * unit)}
        </text>
      ))}
      {dots}
      {labels.map((l, c) => c % labelEvery !== 0 ? null : (
        <text key={l + c} x={padL + c * cw + cw / 2} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[11px]">
          {l}
        </text>
      ))}
    </svg>
  )
}
