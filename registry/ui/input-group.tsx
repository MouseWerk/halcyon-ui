import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A recessed field that holds an input plus addons: icons, text such as
 * "https://" or "USD", keys and buttons. The whole well lights up on focus.
 */
export function InputGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        "flex min-h-11 items-center gap-1.5 rounded-[13px] bg-bg px-1.5 text-muted shadow-inset",
        "transition-[box-shadow] duration-300 ease-out-soft",
        "focus-within:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
        "has-[[aria-invalid=true]]:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-bad)]",
        "has-[textarea]:items-start has-[textarea]:py-1.5",
        className,
      )}
      {...props}
    />
  )
}

/** Icon or text before/after the input. Clicking it focuses the input. */
export function InputGroupAddon({ className, onClick, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      onClick={(e) => { onClick?.(e); e.currentTarget.parentElement?.querySelector<HTMLElement>("input,textarea")?.focus() }}
      className={cn("flex shrink-0 cursor-text select-none items-center gap-1.5 px-2 font-mono text-[12.5px] text-muted [&_svg]:size-4", className)}
      {...props}
    />
  )
}

export const InputGroupInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("h-9 min-w-0 flex-1 bg-transparent px-1 text-base text-ink outline-none placeholder:text-muted sm:text-[13.5px]", className)} {...props} />
))
InputGroupInput.displayName = "InputGroupInput"

export const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("min-h-20 min-w-0 flex-1 resize-y bg-transparent px-1.5 py-1.5 text-base leading-relaxed text-ink outline-none placeholder:text-muted sm:text-[13.5px]", className)} {...props} />
))
InputGroupTextarea.displayName = "InputGroupTextarea"

/** Small raised key that sits inside the group (search, copy, send...). */
export const InputGroupButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "inline-flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-surface px-2.5 text-xs font-medium text-ink shadow-raised-sm",
      "transition-[scale,box-shadow,color] duration-200 ease-spring active:scale-95 active:shadow-inset-sm disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
      className,
    )}
    {...props}
  />
))
InputGroupButton.displayName = "InputGroupButton"
