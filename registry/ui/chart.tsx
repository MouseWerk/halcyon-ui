"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Categorical slots in fixed order (validated for colour-blind separation). Never cycle past 5: group the rest into "Other". */
export const chartColors = ["var(--hc-chart-1)", "var(--hc-chart-2)", "var(--hc-chart-3)", "var(--hc-chart-4)", "var(--hc-chart-5)"]

export interface ChartSeries {
  key: string
  label: string
  /** Defaults to the next categorical slot. */
  color?: string
}

type Row = Record<string, string | number>

interface CartesianProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: Row[]
  /** Key of the x-axis label in each row, e.g. "month". */
  index: string
  series: ChartSeries[]
  format?: (v: number) => string
  /** Chart height in px (width follows the container). */
  height?: number
  legend?: boolean
  /** Short description for screen readers, e.g. "Revenue by month". */
  title?: string
}

const PAD = { l: 44, r: 12, t: 12, b: 28 }

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}

function smooth(pts: [number, number][]) {
  if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const t = 0.18
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`
  }
  return d
}

function useMounted() {
  const [m, setM] = React.useState(false)
  React.useEffect(() => { const r = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(r) }, [])
  return m
}

export function ChartLegend({ series, className }: { series: ChartSeries[]; className?: string }) {
  return (
    <ul className={cn("m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0 text-xs text-muted", className)}>
      {series.map((s, i) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: s.color ?? chartColors[i] }} />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

function Tooltip({ x, label, rows, width }: { x: number; label: string; rows: { label: string; value: string; color: string }[]; width: number }) {
  const left = Math.min(Math.max(x, 0), width)
  const flip = left > width * 0.6
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-xl bg-raise px-3 py-2 text-xs shadow-[0_8px_20px_-4px_var(--hc-sh-dark),0_0_0_1px_var(--hc-line)]"
      style={{ left, translate: flip ? "calc(-100% - 12px) 0" : "12px 0" }}
    >
      <div className="mb-1 font-mono text-[11px] text-muted">{label}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5">
          <span className="size-2 rounded-[2px]" style={{ background: r.color }} />
          <span className="flex-1 text-muted">{r.label}</span>
          <span className="font-mono tabular-nums text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Shared frame: axes, gridlines, hover tracking and keyboard navigation. */
function useCartesian({ data, series, height, format }: { data: Row[]; series: ChartSeries[]; height: number; format: (v: number) => string }) {
  const H = height
  const box = React.useRef<HTMLDivElement>(null)
  const [boxW, setBoxW] = React.useState(640)
  // Draw at the real pixel width so text and strokes never scale.
  const W = Math.max(240, Math.round(boxW))
  const max = niceMax(Math.max(0, ...data.flatMap((r) => series.map((s) => Number(r[s.key]) || 0))))
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max)
  const y = (v: number) => PAD.t + (1 - v / max) * (H - PAD.t - PAD.b)
  const [hover, setHover] = React.useState<number | null>(null)
  React.useEffect(() => {
    const el = box.current
    if (!el) return
    setBoxW(el.clientWidth || 640)
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth || 640))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const grid = (
    <g aria-hidden="true">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-[var(--hc-sh-dark)]" : "stroke-line"} strokeWidth={1} />
          <text x={PAD.l - 8} y={y(t) + 3.5} textAnchor="end" className="fill-muted font-mono text-[10.5px]">{format(t)}</text>
        </g>
      ))}
    </g>
  )
  return { W, H, y, max, box, hover, setHover, boxW, grid }
}

function summary(title: string | undefined, data: Row[], index: string, series: ChartSeries[], format: (v: number) => string) {
  return `${title ? title + ". " : ""}${series.map((s) => `${s.label}: ${data.map((r) => `${r[index]} ${format(Number(r[s.key]) || 0)}`).join(", ")}`).join(". ")}`
}

export interface AreaChartProps extends CartesianProps {
  /** Draw lines only (a line chart). */
  lines?: boolean
  curve?: "smooth" | "linear"
}

/** Area or line chart with a crosshair tooltip. Arrow keys move the crosshair when focused. */
export function AreaChart({ data, index, series, format = (v) => v.toLocaleString("en-US"), height = 240, legend = true, title, lines = false, curve = "smooth", className, ...props }: AreaChartProps) {
  const { W, H, y, box, hover, setHover, boxW, grid } = useCartesian({ data, series, height, format })
  const mounted = useMounted()
  const gid = React.useId().replace(/:/g, "")
  const n = data.length
  const x = (i: number) => PAD.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - PAD.l - PAD.r))
  const path = (pts: [number, number][]) => (curve === "smooth" ? smooth(pts) : pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" "))

  const pick = (clientX: number) => {
    const r = box.current!.getBoundingClientRect()
    const vx = ((clientX - r.left) / r.width) * W
    setHover(Math.max(0, Math.min(n - 1, Math.round(((vx - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1)))))
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      {legend && series.length > 1 && <ChartLegend series={series} />}
      <div
        ref={box}
        tabIndex={0}
        role="img"
        aria-label={summary(title, data, index, series, format)}
        className="relative rounded-xl outline-offset-4"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); setHover((h) => Math.min(n - 1, (h ?? -1) + 1)) }
          if (e.key === "ArrowLeft") { e.preventDefault(); setHover((h) => Math.max(0, (h ?? n) - 1)) }
          if (e.key === "Escape") setHover(null)
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`${gid}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? chartColors[i]} stopOpacity={0.32} />
                <stop offset="100%" stopColor={s.color ?? chartColors[i]} stopOpacity={0} />
              </linearGradient>
            ))}
            {/* lines draw in left to right (a clip, so it works with non-scaling strokes) */}
            <clipPath id={`${gid}-clip`}>
              <rect x={0} y={-10} width={W} height={H + 20} className="origin-left transition-[scale] duration-[1200ms] ease-out-soft [transform-box:fill-box]" style={{ scale: mounted ? "1 1" : "0 1" }} />
            </clipPath>
          </defs>
          {grid}
          {series.map((s, i) => {
            const pts = data.map((r, k) => [x(k), y(Number(r[s.key]) || 0)] as [number, number])
            const d = path(pts)
            const color = s.color ?? chartColors[i]
            return (
              <g key={s.key}>
                {!lines && <path d={`${d} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gid}-${i})`} className={cn("transition-opacity duration-700", mounted ? "opacity-100" : "opacity-0")} />}
                <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" clipPath={`url(#${gid}-clip)`} />
              </g>
            )
          })}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} className="stroke-muted" strokeWidth={1} strokeDasharray="3 3" />
              {series.map((s, i) => (
                <circle key={s.key} cx={x(hover)} cy={y(Number(data[hover][s.key]) || 0)} r={4.5} fill={s.color ?? chartColors[i]} className="stroke-surface" strokeWidth={2} />
              ))}
            </g>
          )}
          {data.map((r, k) => {
            const every = Math.ceil(n / 8)
            if (k % every && k !== n - 1) return null
            return <text key={k} x={x(k)} y={H - 8} textAnchor={k === 0 ? "start" : k === n - 1 ? "end" : "middle"} className="fill-muted font-mono text-[10.5px]">{String(r[index])}</text>
          })}
        </svg>
        {hover !== null && (
          <Tooltip
            x={(x(hover) / W) * boxW}
            width={boxW}
            label={String(data[hover][index])}
            rows={series.map((s, i) => ({ label: s.label, value: format(Number(data[hover][s.key]) || 0), color: s.color ?? chartColors[i] }))}
          />
        )}
      </div>
    </div>
  )
}

