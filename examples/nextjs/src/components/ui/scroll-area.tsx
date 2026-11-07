"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
  /** Fade the edges where more content is hidden. */
  fade?: boolean
  /** Fade length in px. */
  fadeSize?: number
  /** Scrollbar style: `float` (default), `inset` well, or `none`. */
  scrollbar?: "float" | "inset" | "none"
}

/**
 * Scroll container with soft edge fades that appear only on the sides that
 * still have content, and the tactile Halcyon scrollbar.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation = "vertical", fade = true, fadeSize = 28, scrollbar = "float", className, style, onScroll, children, ...props }, fwd) => {
    const ref = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(fwd, () => ref.current!)
    const [edges, setEdges] = React.useState({ t: 0, b: 0, l: 0, r: 0 })

    const measure = React.useCallback(() => {
      const el = ref.current
      if (!el) return
      const k = (v: number) => Math.max(0, Math.min(1, v / fadeSize))
      setEdges({
        t: k(el.scrollTop),
        b: k(el.scrollHeight - el.clientHeight - el.scrollTop),
        l: k(el.scrollLeft),
        r: k(el.scrollWidth - el.clientWidth - el.scrollLeft),
      })
    }, [fadeSize])

    React.useEffect(() => {
      measure()
      const ro = new ResizeObserver(measure)
      if (ref.current) {
        ro.observe(ref.current)
        Array.from(ref.current.children).forEach((c) => ro.observe(c))
      }
      return () => ro.disconnect()
    }, [measure])

    const v = orientation !== "horizontal"
    const h = orientation !== "vertical"
    const masks: string[] = []
    if (fade && v) masks.push(`linear-gradient(to bottom, transparent, black ${edges.t * fadeSize}px, black calc(100% - ${edges.b * fadeSize}px), transparent)`)
    if (fade && h) masks.push(`linear-gradient(to right, transparent, black ${edges.l * fadeSize}px, black calc(100% - ${edges.r * fadeSize}px), transparent)`)
    const mask = masks.length ? masks.join(", ") : undefined

    return (
      <div
        ref={ref}
        onScroll={(e) => { measure(); onScroll?.(e) }}
        className={cn(
          "relative overscroll-contain",
          v ? "overflow-y-auto" : "overflow-y-hidden",
          h ? "overflow-x-auto" : "overflow-x-hidden",
          scrollbar === "none" && "scrollbar-none",
          scrollbar === "inset" && "scrollbar-inset",
          className,
        )}
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskComposite: masks.length > 1 ? "intersect" : undefined,
          WebkitMaskComposite: masks.length > 1 ? "source-in" : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
ScrollArea.displayName = "ScrollArea"
