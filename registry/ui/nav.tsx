import * as React from "react"
import { cn } from "@/lib/utils"

/** Recessed rail that holds NavItems. */
export function Nav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav className={cn("flex flex-col gap-1.5 rounded-2xl bg-bg p-1.5 shadow-inset", className)} {...props} />
}

export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  active?: boolean
  /** Small count chip shown instead of the LED. */
  count?: number
}

/** Rail button. The active item rises out of the rail and its LED lights up. */
export function NavItem({ icon, active, count, className, children, ...props }: NavItemProps) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] px-2.5 py-[9px] text-left font-medium",
        "transition-[color,background-color,box-shadow,scale] duration-300 ease-out-soft active:scale-[.97]",
        "[&_svg]:size-[17px] [&_svg]:shrink-0",
        active ? "bg-raise text-ink shadow-raised-sm" : "text-muted hover:text-ink",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count !== undefined ? (
        <span className="rounded-full bg-bg px-[7px] py-px font-mono text-[11px] shadow-inset-sm">{count}</span>
      ) : (
        <i
          className={cn(
            "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
            active ? "bg-glow shadow-[0_0_8px_var(--hc-glow),0_0_16px_var(--hc-glow-soft)]" : "bg-dot-off",
          )}
        />
      )}
    </button>
  )
}
