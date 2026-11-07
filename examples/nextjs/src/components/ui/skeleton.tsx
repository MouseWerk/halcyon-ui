import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Loading placeholder: a recessed well with a dot-matrix shimmer sweeping
 * across it.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-xl bg-bg shadow-inset-sm",
        "before:absolute before:inset-0 before:bg-[radial-gradient(var(--hc-dot-off)_1px,transparent_1.3px)] before:bg-[length:6px_6px]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[hc-shimmer_1.6s_ease-in-out_infinite]",
        "after:bg-[linear-gradient(90deg,transparent,var(--hc-glow-soft),transparent)] after:opacity-40",
        className,
      )}
      {...props}
    />
  )
}
