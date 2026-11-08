"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, useDismiss, usePresence } from "@/lib/overlay"

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  emptyText?: React.ReactNode
  className?: string
  disabled?: boolean
  id?: string
  "aria-label"?: string
}

/**
 * Searchable select. Type into the recessed field to filter, matches are
 * highlighted, arrows move, Enter picks, Escape restores the last value.
 */
export function Combobox({
  options, value, defaultValue = null, onValueChange, placeholder = "Search", emptyText = "No matches", className, disabled, id, ...aria
}: ComboboxProps) {
  const [inner, setInner] = React.useState<string | null>(defaultValue)
  const v = value !== undefined ? value : inner
  const current = options.find((o) => o.value === v)
  const [query, setQuery] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const field = React.useRef<HTMLDivElement>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const list = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()
  const { mounted, visible } = usePresence(open, 180)
  const pos = useAnchorPosition(mounted, field, list, { side: "bottom", align: "start", offset: 8, matchWidth: true })

  const close = React.useCallback(() => { setOpen(false); setQuery(null) }, [])
  useDismiss(open, close, [field, list])

  const q = (query ?? "").trim().toLowerCase()
  const results = q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)) : options

  React.useEffect(() => { setActive(Math.max(0, results.findIndex((o) => !o.disabled))) }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const choose = (o?: ComboboxOption) => {
    if (!o || o.disabled) return
    setInner(o.value)
    onValueChange?.(o.value)
    close()
  }
  const move = (d: number) => {
    if (!results.length) return
    let i = active
    for (let k = 0; k < results.length; k++) {
      i = (i + d + results.length) % results.length
      if (!results[i].disabled) break
    }
    setActive(i)
  }

  const mark = (label: string) => {
    if (!q) return label
    const i = label.toLowerCase().indexOf(q)
    if (i < 0) return label
    return <>{label.slice(0, i)}<mark className="rounded-[3px] bg-glow-soft px-px text-ink">{label.slice(i, i + q.length)}</mark>{label.slice(i + q.length)}</>
  }

  return (
    <>
      <div
        ref={field}
        className={cn(
          "flex h-10 min-w-52 items-center gap-2 rounded-xl bg-bg px-3 shadow-inset-sm transition-[box-shadow] duration-300",
          open && "shadow-[inset_2px_2px_5px_var(--hc-sh-dark),inset_-2px_-2px_5px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        onClick={() => input.current?.focus()}
      >
        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          aria-label={aria["aria-label"]}
          disabled={disabled}
          placeholder={current?.label ?? placeholder}
          value={query ?? current?.label ?? ""}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); if (!open) setOpen(true); else move(1) }
            else if (e.key === "ArrowUp") { e.preventDefault(); move(-1) }
            else if (e.key === "Enter" && open) { e.preventDefault(); choose(results[active]) }
            else if (e.key === "Tab") close()
          }}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted sm:text-[13.5px]"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Close" : "Open"}
          onClick={(e) => { e.stopPropagation(); if (open) close(); else { setOpen(true); input.current?.focus() } }}
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted hover:text-ink"
        >
          <svg viewBox="0 0 12 12" className={cn("size-3 transition-transform duration-300 ease-spring", open && "rotate-180 text-glow-ink")} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 4.5 3 3 3-3" /></svg>
        </button>
      </div>
      {mounted && (
        <Portal>
          <div
            ref={list}
            id={listId}
            role="listbox"
            className={cn(panelClass, "fixed z-50 max-h-72 overflow-y-auto", visible ? "scale-100 opacity-100" : "scale-95 opacity-0")}
            style={{ top: pos.top, left: pos.left, width: pos.width, transformOrigin: pos.origin }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {results.length === 0 && <div className="px-3 py-6 text-center text-[13px] text-muted">{emptyText}</div>}
            {results.map((o, i) => {
              const sel = o.value === v
              return (
                <div
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  data-index={i}
                  aria-selected={sel}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] transition-colors duration-150",
                    i === active && "bg-bg shadow-inset-sm",
                    o.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className={cn("size-1.5 shrink-0 rounded-full", sel ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "bg-dot-off")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{mark(o.label)}</span>
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
