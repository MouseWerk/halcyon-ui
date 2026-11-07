"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Ctx = { value: string | undefined; select: (v: string) => void; name: string }
const RadioCtx = React.createContext<Ctx | null>(null)

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "vertical" | "horizontal"
}

/** Radio group with arrow-key navigation. */
export function RadioGroup({ value, defaultValue, onValueChange, orientation = "vertical", className, children, ...props }: RadioGroupProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value ?? inner
  const name = React.useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const select = React.useCallback((v: string) => { setInner(v); onValueChange?.(v) }, [onValueChange])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys = orientation === "vertical" ? ["ArrowDown", "ArrowUp"] : ["ArrowRight", "ArrowLeft"]
    if (!keys.includes(e.key)) return
    e.preventDefault()
    const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])') ?? [])
    const i = items.findIndex((n) => n === document.activeElement)
    const next = items[(i + (e.key === keys[0] ? 1 : -1) + items.length) % items.length]
    next?.focus()
    next?.click()
  }

  return (
    <RadioCtx.Provider value={{ value: current, select, name }}>
      <div
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        onKeyDown={onKeyDown}
        className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap", className)}
        {...props}
      >
        {children}
      </div>
    </RadioCtx.Provider>
  )
}

export interface RadioItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string
  label?: React.ReactNode
  description?: React.ReactNode
}

/** A recessed well; the selected one gets a glowing bead that springs in. */
export function RadioItem({ value, label, description, className, disabled, ...props }: RadioItemProps) {
  const ctx = React.useContext(RadioCtx)
  if (!ctx) throw new Error("RadioItem must be used inside RadioGroup")
  const on = ctx.value === value
  const id = React.useId()
  return (
    <div className={cn("flex items-start gap-2.5", disabled && "opacity-50", className)}>
      <button
        id={id}
        type="button"
        role="radio"
        aria-checked={on}
        disabled={disabled}
        tabIndex={on || ctx.value === undefined ? 0 : -1}
        onClick={() => ctx.select(value)}
        className="group relative mt-px grid size-[22px] shrink-0 cursor-pointer place-items-center rounded-full bg-bg shadow-inset-sm ring-1 ring-inset ring-line"
        {...props}
      >
        <span
          className={cn(
            "size-2.5 rounded-full bg-glow transition-[scale,opacity,box-shadow] duration-300 ease-spring",
            on ? "scale-100 opacity-100 shadow-[0_0_6px_var(--hc-glow),0_0_14px_var(--hc-glow-soft)]" : "scale-0 opacity-0",
          )}
        />
      </button>
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer select-none">
          {label && <span className="block text-[13.5px]">{label}</span>}
          {description && <span className="block text-xs text-muted">{description}</span>}
        </label>
      )}
    </div>
  )
}