/** Line chart: AreaChart without the fill. */
export function LineChart(props: Omit<AreaChartProps, "lines">) {
  return <AreaChart {...props} lines />
}

/** Grouped bar chart with rounded tops that grow from the baseline. Hover or arrow keys show values. */
export function BarChart({ data, index, series, format = (v) => v.toLocaleString("en-US"), height = 240, legend = true, title, className, ...props }: CartesianProps) {
  const { W, H, y, box, hover, setHover, boxW, grid } = useCartesian({ data, series, height, format })
  const mounted = useMounted()
  const n = data.length
  const band = (W - PAD.l - PAD.r) / Math.max(1, n)
  const gap = 2
  const inner = Math.min(band * 0.72, series.length * 22)
  const bw = Math.max(3, (inner - gap * (series.length - 1)) / series.length)

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      {legend && series.length > 1 && <ChartLegend series={series} />}
      <div
        ref={box}
        tabIndex={0}
        role="img"
        aria-label={summary(title, data, index, series, format)}
        className="relative rounded-xl outline-offset-4"
        onPointerLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); setHover((h) => Math.min(n - 1, (h ?? -1) + 1)) }
          if (e.key === "ArrowLeft") { e.preventDefault(); setHover((h) => Math.max(0, (h ?? n) - 1)) }
          if (e.key === "Escape") setHover(null)
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          {grid}
          {data.map((r, k) => {
            const x0 = PAD.l + k * band + (band - inner) / 2
            return (
              <g key={k} onPointerEnter={() => setHover(k)}>
                <rect x={PAD.l + k * band} y={PAD.t} width={band} height={H - PAD.t - PAD.b} className={cn("transition-[fill]", hover === k ? "fill-[color-mix(in_oklab,var(--hc-ink)_5%,transparent)]" : "fill-transparent")} />
                {series.map((s, i) => {
                  const v = Number(r[s.key]) || 0
                  const top = y(v)
                  const h = Math.max(0, y(0) - top)
                  const rad = Math.min(4, bw / 2, h)
                  const bx = x0 + i * (bw + gap)
                  return (
                    <path
                      key={s.key}
                      d={`M${bx},${y(0)} V${top + rad} Q${bx},${top} ${bx + rad},${top} H${bx + bw - rad} Q${bx + bw},${top} ${bx + bw},${top + rad} V${y(0)} Z`}
                      fill={s.color ?? chartColors[i]}
                      className={cn("origin-bottom transition-[scale,opacity] duration-700 ease-spring [transform-box:fill-box]", hover !== null && hover !== k && "opacity-55")}
                      style={{ scale: mounted ? "1 1" : "1 0", transitionDelay: mounted ? `${k * 35 + i * 20}ms, 0ms` : "0ms" }}
                    />
                  )
                })}
                {(() => { const every = Math.ceil(n / 10); return k % every === 0 ? <text x={PAD.l + k * band + band / 2} y={H - 8} textAnchor="middle" className="fill-muted font-mono text-[10.5px]">{String(r[index])}</text> : null })()}
              </g>
            )
          })}
        </svg>
        {hover !== null && (
          <Tooltip
            x={((PAD.l + hover * band + band / 2) / W) * boxW}
            width={boxW}
            label={String(data[hover][index])}
            rows={series.map((s, i) => ({ label: s.label, value: format(Number(data[hover][s.key]) || 0), color: s.color ?? chartColors[i] }))}
          />
        )}
      </div>
    </div>
  )
}

