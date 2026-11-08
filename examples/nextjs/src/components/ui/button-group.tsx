import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

/**
 * Joins Buttons into one raised strip, like keys on a keyboard row. Inner
 * corners square off; each key still sinks on its own.
 */
export function ButtonGroup({ orientation = "horizontal", className, ...props }: ButtonGroupProps) {
  const h = orientation === "horizontal"
  return (
    <div
      role="group"
      className={cn(
        "inline-flex w-fit items-stretch rounded-xl bg-surface shadow-key",
        // children become flat segments of the strip
        "[&>*]:shadow-none [&>*]:rounded-none [&>button:active]:shadow-inset-sm",
        h
          ? "flex-row [&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl"
          : "flex-col [&>*:first-child]:rounded-t-xl [&>*:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  )
}

/** Engraved divider between keys of a ButtonGroup. */
export function ButtonGroupSeparator({ orientation = "vertical", className }: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return (
    <span
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0 self-stretch", orientation === "vertical" ? "my-2 w-0 border-l border-r border-l-[var(--hc-sh-dark)] border-r-[var(--hc-sh-light)]" : "mx-2 h-0 border-t border-b border-t-[var(--hc-sh-dark)] border-b-[var(--hc-sh-light)]", className)}
    />
  )
}

/** Non-interactive text segment, e.g. a unit or a label. */
export function ButtonGroupText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center bg-bg px-3 font-mono text-xs text-muted shadow-inset-sm", className)} {...props} />
}
