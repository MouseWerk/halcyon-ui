"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useAnchorPosition, usePresence, type Side } from "@/lib/overlay"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: Side
  /** Delay before showing, in ms. */
  delay?: number
  className?: string
}

/** Small raised label that pops from the anchor on hover or keyboard focus. */
export function Tooltip({ content, children, side = "top", delay = 350, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const anchor = React.useRef<HTMLSpanElement>(null)
  const tip = React.useRef<HTMLDivElement>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const { mounted, visible } = usePresence(open, 150)
  const pos = useAnchorPosition(mounted, anchor, tip, { side, offset: 8 })
  const id = React.useId()

  const show = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), delay) }
  const hide = () => { clearTimeout(timer.current); setOpen(false) }
  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <>
      <span
        ref={anchor}
        className="inline-flex"
        onPointerEnter={show}
        onPointerLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === "Escape" && hide()}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </span>
      {mounted && (
        <Portal>
          <div
            ref={tip}
            id={id}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-[60] max-w-64 rounded-[10px] bg-raise px-2.5 py-1.5 text-xs text-ink",
              "shadow-[0_8px_20px_-4px_var(--hc-sh-dark),0_0_0_1px_var(--hc-line),inset_0_1px_0_var(--hc-sh-light)]",
              "transition-[opacity,scale] duration-150 ease-spring",
              visible ? "scale-100 opacity-100" : "scale-90 opacity-0",
              className,
            )}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  )
}