export interface DonutChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  data: { label: string; value: number; color?: string }[]
  format?: (v: number) => string
  size?: number
  /** Center content. Defaults to the total. */
  center?: React.ReactNode
  centerLabel?: string
  legend?: boolean
  title?: string
}

/** Donut with gaps between segments. Hovering (or focusing) a segment lifts it and shows its share. */
export function DonutChart({ data, format = (v) => v.toLocaleString("en-US"), size = 200, center, centerLabel = "Total", legend = true, title, className, ...props }: DonutChartProps) {
  const total = data.reduce((a, d) => a + Math.max(0, d.value), 0) || 1
  const [hover, setHover] = React.useState<number | null>(null)
  const mounted = useMounted()
  const R = 90, r = 62, C = 100
  let acc = 0
  const gapA = data.length > 1 ? 0.025 : 0
  const arcs = data.map((d, i) => {
    const a0 = (acc / total) * Math.PI * 2 + gapA / 2
    acc += Math.max(0, d.value)
    const a1 = (acc / total) * Math.PI * 2 - gapA / 2
    return { ...d, a0, a1, color: d.color ?? chartColors[i % chartColors.length], i }
  })
  const arc = (a0: number, a1: number, ro: number, ri: number) => {
    const p = (a: number, rr: number) => `${C + Math.sin(a) * rr},${C - Math.cos(a) * rr}`
    const large = a1 - a0 > Math.PI ? 1 : 0
    return `M${p(a0, ro)} A${ro},${ro} 0 ${large} 1 ${p(a1, ro)} L${p(a1, ri)} A${ri},${ri} 0 ${large} 0 ${p(a0, ri)} Z`
  }
  const h = hover !== null ? arcs[hover] : null

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6", className)} {...props}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="size-full overflow-visible" role="group" aria-label={`${title ? title + ". " : ""}${data.map((d) => `${d.label} ${format(d.value)} (${Math.round((d.value / total) * 100)}%)`).join(", ")}`}>
          <circle cx={C} cy={C} r={(R + r) / 2} fill="none" className="stroke-bg" strokeWidth={R - r + 8} />
          {arcs.map((a) => (
            <path
              key={a.i}
              d={arc(a.a0, Math.max(a.a0, a.a1), R, r)}
              fill={a.color}
              onPointerEnter={() => setHover(a.i)}
              onPointerLeave={() => setHover(null)}
              className={cn("origin-center cursor-pointer transition-[scale,opacity] duration-500 ease-spring [transform-box:view-box]", hover !== null && hover !== a.i && "opacity-50")}
              style={{ scale: !mounted ? 0.6 : hover === a.i ? 1.05 : 1, opacity: mounted ? undefined : 0, transitionDelay: mounted ? `${a.i * 60}ms` : "0ms" }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          {center ?? (
            <div>
              <div className="font-dot text-2xl font-extrabold tabular-nums">{h ? `${Math.round((h.value / total) * 100)}%` : format(total)}</div>
              <div className="font-mono text-[10.5px] uppercase tracking-[.12em] text-muted">{h ? h.label : centerLabel}</div>
            </div>
          )}
        </div>
      </div>
      {legend && (
        <ul className="m-0 flex min-w-40 list-none flex-col gap-1.5 p-0 text-[13px]">
          {arcs.map((a) => (
            <li key={a.i}>
              {/* focusable rows: keyboard users highlight a segment from the legend */}
              <button
                type="button"
                onPointerEnter={() => setHover(a.i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(a.i)}
                onBlur={() => setHover(null)}
                className={cn("flex w-full cursor-default items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-[background-color,box-shadow]", hover === a.i && "bg-bg shadow-inset-sm")}
              >
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: a.color }} />
                <span className="flex-1 text-muted">{a.label}</span>
                <span className="font-mono text-[12px] tabular-nums">{format(a.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
