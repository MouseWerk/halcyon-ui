"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (date: Date) => void
  /** Earliest / latest selectable day. */
  min?: Date
  max?: Date
  /** Disable specific days. */
  isDisabled?: (date: Date) => boolean
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1
  locale?: string
  className?: string
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1)
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()))
}

/**
 * Month grid. Days are small keys; today has a glowing dot and the selected
 * day is a raised glowing key. Arrow keys, PageUp/PageDown (month) and
 * Home/End (week) move the focus like a native date picker.
 */
export function Calendar({ value, defaultValue = null, onValueChange, min, max, isDisabled, weekStartsOn = 1, locale, className }: CalendarProps) {
  const [inner, setInner] = React.useState<Date | null>(defaultValue)
  const selected = value !== undefined ? value : inner
  // Lazy init keeps SSR and the client in agreement for the first render.
  const [focus, setFocus] = React.useState<Date>(() => day(selected ?? new Date()))
  const [today, setToday] = React.useState<Date | null>(null)
  React.useEffect(() => setToday(day(new Date())), [])
  const grid = React.useRef<HTMLDivElement>(null)
  const keyboard = React.useRef(false)
  const [dir, setDir] = React.useState(0)

  const blocked = (d: Date) => (min && d < day(min)) || (max && d > day(max)) || !!isDisabled?.(d)

  const month = new Date(focus.getFullYear(), focus.getMonth(), 1)
  const offset = (month.getDay() - weekStartsOn + 7) % 7
  const start = addDays(month, -offset)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(start, i).toLocaleDateString(locale, { weekday: "narrow" }))
  const title = month.toLocaleDateString(locale, { month: "long", year: "numeric" })

  const move = (d: Date, viaKeyboard = true) => {
    keyboard.current = viaKeyboard
    if (d.getMonth() !== focus.getMonth() || d.getFullYear() !== focus.getFullYear()) setDir(d > focus ? 1 : -1)
    setFocus(d)
  }
  React.useEffect(() => {
    if (!keyboard.current) return
    grid.current?.querySelector<HTMLElement>('[data-focus="true"]')?.focus({ preventScroll: true })
  }, [focus])

  const choose = (d: Date) => {
    if (blocked(d)) return
    setInner(d)
    onValueChange?.(d)
    move(d, false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1), ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7), ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, e.shiftKey ? -12 : -1), PageDown: () => addMonths(focus, e.shiftKey ? 12 : 1),
      Home: () => addDays(focus, -((focus.getDay() - weekStartsOn + 7) % 7)),
      End: () => addDays(focus, 6 - ((focus.getDay() - weekStartsOn + 7) % 7)),
    }
    if (map[e.key]) { e.preventDefault(); move(map[e.key]()) }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(focus) }
  }

  const nav = (d: -1 | 1) => (
    <button
      type="button"
      aria-label={d < 0 ? "Previous month" : "Next month"}
      onClick={() => move(addMonths(focus, d), false)}
      className="grid size-8 cursor-pointer place-items-center rounded-[10px] bg-surface text-muted shadow-key transition-[scale,box-shadow,color] duration-200 ease-spring hover:text-ink active:scale-90 active:shadow-inset-sm"
    >
      <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d < 0 ? "M7.5 2.5 4 6l3.5 3.5" : "M4.5 2.5 8 6 4.5 9.5"} /></svg>
    </button>
  )

  return (
    <div className={cn("inline-flex w-[296px] max-w-full flex-col gap-3 rounded-hc bg-surface p-4 shadow-raised", className)}>
      <div className="flex items-center gap-2">
        {nav(-1)}
        <div aria-live="polite" className="flex-1 text-center text-sm font-semibold tracking-tight">{title}</div>
        {nav(1)}
      </div>
      <div role="group" aria-label={title} ref={grid} onKeyDown={onKeyDown} className="rounded-2xl bg-bg p-2 shadow-inset-sm">
        <div aria-hidden="true" className="mb-1 grid grid-cols-7">
          {weekdays.map((w, i) => <span key={i} className="py-1 text-center font-mono text-[10.5px] uppercase text-muted">{w}</span>)}
        </div>
        <div key={`${month.getFullYear()}-${month.getMonth()}`} className={cn("grid grid-cols-7 gap-0.5", dir !== 0 && "animate-hc-rise")}>
          {cells.map((d) => {
            const inMonth = d.getMonth() === month.getMonth()
            const sel = same(d, selected)
            const isToday = same(d, today)
            const off = blocked(d)
            const focused = same(d, focus)
            return (
              <button
                key={d.toISOString()}
                type="button"
                tabIndex={focused ? 0 : -1}
                data-focus={focused}
                aria-pressed={sel}
                aria-current={isToday ? "date" : undefined}
                aria-disabled={off || undefined}
                aria-label={d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                onClick={() => choose(d)}
                className={cn(
                  "relative grid aspect-square cursor-pointer place-items-center rounded-[10px] font-mono text-[12.5px] tabular-nums",
                  "transition-[box-shadow,background-color,color,scale] duration-200 ease-spring active:scale-90",
                  sel ? "bg-surface text-ink shadow-glow" : "hover:bg-raise/70 hover:shadow-raised-sm",
                  inMonth && !sel && "text-ink",
                  !inMonth && !sel && "text-muted",
                  off && "pointer-events-none text-muted/30 line-through",
                )}
              >
                {d.getDate()}
                {isToday && <span className={cn("absolute bottom-1 size-1 rounded-full", sel ? "bg-glow shadow-[0_0_4px_var(--hc-glow)]" : "bg-glow-ink")} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
