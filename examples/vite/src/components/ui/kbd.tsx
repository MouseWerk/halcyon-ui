import * as React from "react"
import { cn } from "@/lib/utils"

/** A tiny raised keycap. */
export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 items-center rounded-md bg-surface px-1.5 font-mono text-[11px] text-muted",
        "shadow-[1px_1px_2px_var(--hc-sh-dark),-1px_-1px_2px_var(--hc-sh-light)]",
        className,
      )}
      {...props}
    />
  )
}
