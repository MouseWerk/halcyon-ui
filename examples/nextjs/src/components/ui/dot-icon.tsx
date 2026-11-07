"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { createMorph, glyphs, type Glyph, type GlyphName } from "@/lib/dot-matrix"

export interface DotIconProps extends Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
  /** A built-in glyph name or a custom glyph from `glyph()` / `bitmap()`. */
  icon: GlyphName | Glyph
  /** Rendered size in px. */
  size?: number
  /** Halo strength 0..1 (0 disables the glow). */
  glow?: number
}

/**
 * Dot-matrix icon drawn on canvas. Changing `icon` scatters the dots and
 * lets them settle into the new glyph. Re-tints itself when the theme changes.
 */
export function DotIcon({ icon, size = 24, glow = 0.55, className, style, ...props }: DotIconProps) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const morph = React.useRef<ReturnType<typeof createMorph> | null>(null)
  const g = typeof icon === "string" ? glyphs[icon] : icon

  React.useEffect(() => {
    const canvas = ref.current!
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    morph.current = createMorph(canvas, g, { glowAlpha: glow, reducedMotion: reduced })
    const obs = new MutationObserver(() => morph.current?.redraw())
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onMq = () => morph.current?.redraw()
    mq.addEventListener("change", onMq)
    return () => { obs.disconnect(); mq.removeEventListener("change", onMq); morph.current?.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) { first.current = false; return }
    morph.current?.to(g)
  }, [g])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn("block shrink-0", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  )
}
