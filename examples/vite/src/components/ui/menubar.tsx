"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useAnchorPosition, useDismiss, usePresence } from "@/lib/overlay"
import { MenuList, type DropdownItem } from "@/components/ui/dropdown-menu"

export interface MenubarMenu {
  label: React.ReactNode
  items: DropdownItem[]
}

export interface MenubarProps {
  menus: MenubarMenu[]
  className?: string
  "aria-label"?: string
}

/**
 * Desktop-app style menu bar (File, Edit, View...). Once one menu is open,
 * hovering another switches to it; Left/Right move between menus.
 */
export function Menubar({ menus, className, ...aria }: MenubarProps) {
  const [open, setOpen] = React.useState<number | null>(null)
  const [shown, setShown] = React.useState(0)
  const bar = React.useRef<HTMLDivElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const anchors = React.useRef<(HTMLButtonElement | null)[]>([])
  const anchor = React.useMemo(() => ({ get current() { return anchors.current[shown] ?? null } }), [shown]) as React.RefObject<HTMLElement | null>
  const { mounted, visible } = usePresence(open !== null, 150)
  const pos = useAnchorPosition(mounted, anchor, panel, { side: "bottom", align: "start", offset: 6 })
  const close = React.useCallback(() => setOpen(null), [])
  useDismiss(open !== null, close, [bar, panel])

  React.useEffect(() => { if (open !== null) setShown(open) }, [open])

  const go = (i: number, focusMenu = true) => {
    const n = (i + menus.length) % menus.length
    setOpen(n)
    if (!focusMenu) anchors.current[n]?.focus()
  }

  return (
    <>
      <div
        ref={bar}
        role="menubar"
        aria-label={aria["aria-label"]}
        className={cn("inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[14px] bg-bg p-1 shadow-inset-sm scrollbar-none", className)}
        onKeyDown={(e) => {
          if (open !== null) return
          const i = anchors.current.indexOf(document.activeElement as HTMLButtonElement)
          if (i < 0) return
          if (e.key === "ArrowRight") { e.preventDefault(); anchors.current[(i + 1) % menus.length]?.focus() }
          else if (e.key === "ArrowLeft") { e.preventDefault(); anchors.current[(i - 1 + menus.length) % menus.length]?.focus() }
          else if (e.key === "ArrowDown") { e.preventDefault(); go(i) }
        }}
      >
        {menus.map((m, i) => (
          <button
            key={i}
            ref={(n) => { anchors.current[i] = n }}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === i}
            tabIndex={i === 0 ? 0 : -1}
            onClick={() => (open === i ? close() : go(i))}
            onPointerEnter={() => { if (open !== null && open !== i) go(i) }}
            className={cn(
              "shrink-0 cursor-pointer rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-[background-color,box-shadow,color] duration-200",
              open === i ? "bg-raise text-ink shadow-raised-sm" : "text-muted hover:text-ink",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mounted && (
        <Portal>
          <MenuList
            key={shown}
            ref={panel}
            items={menus[shown].items}
            onClose={() => { close(); anchors.current[shown]?.focus() }}
            onNavigate={(d) => go(shown + d)}
            className={cn("fixed z-50", visible ? "scale-100 opacity-100" : "scale-95 opacity-0")}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          />
        </Portal>
      )}
    </>
  )
}
