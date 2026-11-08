"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useIsoLayoutEffect, usePresence } from "@/lib/overlay"
import { MenuList, type DropdownItem } from "@/components/ui/dropdown-menu"

export interface ContextMenuProps {
  items: DropdownItem[]
  /** The area that reacts to right-click, long-press, Shift+F10 or the Menu key. */
  children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>
  disabled?: boolean
  onOpenChange?: (open: boolean) => void
}

const LONG_PRESS = 500

/**
 * Right-click menu. Opens at the pointer (long-press on touch, Shift+F10 or the
 * Menu key on the keyboard) and stays inside the viewport.
 */
export function ContextMenu({ items, children, disabled, onOpenChange }: ContextMenuProps) {
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null)
  const open = at !== null
  const menu = React.useRef<HTMLDivElement>(null)
  const area = React.useRef<HTMLElement | null>(null)
  const press = React.useRef<{ t: ReturnType<typeof setTimeout>; x: number; y: number } | null>(null)
  const { mounted, visible } = usePresence(open, 160)
  const [pos, setPos] = React.useState({ left: -9999, top: -9999 })

  const set = (p: { x: number; y: number } | null) => { setAt(p); onOpenChange?.(p !== null) }
  const close = React.useCallback(() => { setAt(null); onOpenChange?.(false) }, [onOpenChange])
  useDismiss(open, close, [menu])

  // Clamp into the viewport once the menu has a size.
  useIsoLayoutEffect(() => {
    if (!mounted || !at || !menu.current) return
    const { offsetWidth: w, offsetHeight: h } = menu.current
    const pad = 8
    setPos({
      left: Math.min(at.x, window.innerWidth - w - pad),
      top: at.y + h > window.innerHeight - pad ? Math.max(pad, at.y - h) : at.y,
    })
  }, [mounted, at])

  // The menu is fixed where it opened, so scrolling is harmless; a resize can push it off-screen.
  React.useEffect(() => {
    if (!open) return
    window.addEventListener("resize", close)
    return () => window.removeEventListener("resize", close)
  }, [open, close])

  const child = children.props
  return (
    <>
      {React.cloneElement(children, {
        ref: (n: HTMLElement | null) => { area.current = n },
        onContextMenu: (e: React.MouseEvent<HTMLElement>) => {
          child.onContextMenu?.(e)
          if (disabled || e.defaultPrevented) return
          e.preventDefault()
          set({ x: e.clientX, y: e.clientY })
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
          child.onKeyDown?.(e)
          if (disabled) return
          if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
            e.preventDefault()
            const r = e.currentTarget.getBoundingClientRect()
            set({ x: r.left + 12, y: r.top + 12 })
          }
        },
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          child.onPointerDown?.(e)
          if (disabled || e.pointerType === "mouse") return
          const { clientX: x, clientY: y } = e
          press.current = { x, y, t: setTimeout(() => set({ x, y }), LONG_PRESS) }
        },
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
          child.onPointerMove?.(e)
          const p = press.current
          if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) { clearTimeout(p.t); press.current = null }
        },
        onPointerUp: (e: React.PointerEvent<HTMLElement>) => { child.onPointerUp?.(e); if (press.current) clearTimeout(press.current.t); press.current = null },
        onPointerCancel: (e: React.PointerEvent<HTMLElement>) => { child.onPointerCancel?.(e); if (press.current) clearTimeout(press.current.t); press.current = null },
        tabIndex: child.tabIndex ?? 0,
        "aria-haspopup": "menu",
        style: { WebkitTouchCallout: "none", ...child.style },
      } as React.HTMLAttributes<HTMLElement>)}
      {mounted && (
        <Portal>
          <MenuList
            ref={menu}
            items={items}
            onClose={() => { close(); area.current?.focus({ preventScroll: true }) }}
            className={cn("fixed z-50 origin-top-left", visible ? "scale-100 opacity-100" : "scale-95 opacity-0")}
            style={pos}
          />
        </Portal>
      )}
    </>
  )
}
