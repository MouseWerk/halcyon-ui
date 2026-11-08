"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ResizableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** One panel per child; a handle goes between each pair. */
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
  /** Initial sizes in percent (should add up to 100). Defaults to equal. */
  defaultSizes?: number[]
  /** Minimum size per panel in percent. */
  minSize?: number | number[]
  onSizesChange?: (sizes: number[]) => void
  /** Remember sizes in localStorage under this key. */
  storageKey?: string
}

/**
 * Split view with draggable dividers. The handle is a recessed groove with a
 * dot grip that glows while dragging. Arrow keys resize, Home/End collapse to
 * the minimum, Enter resets. Panels clip their content; put a ScrollArea
 * inside a panel when it should scroll.
 */
export function Resizable({ children, direction = "horizontal", defaultSizes, minSize = 10, onSizesChange, storageKey, className, ...props }: ResizableProps) {
  const panels = React.Children.toArray(children)
  const n = panels.length
  const initial = React.useMemo(() => defaultSizes ?? Array(n).fill(100 / n), [defaultSizes, n])
  const [sizes, setSizes] = React.useState<number[]>(initial)
  const [dragging, setDragging] = React.useState<number | null>(null)
  const root = React.useRef<HTMLDivElement>(null)
  const h = direction === "horizontal"
  const min = (i: number) => (Array.isArray(minSize) ? minSize[i] ?? 10 : minSize)

  React.useEffect(() => {
    if (!storageKey) return
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) ?? "null")
      if (Array.isArray(s) && s.length === n) setSizes(s)
    } catch { /* ignore */ }
  }, [storageKey, n])

  const commit = (next: number[]) => {
    setSizes(next)
    onSizesChange?.(next)
    if (storageKey) try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
  }

  /** Move divider i (between panel i and i+1) by delta percent. */
  const shift = (i: number, delta: number, base = sizes) => {
    const a = base[i], b = base[i + 1]
    const d = Math.max(min(i) - a, Math.min(b - min(i + 1), delta))
    const next = [...base]
    next[i] = a + d
    next[i + 1] = b - d
    commit(next)
  }

  const start = (i: number, e: React.PointerEvent) => {
    e.preventDefault()
    const el = root.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const total = h ? rect.width : rect.height
    const origin = h ? e.clientX : e.clientY
    const base = [...sizes]
    setDragging(i)
    const move = (ev: PointerEvent) => shift(i, (((h ? ev.clientX : ev.clientY) - origin) / total) * 100, base)
    const up = () => { setDragging(null); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up) }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return (
    <div ref={root} className={cn("flex min-h-0 min-w-0 overflow-hidden", h ? "flex-row" : "flex-col", dragging !== null && "select-none", className)} {...props}>
      {panels.map((p, i) => (
        <React.Fragment key={i}>
          <div className="min-h-0 min-w-0 overflow-hidden" style={{ flex: `${sizes[i]} 1 0px` }}>{p}</div>
          {i < n - 1 && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation={h ? "vertical" : "horizontal"}
              aria-valuenow={Math.round(sizes[i])}
              aria-valuemin={min(i)}
              aria-valuemax={100 - min(i + 1)}
              aria-label="Resize"
              onPointerDown={(e) => start(i, e)}
              onDoubleClick={() => commit(initial)}
              onKeyDown={(e) => {
                const step = e.shiftKey ? 10 : 2
                const fwd = h ? "ArrowRight" : "ArrowDown", back = h ? "ArrowLeft" : "ArrowUp"
                if (e.key === fwd) { e.preventDefault(); shift(i, step) }
                else if (e.key === back) { e.preventDefault(); shift(i, -step) }
                else if (e.key === "Home") { e.preventDefault(); shift(i, -100) }
                else if (e.key === "End") { e.preventDefault(); shift(i, 100) }
                else if (e.key === "Enter") { e.preventDefault(); commit(initial) }
              }}
              className={cn(
                "group relative flex shrink-0 touch-none items-center justify-center outline-none",
                h ? "w-3 cursor-col-resize" : "h-3 cursor-row-resize",
              )}
            >
              <span className={cn("absolute rounded-full bg-bg shadow-inset-sm", h ? "inset-y-2 w-1" : "inset-x-2 h-1")} />
              <span
                className={cn(
                  "relative grid gap-[3px] rounded-md bg-surface p-[3px] shadow-raised-sm transition-[box-shadow,scale] duration-200 ease-spring group-hover:scale-110 group-focus-visible:shadow-glow",
                  h ? "grid-cols-1" : "grid-flow-col",
                  dragging === i && "scale-110 shadow-glow",
                )}
              >
                {[0, 1, 2].map((k) => <i key={k} className={cn("size-[3px] rounded-full transition-colors", dragging === i ? "bg-glow" : "bg-muted/60")} />)}
              </span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
