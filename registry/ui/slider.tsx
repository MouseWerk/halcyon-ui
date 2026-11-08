"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number) => void
  /** Show tick dots along the track. */
  ticks?: number
  /** Show the value bubble while dragging. */
  showValue?: boolean
  format?: (v: number) => string
  disabled?: boolean
  "aria-label"?: string
}

/**
 * Dot-track slider. The fill is a row of lit dots, the knob is a raised key
 * that lights up and grows while you drag it.
 */
export function Slider({
  value, defaultValue = 50, min = 0, max = 100, step = 1, onValueChange, ticks = 0, showValue = true,
  format = (v) => String(v), disabled, className, ...props
}: SliderProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const [drag, setDrag] = React.useState(false)
  const track = React.useRef<HTMLDivElement>(null)
  const pct = ((v - min) / (max - min)) * 100

  const set = (n: number) => {
    const snapped = Math.round((Math.min(max, Math.max(min, n)) - min) / step) * step + min
    const fixed = Number(snapped.toFixed(6))
    if (fixed !== v) { setInner(fixed); onValueChange?.(fixed) }
  }
  const fromPointer = (clientX: number) => {
    const r = track.current!.getBoundingClientRect()
    set(min + ((clientX - r.left) / r.width) * (max - min))
  }

  return (
    <div
      className={cn("relative flex h-8 touch-none select-none items-center", disabled && "pointer-events-none opacity-50", className)}
      onPointerDown={(e) => {
        if (disabled) return
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        setDrag(true)
        fromPointer(e.clientX)
      }}
      onPointerMove={(e) => { if (drag) fromPointer(e.clientX) }}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      {...props}
    >
      <div ref={track} className="relative h-3 w-full rounded-full bg-bg shadow-inset-sm">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[radial-gradient(circle,var(--hc-glow)_1.6px,transparent_2px)] bg-[length:7px_100%] bg-repeat-x opacity-90 [filter:drop-shadow(0_0_3px_var(--hc-glow-soft))]"
          style={{ width: `${pct}%`, backgroundPosition: "3px center" }}
        />
        {ticks > 1 && Array.from({ length: ticks }, (_, i) => (
          <span key={i} className="absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dot-off" style={{ left: `${(i / (ticks - 1)) * 100}%` }} />
        ))}
      </div>
      <button
        type="button"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={v}
        aria-label={props["aria-label"]}
        disabled={disabled}
        onKeyDown={(e) => {
          const big = (max - min) / 10
          const map: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }
          if (e.key in map) { e.preventDefault(); set(v + map[e.key]) }
          if (e.key === "Home") { e.preventDefault(); set(min) }
          if (e.key === "End") { e.preventDefault(); set(max) }
        }}
        className={cn(
          "absolute top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-[8px] bg-linear-to-br from-raise to-surface",
          "transition-[scale,box-shadow] duration-300 ease-spring",
          drag
            ? "scale-115 cursor-grabbing shadow-[0_0_0_1.5px_var(--hc-glow-soft),0_0_16px_var(--hc-glow-soft),0_4px_10px_var(--hc-sh-dark)]"
            : "shadow-[0_0_0_1px_var(--hc-glow-soft),0_3px_8px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)] hover:scale-105",
        )}
        style={{ left: `${pct}%` }}
      >
        <i className={cn("size-1.5 rounded-full transition-[background-color,box-shadow] duration-300", drag ? "bg-glow shadow-[0_0_8px_var(--hc-glow)]" : "bg-glow/70")} />
        {showValue && (
          <span
            className={cn(
              "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 rounded-lg bg-surface px-2 py-0.5 font-mono text-[11px] text-ink shadow-raised-sm",
              "transition-[opacity,translate] duration-200",
              drag ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            {format(v)}
          </span>
        )}
      </button>
    </div>
  )
}

export interface RangeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: [number, number]
  defaultValue?: [number, number]
  min?: number
  max?: number
  step?: number
  /** Smallest allowed gap between the two thumbs. */
  minDistance?: number
  onValueChange?: (value: [number, number]) => void
  format?: (v: number) => string
  disabled?: boolean
  /** Accessible names for the two thumbs. */
  labels?: [string, string]
}

