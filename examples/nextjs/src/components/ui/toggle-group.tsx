"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleGroupItem {
  value: string
  label: React.ReactNode
  /** Accessible name when the label is only an icon. */
  "aria-label"?: string
  disabled?: boolean
}

interface Base {
  items: ToggleGroupItem[]
  size?: "sm" | "md"
  className?: string
  "aria-label"?: string
}
interface Single extends Base {
  type?: "single"
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}
interface Multiple extends Base {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}
export type ToggleGroupProps = Single | Multiple

/**
 * Keys in a recessed rail. Pressed keys sink and light up. `single` works like
 * a radio set that can be cleared, `multiple` like a row of toggles
 * (bold / italic / underline). Arrow keys move between keys.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const { items, size = "md", className } = props
  const multiple = props.type === "multiple"
  const [inner, setInner] = React.useState<string[]>(() => {
    const d = props.defaultValue
    return Array.isArray(d) ? d : d ? [d] : []
  })
  const controlled = props.value !== undefined
  const current: string[] = controlled
    ? Array.isArray(props.value) ? props.value : props.value ? [props.value] : []
    : inner
  const ref = React.useRef<HTMLDivElement>(null)

  const toggle = (v: string) => {
    let next: string[]
    if (multiple) next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
    else next = current.includes(v) ? [] : [v]
    setInner(next)
    if (multiple) (props as Multiple).onValueChange?.(next)
    else (props as Single).onValueChange?.(next[0] ?? null)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return
    const keys = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [])
    const i = keys.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    const n = e.key === "Home" ? 0 : e.key === "End" ? keys.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length
    keys[n]?.focus()
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={props["aria-label"]}
      onKeyDown={onKeyDown}
      className={cn("inline-flex max-w-full gap-1 overflow-x-auto rounded-[14px] bg-bg p-1 shadow-inset-sm scrollbar-none", className)}
    >
      {items.map((it) => {
        const on = current.includes(it.value)
        return (
          <button
            key={it.value}
            type="button"
            aria-pressed={on}
            aria-label={it["aria-label"]}
            disabled={it.disabled}
            onClick={() => toggle(it.value)}
            className={cn(
              "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium",
              "transition-[box-shadow,background-color,color,scale] duration-300 ease-spring active:scale-95",
              "disabled:pointer-events-none disabled:opacity-40",
              size === "sm" ? "h-7 min-w-7 rounded-lg px-2 text-xs [&_svg]:size-3.5" : "h-9 min-w-9 rounded-[10px] px-3 text-[13px] [&_svg]:size-4",
              on ? "bg-raise text-glow-ink shadow-raised-sm" : "text-muted hover:text-ink",
            )}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
