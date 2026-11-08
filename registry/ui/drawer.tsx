"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, useOpenState, usePresence, useScrollLock } from "@/lib/overlay"

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
  title?: React.ReactNode
  description?: React.ReactNode
  /** Footer row, e.g. buttons. Stays visible while the body scrolls. */
  footer?: React.ReactNode
}

/**
 * Bottom drawer for phones (works on desktop too). Drag the handle or the
 * panel down to dismiss; it follows your finger and springs back if you let go early.
 */
export function Drawer({ open, defaultOpen, onOpenChange, trigger, title, description, footer, className, children, ...props }: DrawerProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const { mounted, visible } = usePresence(o, 420)
  const panel = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const [dy, setDy] = React.useState(0)
  const drag = React.useRef<{ y: number; t: number } | null>(null)
  useScrollLock(mounted)
  useFocusTrap(o, panel)
  useDismiss(o, () => setO(false), [panel])

  const end = (y: number) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dist = y - d.y
    const v = dist / Math.max(1, performance.now() - d.t)
    const h = panel.current?.offsetHeight ?? 400
    if (dist > h * 0.3 || v > 0.6) setO(false)
    setDy(0)
  }

  return (
    <>
      {trigger && React.cloneElement(trigger, { onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setO(true) } })}
      {mounted && (
        <Portal>
          <div className="fixed inset-0 z-50">
            <div aria-hidden="true" className={cn("absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_50%,transparent)] backdrop-blur-[4px] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} />
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              className={cn(
                "absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-xl flex-col rounded-t-[28px] bg-surface outline-none",
                "pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_-20px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)]",
                !drag.current && "transition-[translate] duration-[420ms] ease-spring",
                className,
              )}
              style={{ translate: visible ? `0 ${dy}px` : "0 105%" }}
              onPointerDown={(e) => {
                // drag from the handle area, or anywhere when the body is scrolled to the top
                const body = (e.target as HTMLElement).closest("[data-drawer-body]") as HTMLElement | null
                if (body && body.scrollTop > 0) return
                if ((e.target as HTMLElement).closest("button,a,input,textarea,select,[role=slider]")) return
                drag.current = { y: e.clientY, t: performance.now() }
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => { if (drag.current) setDy(Math.max(0, e.clientY - drag.current.y)) }}
              onPointerUp={(e) => end(e.clientY)}
              onPointerCancel={() => { drag.current = null; setDy(0) }}
              {...props}
            >
              <div className="flex cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing">
                <span className="h-1.5 w-11 rounded-full bg-bg shadow-inset-sm" />
              </div>
              {(title || description) && (
                <div className="touch-none px-6 pb-3 text-center">
                  {title && <h2 id={titleId} className="m-0 text-lg font-semibold tracking-tight">{title}</h2>}
                  {description && <p className="m-0 mt-1 text-[13.5px] text-muted">{description}</p>}
                </div>
              )}
              <div data-drawer-body className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">{children}</div>
              {footer && <div className="flex flex-col gap-2.5 px-6 pb-5 pt-2 sm:flex-row sm:justify-end">{footer}</div>}
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
