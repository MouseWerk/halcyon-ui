"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, useOpenState, usePresence, useScrollLock } from "@/lib/overlay"

export interface AlertDialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog. */
  trigger?: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
  title: React.ReactNode
  description?: React.ReactNode
  /** Extra content between the text and the buttons. */
  children?: React.ReactNode
  actionLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  /** `danger` turns the action key red. */
  tone?: "default" | "danger"
  /** May return a promise: the action key shows a spinner and the dialog closes when it resolves. */
  onAction?: () => void | Promise<unknown>
  onCancel?: () => void
}

/**
 * Confirmation that interrupts the user. Unlike Dialog it does not close on a
 * backdrop click, focuses Cancel first and waits for async actions.
 */
export function AlertDialog({
  open, defaultOpen, onOpenChange, trigger, title, description, children,
  actionLabel = "Continue", cancelLabel = "Cancel", tone = "default", onAction, onCancel,
}: AlertDialogProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const [busy, setBusy] = React.useState(false)
  const { mounted, visible } = usePresence(o, 260)
  const panel = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descId = React.useId()
  useScrollLock(mounted)
  useFocusTrap(o, panel)
  useDismiss(o, () => { if (!busy) { onCancel?.(); setO(false) } }, [panel], { outside: false })

  const act = async () => {
    try {
      const r = onAction?.()
      if (r && typeof (r as Promise<unknown>).then === "function") { setBusy(true); await r }
      setO(false)
    } catch {
      // keep the dialog open so the user can retry
    } finally {
      setBusy(false)
    }
  }

  const key = "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-medium transition-[scale,box-shadow,color] duration-200 ease-spring active:scale-[.97] disabled:pointer-events-none disabled:opacity-50"

  return (
    <>
      {trigger && React.cloneElement(trigger, { onClick: (e: React.MouseEvent) => { trigger.props.onClick?.(e); setO(true) } })}
      {mounted && (
        <Portal>
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div aria-hidden="true" className={cn("absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_72%,transparent)] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} />
            <div
              ref={panel}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descId : undefined}
              className={cn(
                "relative w-full max-w-md rounded-[26px] bg-surface p-6 shadow-[0_30px_80px_-20px_var(--hc-sh-dark),8px_8px_24px_var(--hc-sh-dark),-6px_-6px_18px_var(--hc-sh-light),inset_0_1px_0_var(--hc-sh-light)] outline-none",
                "transition-[opacity,scale,translate] duration-[350ms] ease-spring",
                visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0",
              )}
            >
              <div className="flex gap-4">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-bg shadow-inset-sm">
                  <span className={cn("size-2 rounded-full shadow-[0_0_8px_currentColor]", tone === "danger" ? "bg-bad text-bad" : "bg-glow text-glow")} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id={titleId} className="m-0 text-lg font-semibold tracking-tight">{title}</h2>
                  {description && <p id={descId} className="m-0 mt-1.5 text-[13.5px] leading-relaxed text-muted">{description}</p>}
                </div>
              </div>
              {children && <div className="mt-5">{children}</div>}
              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button type="button" data-autofocus disabled={busy} onClick={() => { onCancel?.(); setO(false) }} className={cn(key, "bg-surface text-ink shadow-key active:shadow-inset-sm")}>
                  {cancelLabel}
                </button>
                <button type="button" disabled={busy} aria-busy={busy || undefined} onClick={act} className={cn(key, "bg-surface shadow-glow active:shadow-inset-sm", tone === "danger" ? "text-bad shadow-[0_0_0_1.5px_color-mix(in_oklab,var(--hc-bad)_40%,transparent),0_0_18px_color-mix(in_oklab,var(--hc-bad)_30%,transparent),0_6px_14px_var(--hc-sh-dark)]" : "text-ink")}>
                  {busy && <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                  {actionLabel}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
