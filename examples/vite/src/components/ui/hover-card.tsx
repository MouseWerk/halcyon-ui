"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, usePresence, type Align, type Side } from "@/lib/overlay"

export interface HoverCardProps {
  /** The element that shows the card on hover or keyboard focus. */
  children: React.ReactElement
  content: React.ReactNode
  side?: Side
  align?: Align
  openDelay?: number
  closeDelay?: number
  className?: string
}

/**
 * Rich preview that appears when hovering a link or name (for sighted mouse
 * and keyboard users). Stays open while the pointer is over the card.
 */
export function HoverCard({ children, content, side = "bottom", align = "center", openDelay = 500, closeDelay = 200, className }: HoverCardProps) {
  const [open, setOpen] = React.useState(false)
  const anchor = React.useRef<HTMLSpanElement>(null)
  const card = React.useRef<HTMLDivElement>(null)
  const t = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const { mounted, visible } = usePresence(open, 160)
  const pos = useAnchorPosition(mounted, anchor, card, { side, align, offset: 10 })
  const id = React.useId()

  const show = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), openDelay) }
  const hide = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), closeDelay) }
  React.useEffect(() => () => clearTimeout(t.current), [])

  return (
    <>
      <span
        ref={anchor}
        className="inline-flex"
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => { if (e.key === "Escape") { clearTimeout(t.current); setOpen(false) } }}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </span>
      {mounted && (
        <Portal>
          <div
            ref={card}
            id={id}
            role="tooltip"
            onPointerEnter={() => clearTimeout(t.current)}
            onPointerLeave={hide}
            className={cn(panelClass, "fixed z-50 w-72 p-4", visible ? "scale-100 opacity-100" : "scale-95 opacity-0", className)}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  )
}
