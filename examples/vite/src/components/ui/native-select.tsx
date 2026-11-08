import * as React from "react"
import { cn } from "@/lib/utils"

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Shown as a disabled first option when there is no value. */
  placeholder?: string
}

/**
 * A real <select> dressed as a raised key. Uses the platform picker, which is
 * the best choice on phones and for long lists.
 */
export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(({ className, placeholder, children, ...props }, ref) => (
  <span className={cn("relative inline-flex min-w-44", className)}>
    <select
      ref={ref}
      className={cn(
        "h-10 w-full cursor-pointer appearance-none rounded-xl bg-surface pl-3.5 pr-9 text-base text-ink shadow-key outline-none sm:text-[13.5px]",
        "transition-[box-shadow] duration-200 focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-50",
      )}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {children}
    </select>
    <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-3.5 top-1/2 size-3 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 4.5 3 3 3-3" /></svg>
  </span>
))
NativeSelect.displayName = "NativeSelect"
