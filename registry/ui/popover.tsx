"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, panelClass, useAnchorPosition, useDismiss, useOpenState, usePresence, type Align, type Side } from "@/lib/overlay"

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** The element that toggles the popover. */
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<HTMLElement> }>
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (o: boolean) => void
  side?: Side
  align?: Align
  offset?: number
}

/** Floating raised panel anchored to its trigger. Scales out from the anchor side. */
export function Popover({ trigger, open, defaultOpen, onOpenChange, side = "bottom", align = "center", offset = 10, className, children, ...props }: PopoverProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const anchor = React.useRef<HTMLElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(o, 200)
  const pos = useAnchorPosition(mounted, anchor, panel, { side, align, offset })
  useDismiss(o, () => setO(false), [anchor, panel])

  return (
    <>
      <span ref={anchor as React.Ref<HTMLSpanElement>} className="inline-flex">
        {React.cloneElement(trigger, {
          onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setO(!o) },
          ...({ "aria-expanded": o, "aria-haspopup": "dialog" } as object),
        })}
      </span>
      {mounted && (
        <Portal>
          <div
            ref={panel}
            role="dialog"
            className={cn(panelClass, "fixed z-50 min-w-48 p-4", visible ? "scale-100 opacity-100" : "scale-90 opacity-0", className)}
            style={{ top: pos.top, left: pos.left, transformOrigin: pos.origin }}
            {...props}
          >
            {children}
          </div>
        </Portal>
      )}
    </>
  )
}
