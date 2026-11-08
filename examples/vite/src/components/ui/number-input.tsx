"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NumberInputProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Fraction digits shown and kept. */
  decimals?: number
  disabled?: boolean
  className?: string
  id?: string
  "aria-label"?: string
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Stepper: a recessed well with a dot-matrix number between two raised keys.
 * Hold a key to repeat (it speeds up), type a value, or use the arrow keys.
 */
export function NumberInput({
  value, defaultValue = 0, onValueChange, min = -Infinity, max = Infinity, step = 1, decimals = 0, disabled, className, id, ...aria
}: NumberInputProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const [draft, setDraft] = React.useState<string | null>(null)
  const vRef = React.useRef(v)
  vRef.current = v
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const commit = React.useCallback((n: number) => {
    const next = Number(clamp(n, min, max).toFixed(decimals))
    if (Number.isNaN(next) || next === vRef.current) return
    vRef.current = next
    setInner(next)
    onValueChange?.(next)
  }, [min, max, decimals, onValueChange])

  const stop = () => clearTimeout(timer.current)
  React.useEffect(() => stop, [])

  const hold = (d: number) => {
    commit(vRef.current + d)
    let delay = 380
    const tick = () => { commit(vRef.current + d); delay = Math.max(40, delay * 0.8); timer.current = setTimeout(tick, delay) }
    timer.current = setTimeout(tick, delay)
  }

  const key = (d: -1 | 1) => {
    const atEdge = d < 0 ? v <= min : v >= max
    return (
      <button
        type="button"
        tabIndex={-1}
        aria-label={d < 0 ? "Decrease" : "Increase"}
        disabled={disabled || atEdge}
        onPointerDown={(e) => { if (e.button !== 0) return; e.preventDefault(); hold(d * step) }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        className={cn(
          "grid size-8 shrink-0 cursor-pointer touch-none place-items-center rounded-[10px] bg-surface text-muted shadow-key",
          "transition-[scale,box-shadow,color] duration-200 ease-spring hover:text-ink active:scale-90 active:shadow-inset-sm",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
          <path d={d < 0 ? "M2.5 6h7" : "M2.5 6h7M6 2.5v7"} />
        </svg>
      </button>
    )
  }

  return (
    <div className={cn("inline-flex h-11 items-center gap-1 rounded-[13px] bg-bg p-1.5 shadow-inset", disabled && "opacity-50", className)}>
      {key(-1)}
      <input
        id={id}
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        role="spinbutton"
        aria-label={aria["aria-label"]}
        aria-valuenow={v}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        disabled={disabled}
        value={draft ?? v.toFixed(decimals)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== null) { const n = parseFloat(draft.replace(",", ".")); if (!Number.isNaN(n)) commit(n) } setDraft(null) }}
        onKeyDown={(e) => {
          const big = step * 10
          const map: Record<string, number> = { ArrowUp: step, ArrowDown: -step, PageUp: big, PageDown: -big }
          if (e.key in map) { e.preventDefault(); setDraft(null); commit(v + map[e.key]) }
          else if (e.key === "Home" && Number.isFinite(min)) { e.preventDefault(); commit(min) }
          else if (e.key === "End" && Number.isFinite(max)) { e.preventDefault(); commit(max) }
          else if (e.key === "Enter") (e.target as HTMLInputElement).blur()
        }}
        className="w-[7ch] min-w-0 bg-transparent text-center font-dot text-xl font-extrabold tabular-nums text-ink outline-none"
      />
      {key(1)}
    </div>
  )
}
