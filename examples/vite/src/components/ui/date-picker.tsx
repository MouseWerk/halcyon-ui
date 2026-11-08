"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useAnchorPosition, useDismiss, usePresence } from "@/lib/overlay"
import { Calendar, type DateRange } from "@/components/ui/calendar"

interface Common {
  placeholder?: string
  min?: Date
  max?: Date
  isDisabled?: (d: Date) => boolean
  locale?: string
  /** Intl options for the trigger label. */
  format?: Intl.DateTimeFormatOptions
  disabled?: boolean
  className?: string
  id?: string
  "aria-label"?: string
}
interface Single extends Common {
  mode?: "single"
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (d: Date) => void
}
interface Range extends Common {
  mode: "range"
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (r: DateRange) => void
}
export type DatePickerProps = Single | Range

/** Raised trigger that opens the Calendar in a floating panel. Single day or a range. */
export function DatePicker(props: DatePickerProps) {
  const { placeholder = props.mode === "range" ? "Pick a range" : "Pick a date", min, max, isDisabled, locale, format = { day: "numeric", month: "short", year: "numeric" }, disabled, className, id } = props
  const [open, setOpen] = React.useState(false)
  const [single, setSingle] = React.useState<Date | null>(props.mode !== "range" ? props.defaultValue ?? null : null)
  const [range, setRange] = React.useState<DateRange>(props.mode === "range" ? props.defaultValue ?? { from: null, to: null } : { from: null, to: null })
  const trigger = React.useRef<HTMLButtonElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(open, 180)
  const pos = useAnchorPosition(mounted, trigger, panel, { side: "bottom", align: "start", offset: 8 })
  useDismiss(open, () => setOpen(false), [trigger, panel])

  const fmt = (d: Date) => d.toLocaleDateString(locale, format)
  let label: string | null = null
  if (props.mode === "range") {
    const r = props.value ?? range
    if (r.from) label = r.to ? `${fmt(r.from)} – ${fmt(r.to)}` : `${fmt(r.from)} – …`
  } else {
    const v = props.value !== undefined ? props.value : single
    if (v) label = fmt(v)
  }

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={props["aria-label"] ? `${props["aria-label"]}: ${label ?? placeholder}` : undefined}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 min-w-52 cursor-pointer items-center gap-2.5 rounded-xl bg-surface px-3.5 text-left text-[13.5px] shadow-key",
          "transition-[box-shadow,scale] duration-200 ease-spring active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
          open && "shadow-glow",
          className,
        )}
      >
        <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", open ? "text-glow-ink" : "text-muted")} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>
        <span className={cn("flex-1 truncate font-mono text-[12.5px]", !label && "font-sans text-[13.5px] text-muted")}>{label ?? placeholder}</span>
      </button>
      {mounted && (
        <Portal>
          <div
            ref={panel}
            role="dialog"
            aria-label="Choose date"
            className={cn("fixed z-50 transition-[opacity,scale] duration-200 ease-spring", visible ? "scale-100 opacity-100" : "scale-95 opacity-0")}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          >
            {props.mode === "range" ? (
              <Calendar
                mode="range"
                range={props.value ?? range}
                onRangeChange={(r) => { setRange(r); props.onValueChange?.(r); if (r.from && r.to) { setOpen(false); trigger.current?.focus() } }}
                min={min} max={max} isDisabled={isDisabled} locale={locale}
              />
            ) : (
              <Calendar
                value={props.value !== undefined ? props.value : single}
                onValueChange={(d) => { setSingle(d); props.onValueChange?.(d); setOpen(false); trigger.current?.focus() }}
                min={min} max={max} isDisabled={isDisabled} locale={locale}
              />
            )}
          </div>
        </Portal>
      )}
    </>
  )
}
