"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  className?: string
  "aria-label"?: string
}

/** Segmented control: a raised thumb springs between options inside a recessed track. */
export function Segmented<T extends string>({
  options, value, defaultValue, onValueChange, className, ...aria
}: SegmentedProps<T>) {
  const [inner, setInner] = React.useState<T>(defaultValue ?? options[0].value)
  const active = value ?? inner
  const track = React.useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = React.useState({ left: 3, width: 0 })

  const place = React.useCallback(() => {
    const el = track.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  useIsoLayoutEffect(place, [active, place])
  React.useEffect(() => {
    const ro = new ResizeObserver(place)
    if (track.current) ro.observe(track.current)
    document.fonts?.ready.then(place)
    return () => ro.disconnect()
  }, [place])

  return (
    <div
      ref={track}
      role="group"
      aria-label={aria["aria-label"]}
      className={cn("relative inline-flex gap-0.5 rounded-[11px] bg-bg p-[3px] shadow-inset-sm", className)}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[3px] top-[3px] rounded-lg bg-raise shadow-raised-sm transition-[left,width] duration-[450ms] ease-spring"
        style={{ left: thumb.left, width: thumb.width }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === active}
          onClick={() => { setInner(o.value); onValueChange?.(o.value) }}
          className={cn(
            "relative z-10 cursor-pointer rounded-lg px-2.5 py-[5px] font-mono text-xs transition-colors duration-200",
            o.value === active ? "text-ink" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
