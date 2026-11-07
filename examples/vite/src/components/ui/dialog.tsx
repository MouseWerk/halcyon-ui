"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, useOpenState, usePresence, useScrollLock } from "@/lib/overlay"

type Ctx = { open: boolean; setOpen: (o: boolean) => void; titleId: string; descId: string }
const DialogCtx = React.createContext<Ctx | null>(null)
const useDialog = () => {
  const c = React.useContext(DialogCtx)
  if (!c) throw new Error("Dialog parts must be used inside <Dialog>")
  return c
}

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const titleId = React.useId()
  const descId = React.useId()
  return <DialogCtx.Provider value={{ open: o, setOpen: setO, titleId, descId }}>{children}</DialogCtx.Provider>
}

/** Wraps a single element and makes it open the dialog. */
export function DialogTrigger({ children }: { children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }> }) {
  const { setOpen } = useDialog()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => { children.props.onClick?.(e); setOpen(true) },
  })
}

export function DialogClose({ children }: { children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }> }) {
  const { setOpen } = useDialog()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => { children.props.onClick?.(e); setOpen(false) },
  })
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Close when the backdrop is clicked. */
  dismissible?: boolean
  /** Show the close key in the corner. */
  showClose?: boolean
}

/**
 * Modal panel. The page dims and blurs, the panel rises out of it with a
 * spring and sinks back on close. Focus is trapped while open.
 */
export function DialogContent({ dismissible = true, showClose = true, className, children, ...props }: DialogContentProps) {
  const { open, setOpen, titleId, descId } = useDialog()
  const { mounted, visible } = usePresence(open, 260)
  const panel = React.useRef<HTMLDivElement>(null)
  useScrollLock(mounted)
  useFocusTrap(open, panel)
  useDismiss(open, () => setOpen(false), [panel], { outside: dismissible })
  if (!mounted) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center p-4">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_55%,transparent)] backdrop-blur-[6px] transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className={cn(
            "relative w-full max-w-md rounded-[26px] bg-surface p-6 shadow-[0_30px_80px_-20px_var(--hc-sh-dark),8px_8px_24px_var(--hc-sh-dark),-6px_-6px_18px_var(--hc-sh-light),inset_0_1px_0_var(--hc-sh-light)] outline-none",
            "transition-[opacity,scale,translate] duration-[350ms] ease-spring",
            visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0",
            className,
          )}
          {...props}
        >
          {children}
          {showClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid size-8 cursor-pointer place-items-center rounded-[10px] bg-bg text-muted shadow-inset-sm transition-[color,scale] duration-200 ease-spring hover:text-ink active:scale-90"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="m2.5 2.5 7 7M9.5 2.5l-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </Portal>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5 flex flex-col gap-1.5 pr-10", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialog()
  return <h2 id={titleId} className={cn("m-0 text-lg font-semibold tracking-tight", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descId } = useDialog()
  return <p id={descId} className={cn("m-0 text-[13.5px] leading-relaxed text-muted", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex flex-wrap justify-end gap-2.5", className)} {...props} />
}
