"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, useOpenState, usePresence, useScrollLock } from "@/lib/overlay"

type Side = "left" | "right" | "top" | "bottom"

export interface SheetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: Side
  title?: React.ReactNode
  description?: React.ReactNode
  /** Element that opens the sheet. */
  trigger?: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
}

const slide: Record<Side, [string, string]> = {
  right: ["inset-y-3 right-3 w-[min(420px,calc(100%-24px))]", "translate-x-[110%]"],
  left: ["inset-y-3 left-3 w-[min(420px,calc(100%-24px))]", "-translate-x-[110%]"],
  top: ["inset-x-3 top-3 max-h-[80vh]", "-translate-y-[110%]"],
  bottom: ["inset-x-3 bottom-3 max-h-[80vh]", "translate-y-[110%]"],
}

/** A floating side panel that springs in from an edge. */
export function Sheet({ open, defaultOpen, onOpenChange, side = "right", title, description, trigger, className, children, ...props }: SheetProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const { mounted, visible } = usePresence(o, 380)
  const panel = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  useScrollLock(mounted)
  useFocusTrap(o, panel)
  useDismiss(o, () => setO(false), [panel])

  return (
    <>
      {trigger && React.cloneElement(trigger, { onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setO(true) } })}
      {mounted && (
        <Portal>
          <div className="fixed inset-0 z-50">
            <div aria-hidden="true" className={cn("absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_72%,transparent)] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} />
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              tabIndex={-1}
              className={cn(
                "absolute flex flex-col overflow-y-auto rounded-[26px] bg-surface p-6 shadow-[0_30px_80px_-20px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)] outline-none",
                "transition-[translate] duration-[450ms] ease-spring",
                slide[side][0],
                visible ? "translate-x-0 translate-y-0" : slide[side][1],
                className,
              )}
              {...props}
            >
              <div className="mb-5 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {title && <h2 id={titleId} className="m-0 text-lg font-semibold tracking-tight">{title}</h2>}
                  {description && <p className="m-0 mt-1 text-[13.5px] text-muted">{description}</p>}
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setO(false)}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-[10px] bg-bg text-muted shadow-inset-sm transition-[color,scale] duration-200 ease-spring hover:text-ink active:scale-90"
                >
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="m2.5 2.5 7 7M9.5 2.5l-7 7" /></svg>
                </button>
              </div>
              {children}
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
