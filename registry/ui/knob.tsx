"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface KnobProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Diameter in px. */
  size?: number
  /** Dots in the ring. */
  dots?: number
  label?: React.ReactNode
  format?: (v: number) => string
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

const SWEEP = 270 // degrees of travel, from 7:30 to 4:30 o'clock

/**
 * Rotary dial like on a hardware synth. Drag up/down (or sideways), scroll,
 * or use the arrow keys. A ring of dots lights up with the value.
 */
export function Knob({
  value, defaultValue = 50, onValueChange, min = 0, max = 100, step = 1, size = 88, dots = 21, label,
  format = (v) => String(v), disabled, className, ...aria
}: KnobProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const [drag, setDrag] = React.useState(false)
  const start = React.useRef({ y: 0, x: 0, v: 0 })
  const ref = React.useRef<HTMLDivElement>(null)
  const k = (v - min) / (max - min || 1)
  const angle = -SWEEP / 2 + k * SWEEP

  const set = React.useCallback((n: number) => {
    const snapped = Math.round((Math.min(max, Math.max(min, n)) - min) / step) * step + min
    const fixed = Number(snapped.toFixed(6))
    if (value === undefined) setInner(fixed)
    if (fixed !== v) onValueChange?.(fixed)
  }, [min, max, step, v, value, onValueChange])

  // Wheel needs a non-passive listener to stop the page from scrolling.
  const setRef = React.useRef(set)
  setRef.current = set
  const vRef = React.useRef(v)
  vRef.current = v
  React.useEffect(() => {
    const el = ref.current
    if (!el || disabled) return
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el) return
      e.preventDefault()
      setRef.current(vRef.current + (e.deltaY < 0 ? step : -step))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [disabled, step])

  const r = size / 2
  const ringR = r - 5
  const knobSize = size - 26

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", disabled && "pointer-events-none opacity-50", className)}>
      <div
        ref={ref}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={aria["aria-label"] ?? (typeof label === "string" ? label : "Knob")}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={v}
        aria-valuetext={format(v)}
        aria-disabled={disabled || undefined}
        onPointerDown={(e) => {
          if (disabled) return
          e.currentTarget.setPointerCapture(e.pointerId)
          e.currentTarget.focus({ preventScroll: true })
          start.current = { y: e.clientY, x: e.clientX, v }
          setDrag(true)
        }}
        onPointerMove={(e) => {
          if (!drag) return
          const d = (start.current.y - e.clientY) + (e.clientX - start.current.x)
          set(start.current.v + (d / 180) * (max - min))
        }}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
        onKeyDown={(e) => {
          const big = (max - min) / 10
          const map: Record<string, number> = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big }
          if (e.key in map) { e.preventDefault(); set(v + map[e.key]) }
          else if (e.key === "Home") { e.preventDefault(); set(min) }
          else if (e.key === "End") { e.preventDefault(); set(max) }
        }}
        className={cn("relative grid touch-none select-none place-items-center rounded-full outline-offset-2", drag ? "cursor-grabbing" : "cursor-grab")}
        style={{ width: size, height: size }}
      >
        {/* dot ring */}
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => {
            const t = i / (dots - 1)
            const a = ((-SWEEP / 2 + t * SWEEP - 90) * Math.PI) / 180
            const on = t <= k + 1e-6
            return (
              <circle
                key={i}
                cx={+(r + Math.cos(a) * ringR).toFixed(3)}
                cy={+(r + Math.sin(a) * ringR).toFixed(3)}
                r={1.7}
                className={cn("transition-[fill] duration-150", on ? "fill-glow" : "fill-dot-off")}
                style={on ? { filter: "drop-shadow(0 0 2px var(--hc-glow))" } : undefined}
              />
            )
          })}
        </svg>
        {/* well */}
        <span className="absolute rounded-full bg-bg shadow-inset-sm" style={{ width: knobSize + 8, height: knobSize + 8 }} />
        {/* cap */}
        <span
          className={cn(
            "relative rounded-full bg-linear-to-br from-raise to-surface transition-[box-shadow,scale] duration-300 ease-spring",
            drag ? "scale-[1.03] shadow-glow" : "shadow-raised-sm",
          )}
          style={{ width: knobSize, height: knobSize, rotate: `${angle}deg` }}
        >
          <i
            className="absolute left-1/2 top-[9%] size-[7px] -translate-x-1/2 rounded-full bg-glow shadow-[0_0_6px_var(--hc-glow),0_0_12px_var(--hc-glow-soft)]"
          />
        </span>
      </div>
      <div className="flex flex-col items-center leading-tight">
        <span className="font-dot text-lg font-extrabold tabular-nums">{format(v)}</span>
        {label && <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{label}</span>}
      </div>
    </div>
  )
}
