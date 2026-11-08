"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, useDismiss, usePresence, type Align } from "@/lib/overlay"

export type DropdownItem =
  | { type?: "item"; label: React.ReactNode; icon?: React.ReactNode; shortcut?: string; onSelect?: () => void; disabled?: boolean; danger?: boolean }
  | { type: "separator" }
  | { type: "label"; label: React.ReactNode }
  | { type: "checkbox"; label: React.ReactNode; checked: boolean; onCheckedChange: (v: boolean) => void }
  | { type: "radio"; label: React.ReactNode; checked: boolean; onSelect: () => void }

export interface MenuListProps {
  items: DropdownItem[]
  /** Called after an item runs (not for checkboxes, which keep the menu open). */
  onClose: () => void
  /** ArrowLeft / ArrowRight, used by Menubar to move between menus. */
  onNavigate?: (dir: -1 | 1) => void
  className?: string
  style?: React.CSSProperties
  "aria-label"?: string
}

const isSelectable = (it: DropdownItem) => it.type !== "separator" && it.type !== "label" && !("disabled" in it && it.disabled)

/**
 * The menu surface shared by DropdownMenu, ContextMenu and Menubar. Arrow keys
 * move a recessed highlight, Enter/Space selects, letters jump to shortcuts.
 * Focuses itself on mount.
 */
export const MenuList = React.forwardRef<HTMLDivElement, MenuListProps>(
  ({ items, onClose, onNavigate, className, style, ...aria }, fwd) => {
    const ref = React.useRef<HTMLDivElement>(null)
    React.useImperativeHandle(fwd, () => ref.current!)
    const selectable = items.map((it, i) => (isSelectable(it) ? i : -1)).filter((i) => i >= 0)
    const [active, setActive] = React.useState(selectable[0] ?? -1)

    React.useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])

    const run = (i: number) => {
      const it = items[i]
      if (!it || !isSelectable(it)) return
      if (it.type === "checkbox") { it.onCheckedChange(!it.checked); return }
      if (it.type === "radio") { it.onSelect(); return }
      if (it.type === undefined || it.type === "item") { it.onSelect?.(); onClose() }
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      const k = selectable.indexOf(active)
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(selectable[(k + 1) % selectable.length]) }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(selectable[(k - 1 + selectable.length) % selectable.length]) }
      else if (e.key === "Home") { e.preventDefault(); setActive(selectable[0]) }
      else if (e.key === "End") { e.preventDefault(); setActive(selectable[selectable.length - 1]) }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); run(active) }
      else if (e.key === "ArrowRight" && onNavigate) { e.preventDefault(); onNavigate(1) }
      else if (e.key === "ArrowLeft" && onNavigate) { e.preventDefault(); onNavigate(-1) }
      else if (e.key === "Tab") onClose()
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Single-key shortcuts work while the menu is open (e.g. shortcut "D").
        const i = items.findIndex((it) => (it.type === undefined || it.type === "item") && !it.disabled && it.shortcut?.toLowerCase() === e.key.toLowerCase())
        if (i >= 0) { e.preventDefault(); run(i) }
      }
    }

    return (
      <div
        ref={ref}
        role="menu"
        tabIndex={-1}
        aria-label={aria["aria-label"]}
        onKeyDown={onKeyDown}
        className={cn(panelClass, "min-w-52 outline-none", className)}
        style={style}
      >
        {items.map((it, i) => {
          if (it.type === "separator") return <div key={i} role="separator" className="mx-2 my-1.5 h-px bg-line" />
          if (it.type === "label") return <div key={i} className="px-2.5 pb-1 pt-2 pl-[38px] font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{it.label}</div>
          const isCheck = it.type === "checkbox" || it.type === "radio"
          const disabled = !isCheck && it.disabled
          return (
            <div
              key={i}
              role={it.type === "checkbox" ? "menuitemcheckbox" : it.type === "radio" ? "menuitemradio" : "menuitem"}
              aria-checked={isCheck ? it.checked : undefined}
              aria-disabled={disabled || undefined}
              data-active={active === i || undefined}
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
                  <span className={cn(
                    "transition-[background-color,box-shadow]",
                    it.type === "radio" ? "size-2 rounded-full" : "size-1.5 rounded-full",
                    it.checked ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : it.type === "radio" ? "bg-bg shadow-inset-sm" : "bg-dot-off",
                  )} />
                ) : it.icon}
              </span>
              <span className="flex-1">{it.label}</span>
              {!isCheck && it.shortcut && <kbd className="rounded-md bg-bg px-1.5 font-mono text-[10.5px] text-muted shadow-inset-sm">{it.shortcut}</kbd>}
            </div>
          )
        })}
      </div>
    )
  },
)
MenuList.displayName = "MenuList"

export interface DropdownMenuProps {
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
  items: DropdownItem[]
  align?: Align
  className?: string
}

/** Menu in a floating panel. Arrow keys move a recessed highlight; Enter selects. */
export function DropdownMenu({ trigger, items, align = "start", className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const anchor = React.useRef<HTMLSpanElement>(null)
  const menu = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(open, 180)
  const pos = useAnchorPosition(mounted, anchor, menu, { side: "bottom", align, offset: 8 })
  useDismiss(open, () => setOpen(false), [anchor, menu])

  // Give focus back to the trigger on close, unless the user already moved it elsewhere.
  const wasOpen = React.useRef(false)
  React.useEffect(() => {
    if (open) { wasOpen.current = true; return }
    if (!wasOpen.current) return
    wasOpen.current = false
    const a = document.activeElement
    if (!a || a === document.body || menu.current?.contains(a)) anchor.current?.querySelector<HTMLElement>("button,[tabindex],a")?.focus({ preventScroll: true })
  }, [open])

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
          <MenuList
            ref={menu}
            items={items}
            onClose={() => setOpen(false)}
            className={cn("fixed z-50", visible ? "scale-100 opacity-100" : "scale-95 opacity-0", className)}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          />
        </Portal>
      )}
    </>
  )
}
