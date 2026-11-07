import * as React from "react"
import { cn } from "@/lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  /** `groove` is an engraved line that catches the light, `dots` a dotted rule. */
  variant?: "groove" | "dots"
}

export function Separator({ orientation = "horizontal", variant = "groove", className, style, ...props }: SeparatorProps) {
  const h = orientation === "horizontal"
  const look: React.CSSProperties =
    variant === "groove"
      ? h
        ? { borderTop: "1px solid var(--hc-sh-dark)", borderBottom: "1px solid var(--hc-sh-light)", height: 0 }
        : { borderLeft: "1px solid var(--hc-sh-dark)", borderRight: "1px solid var(--hc-sh-light)", width: 0 }
      : {
          backgroundImage: "radial-gradient(circle, var(--hc-dot-off) 1.2px, transparent 1.5px)",
          backgroundSize: h ? "8px 4px" : "4px 8px",
          backgroundRepeat: h ? "repeat-x" : "repeat-y",
          ...(h ? { height: 4 } : { width: 4 }),
        }
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn("shrink-0", h ? "w-full" : "self-stretch", className)}
      style={{ ...look, ...style }}
      {...props}
    />
  )
}
