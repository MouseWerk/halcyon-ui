"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean | "indeterminate"
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Optional label rendered next to the box. */
  label?: React.ReactNode
}

/** Recessed box that pops a glowing key into place when checked. */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, defaultChecked = false, onCheckedChange, label, className, onClick, id, ...props }, ref) => {
    const [inner, setInner] = React.useState(defaultChecked)
    const state = checked ?? inner
    const on = state === true
    const mixed = state === "indeterminate"
    const autoId = React.useId()
    const boxId = id ?? autoId

    const box = (
      <button
        ref={ref}
        id={boxId}
        type="button"
        role="checkbox"
        aria-checked={mixed ? "mixed" : on}
        data-state={mixed ? "indeterminate" : on ? "checked" : "unchecked"}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented) return
          setInner(!on)
          onCheckedChange?.(!on)
        }}
        className={cn("group relative grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] bg-bg shadow-inset-sm ring-1 ring-inset ring-line", !label && className)}
        {...props}
      >
        <span
          className={cn(
            "absolute inset-[2px] grid place-items-center rounded-[5px] bg-linear-to-br from-raise to-surface text-glow-ink",
            "transition-[scale,opacity,box-shadow] duration-300 ease-spring group-active:scale-90",
            on || mixed
              ? "scale-100 opacity-100 shadow-[0_0_0_1px_var(--hc-glow-soft),0_0_10px_var(--hc-glow-soft),0_2px_4px_var(--hc-sh-dark)]"
              : "scale-50 opacity-0",
          )}
        >
          {mixed ? (
            <span className="h-[2px] w-2.5 rounded-full bg-current" />
          ) : (
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} className={cn("transition-[stroke-dashoffset] duration-300 [stroke-dasharray:1]", on ? "[stroke-dashoffset:0] delay-75" : "[stroke-dashoffset:1]")} />
            </svg>
          )}
        </span>
      </button>
    )

    if (!label) return box
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {box}
        <label htmlFor={boxId} className="cursor-pointer select-none text-[13.5px]">{label}</label>
      </div>
    )
  },
)
Checkbox.displayName = "Checkbox"
