import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon (any SVG element). */
  icon?: React.ReactNode
  /** Optional trailing element, e.g. a <Kbd>. */
  trailing?: React.ReactNode
}

/** Recessed text field. The well deepens and the glow ring appears on focus. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, trailing, ...props }, ref) => (
    <label
      className={cn(
        "flex h-11 items-center gap-2 rounded-[13px] bg-bg px-3.5 text-muted shadow-inset",
        "transition-[box-shadow,background-color] duration-300 ease-out-soft",
        "focus-within:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        "has-[[aria-invalid=true]]:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-bad)]",
        className,
      )}
    >
      {icon}
      <input
        ref={ref}
        className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none sm:text-[13.5px] placeholder:text-muted"
        {...props}
      />
      {trailing}
    </label>
  ),
)
Input.displayName = "Input"
