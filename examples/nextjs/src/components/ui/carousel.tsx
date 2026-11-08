"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** One slide per child. */
  children: React.ReactNode
  /** Slides visible at once (can be fractional for a peek, e.g. 1.15). */
  perView?: number
  gap?: number
  /** Auto-advance interval in ms. Pauses on hover, focus and when off-screen. */
  autoplay?: number
  loop?: boolean
  onIndexChange?: (index: number) => void
  "aria-label"?: string
}

/**
 * Swipeable carousel built on native scroll-snap (smooth on every touch
 * device). Raised arrow keys, dot-matrix indicators, arrow-key support and
 * optional autoplay that respects reduced motion.
 */
export function Carousel({ children, perView = 1, gap = 16, autoplay, loop = false, onIndexChange, className, ...props }: CarouselProps) {
  const slides = React.Children.toArray(children)
  const n = slides.length
  const track = React.useRef<HTMLDivElement>(null)
  const [index, setIndex] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const pages = Math.max(1, Math.ceil(n - perView + 1))

  const scrollTo = React.useCallback((i: number) => {
    const el = track.current
    if (!el) return
    const target = loop ? (i + pages) % pages : Math.max(0, Math.min(pages - 1, i))
    const slide = el.children[target] as HTMLElement | undefined
    if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [loop, pages])

  // Track the active slide from the scroll position.
  React.useEffect(() => {
    const el = track.current
    if (!el) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1
        const i = Math.round(el.scrollLeft / (w + gap))
        setIndex((cur) => { const v = Math.min(pages - 1, Math.max(0, i)); if (v !== cur) onIndexChange?.(v); return v })
      })
    }
    el.addEventListener("scroll", on, { passive: true })
    return () => { el.removeEventListener("scroll", on); cancelAnimationFrame(raf) }
  }, [gap, pages, onIndexChange])

  // Autoplay, paused while hovered/focused, hidden or with reduced motion.
  React.useEffect(() => {
    if (!autoplay || paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setInterval(() => { if (!document.hidden) scrollTo(index + 1 >= pages ? 0 : index + 1) }, autoplay)
    return () => clearInterval(t)
  }, [autoplay, paused, index, pages, scrollTo])

  const arrow = (d: -1 | 1) => {
    const off = !loop && (d < 0 ? index === 0 : index >= pages - 1)
    return (
      <button
        type="button"
        aria-label={d < 0 ? "Previous slide" : "Next slide"}
        disabled={off}
        onClick={() => scrollTo(index + d)}
        className="grid size-9 cursor-pointer place-items-center rounded-xl bg-surface text-muted shadow-key transition-[scale,box-shadow,color,opacity] duration-200 ease-spring hover:text-ink active:scale-90 active:shadow-inset-sm disabled:pointer-events-none disabled:opacity-35"
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d < 0 ? "M7.5 2.5 4 6l3.5 3.5" : "M4.5 2.5 8 6 4.5 9.5"} /></svg>
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      className={cn("flex flex-col gap-3", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); scrollTo(index + 1) }
        if (e.key === "ArrowLeft") { e.preventDefault(); scrollTo(index - 1) }
      }}
      {...props}
    >
      <div
        ref={track}
        tabIndex={0}
        aria-live={autoplay && !paused ? "off" : "polite"}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-hc outline-offset-4 scrollbar-none"
        style={{ gap, scrollPaddingInline: 0 }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            className="shrink-0 snap-start"
            style={{ width: `calc((100% - ${gap * (Math.ceil(perView) - 1)}px) / ${perView})` }}
          >
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {arrow(-1)}
        <div className="flex flex-1 items-center justify-center gap-1.5" role="tablist" aria-label="Choose slide">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => scrollTo(i)}
              className="grid size-6 cursor-pointer place-items-center"
            >
              <span className={cn("block h-1.5 rounded-full transition-[width,background-color,box-shadow] duration-500 ease-spring", i === index ? "w-4 bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "w-1.5 bg-dot-off")} />
            </button>
          ))}
        </div>
        {arrow(1)}
      </div>
    </div>
  )
}
