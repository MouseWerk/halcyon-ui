"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, useDismiss, usePresence } from "@/lib/overlay"

export interface SelectOption {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

/** Raised trigger with a floating listbox. Full keyboard support, typeahead included. */
export function Select({ options, value, defaultValue, onValueChange, placeholder = "Select", className, disabled, id, ...aria }: SelectProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const list = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(open, 180)
  const pos = useAnchorPosition(mounted, trigger, list, { side: "bottom", align: "start", offset: 8, matchWidth: true })
  const listId = React.useId()
  const typed = React.useRef({ s: "", t: 0 })
  useDismiss(open, () => setOpen(false), [trigger, list])

  const current = options.find((o) => o.value === v)
  const choose = (o: SelectOption) => {
    if (o.disabled) return
    setInner(o.value)
    onValueChange?.(o.value)
    setOpen(false)
    trigger.current?.focus()
  }
  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === v)))
    setOpen(true)
  }
  const move = (d: number) => {
    let i = active
    for (let k = 0; k < options.length; k++) {
      i = (i + d + options.length) % options.length
      if (!options[i].disabled) break
    }
    setActive(i)
  }

  React.useEffect(() => {
    if (!open) return
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); return }
    if (!open) return
    if (e.key === "ArrowDown") { e.preventDefault(); move(1) }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1) }
    else if (e.key === "Home") { e.preventDefault(); setActive(0) }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(options[active]) }
    else if (e.key === "Tab") setOpen(false)
    else if (e.key.length === 1) {
      const now = Date.now()
      typed.current = { s: (now - typed.current.t > 600 ? "" : typed.current.s) + e.key.toLowerCase(), t: now }
      const i = options.findIndex((o) => String(typeof o.label === "string" ? o.label : o.value).toLowerCase().startsWith(typed.current.s))
      if (i >= 0) setActive(i)
    }
  }

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={aria["aria-label"]}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-10 min-w-44 cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface px-3.5 text-[13.5px] shadow-key",
          "transition-[box-shadow,scale] duration-200 ease-spring active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
          open && "shadow-glow",
          className,
        )}
      >
        <span className={cn("truncate", !current && "text-muted")}>{current?.label ?? placeholder}</span>
        <svg viewBox="0 0 12 12" className={cn("size-3 shrink-0 text-muted transition-transform duration-300 ease-spring", open && "rotate-180 text-glow-ink")} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 4.5 3 3 3-3" /></svg>
      </button>
      {mounted && (
        <Portal>
          <div
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={cn(panelClass, "fixed z-50 max-h-72 overflow-y-auto", visible ? "scale-100 opacity-100" : "scale-95 opacity-0")}
            style={{ top: pos.top, left: pos.left, width: pos.width, transformOrigin: pos.origin }}
          >
            {options.map((o, i) => {
              const sel = o.value === v
              return (
                <div
                  key={o.value}
                  role="option"
                  data-index={i}
                  aria-selected={sel}
                  aria-disabled={o.disabled}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] transition-colors duration-150",
                    i === active && "bg-bg shadow-inset-sm",
                    o.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className={cn("size-1.5 shrink-0 rounded-full transition-[background-color,box-shadow]", sel ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "bg-dot-off")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.description && <span className="block truncate text-xs text-muted">{o.description}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </Portal>
      )}
    </>
  )
}
