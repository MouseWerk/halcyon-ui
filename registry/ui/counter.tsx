"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  decimals?: number
  /** Animation length in ms. */
  duration?: number
  locale?: string
}

/** Dot-matrix numeral that counts up to `value` (and re-counts when it changes). */
export function Counter({ value, decimals = 0, duration = 1400, locale = "en-US", className, ...props }: CounterProps) {
  const [shown, setShown] = React.useState(0)
  const from = React.useRef(0)

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) { setShown(value); from.current = value; return }
    const start = from.current
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration)
      const e = 1 - Math.pow(1 - k, 4)
      const v = start + (value - start) * e
      setShown(v)
      from.current = v
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return (
    <span className={cn("font-dot font-extrabold tabular-nums", className)} {...props}>
      {shown.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
    </span>
  )
}