/** Two-thumb dot slider for a range (price, dates, sizes). The lit dots fill the span between the thumbs. */
export function RangeSlider({
  value, defaultValue = [20, 80], min = 0, max = 100, step = 1, minDistance = 0, onValueChange,
  format = (v) => String(v), disabled, labels = ["Minimum", "Maximum"], className, ...props
}: RangeSliderProps) {
  const [inner, setInner] = React.useState<[number, number]>(defaultValue)
  const v = value ?? inner
  const [drag, setDrag] = React.useState<0 | 1 | null>(null)
  const track = React.useRef<HTMLDivElement>(null)
  const thumbs = [React.useRef<HTMLButtonElement>(null), React.useRef<HTMLButtonElement>(null)]
  const pct = (n: number) => ((n - min) / (max - min)) * 100

  const set = (i: 0 | 1, n: number) => {
    const snapped = Number((Math.round((Math.min(max, Math.max(min, n)) - min) / step) * step + min).toFixed(6))
    const next: [number, number] = [...v] as [number, number]
    next[i] = i === 0 ? Math.min(snapped, v[1] - minDistance) : Math.max(snapped, v[0] + minDistance)
    if (next[0] !== v[0] || next[1] !== v[1]) { setInner(next); onValueChange?.(next) }
  }
  const at = (clientX: number) => {
    const r = track.current!.getBoundingClientRect()
    return min + ((clientX - r.left) / r.width) * (max - min)
  }

  return (
    <div
      className={cn("relative flex h-8 touch-none select-none items-center", disabled && "pointer-events-none opacity-50", className)}
      onPointerDown={(e) => {
        if (disabled) return
        const n = at(e.clientX)
        const i: 0 | 1 = Math.abs(n - v[0]) <= Math.abs(n - v[1]) && !(v[0] === v[1] && n > v[1]) ? 0 : 1
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        setDrag(i)
        set(i, n)
        thumbs[i].current?.focus({ preventScroll: true })
      }}
      onPointerMove={(e) => { if (drag !== null) set(drag, at(e.clientX)) }}
      onPointerUp={() => setDrag(null)}
      onPointerCancel={() => setDrag(null)}
      {...props}
    >
      <div ref={track} className="relative h-3 w-full rounded-full bg-bg shadow-inset-sm">
        <div
          className="absolute inset-y-0 rounded-full bg-[radial-gradient(circle,var(--hc-glow)_1.6px,transparent_2px)] bg-[length:7px_100%] bg-repeat-x opacity-90 [filter:drop-shadow(0_0_3px_var(--hc-glow-soft))]"
          style={{ left: `${pct(v[0])}%`, width: `${pct(v[1]) - pct(v[0])}%`, backgroundPosition: "3px center" }}
        />
      </div>
      {([0, 1] as const).map((i) => (
        <button
          key={i}
          ref={thumbs[i]}
          type="button"
          role="slider"
          aria-label={labels[i]}
          aria-valuemin={i === 0 ? min : v[0] + minDistance}
          aria-valuemax={i === 0 ? v[1] - minDistance : max}
          aria-valuenow={v[i]}
          aria-valuetext={format(v[i])}
          disabled={disabled}
          onKeyDown={(e) => {
            const big = (max - min) / 10
            const map: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }
            if (e.key in map) { e.preventDefault(); set(i, v[i] + map[e.key]) }
            if (e.key === "Home") { e.preventDefault(); set(i, min) }
            if (e.key === "End") { e.preventDefault(); set(i, max) }
          }}
          className={cn(
            "absolute top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-[8px] bg-linear-to-br from-raise to-surface",
            "transition-[scale,box-shadow] duration-300 ease-spring focus-visible:z-10",
            drag === i
              ? "z-10 scale-115 cursor-grabbing shadow-[0_0_0_1.5px_var(--hc-glow-soft),0_0_16px_var(--hc-glow-soft),0_4px_10px_var(--hc-sh-dark)]"
              : "shadow-[0_0_0_1px_var(--hc-glow-soft),0_3px_8px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)] hover:scale-105",
          )}
          style={{ left: `${pct(v[i])}%` }}
        >
          <i className={cn("size-1.5 rounded-full transition-[background-color,box-shadow] duration-300", drag === i ? "bg-glow shadow-[0_0_8px_var(--hc-glow)]" : "bg-glow/70")} />
          <span
            className={cn(
              "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-surface px-2 py-0.5 font-mono text-[11px] text-ink shadow-raised-sm",
              "transition-[opacity,translate] duration-200",
              drag === i ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            {format(v[i])}
          </span>
        </button>
      ))}
    </div>
  )
}
