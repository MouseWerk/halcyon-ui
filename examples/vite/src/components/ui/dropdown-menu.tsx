"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, useDismiss, usePresence, type Align } from "@/lib/overlay"

export type DropdownItem =
  | { type?: "item"; label: React.ReactNode; icon?: React.ReactNode; shortcut?: string; onSelect?: () => void; disabled?: boolean; danger?: boolean }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode }
  | { type: "checkbox"; label: React.ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void }

export interface DropdownMenuProps {
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
  items: DropdownItem[]
  align?: Align
  className?: string
}

/** Menu in a floating panel. Arrow keys move a recessed highlight; Enter selects. */
export function DropdownMenu({ trigger, items, align = "start", className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(-1)
  const anchor = React.useRef<HTMLSpanElement>(null)
  const menu = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(open, 180)
  const pos = useAnchorPosition(mounted, anchor, menu, { side: "bottom", align, offset: 8 })
  useDismiss(open, () => setOpen(false), [anchor, menu])

  const selectable = items.map((it, i) => (it.type === "separator" || it.type === "label" || ("disabled" in it && it.disabled) ? -1 : i)).filter((i) => i >= 0)

  const wasOpen = React.useRef(false)
  React.useEffect(() => {
    if (open) {
      wasOpen.current = true
      setActive(selectable[0] ?? -1)
      const r = requestAnimationFrame(() => menu.current?.focus({ preventScroll: true }))
      return () => cancelAnimationFrame(r)
    }
    // Give focus back to the trigger, unless the user already moved it elsewhere.
    if (wasOpen.current) {
      wasOpen.current = false
      const a = document.activeElement
      if (!a || a === document.body || menu.current?.contains(a)) anchor.current?.querySelector<HTMLElement>("button,[tabindex],a")?.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const run = (i: number) => {
    const it = items[i]
    if (!it) return
    if (it.type === "checkbox") { it.onCheckedChange(!it.checked); return }
    if (it.type === undefined || it.type === "item") { it.onSelect?.(); setOpen(false) }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = selectable.indexOf(active)
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(selectable[(k + 1) % selectable.length]) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(selectable[(k - 1 + selectable.length) % selectable.length]) }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); run(active) }
    else if (e.key === "Tab") setOpen(false)
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Single-key shortcuts work while the menu is open (e.g. shortcut "D").
      const i = items.findIndex((it) => (it.type === undefined || it.type === "item") && !it.disabled && it.shortcut?.toLowerCase() === e.key.toLowerCase())
      if (i >= 0) { e.preventDefault(); run(i) }
    }
  }

  return (
    <>
      <span ref={anchor} className="inline-flex">
        {React.cloneElement(trigger, {
          onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setOpen(!open) },
          ...({ "aria-haspopup": "menu", "aria-expanded": open } as object),
        })}
      </span>
      {mounted && (
        <Portal>
          <div
            ref={menu}
            role="menu"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={cn(panelClass, "fixed z-50 min-w-52 outline-none", visible ? "scale-100 opacity-100" : "scale-95 opacity-0", className)}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          >
            {items.map((it, i) => {
              if (it.type === "separator") return <div key={i} role="separator" className="mx-2 my-1.5 h-px bg-line" />
              if (it.type === "label") return <div key={i} className="px-2.5 pb-1 pt-2 pl-[38px] font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{it.label}</div>
              const isCheck = it.type === "checkbox"
              const disabled = !isCheck && it.disabled
              return (
                <div
                  key={i}
                  role={isCheck ? "menuitemcheckbox" : "menuitem"}
                  aria-checked={isCheck ? it.checked : undefined}
                  aria-disabled={disabled || undefined}
                  onPointerEnter={() => !disabled && setActive(i)}
                  onClick={() => !disabled && run(i)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] transition-colors duration-150 [&_svg]:size-4 [&_svg]:text-muted",
                    active === i && "bg-bg shadow-inset-sm",
                    !isCheck && it.danger && "text-bad [&_svg]:text-bad",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {/* fixed icon slot so every label lines up */}
                  <span className="grid size-4 shrink-0 place-items-center">
                    {isCheck ? (
                      <span className={cn("size-1.5 rounded-full transition-[background-color,box-shadow]", it.checked ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "bg-dot-off")} />
                    ) : it.icon}
                  </span>
                  <span className="flex-1">{it.label}</span>
                  {!isCheck && it.shortcut && <kbd className="rounded-md bg-bg px-1.5 font-mono text-[10.5px] text-muted shadow-inset-sm">{it.shortcut}</kbd>}
                </div>
              )
            })}
          </div>
        </Portal>
      )}
    </>
  )
}
