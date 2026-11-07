import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number
  /** Number of dots in the ring. */
  dots?: number
  label?: string
}

/** Dot-matrix loader: a ring of dots with a glowing comet running around it. */
export function Spinner({ size = 24, dots = 10, label = "Loading", className, style, ...props }: SpinnerProps) {
  const r = size / 2 - size * 0.1
  const d = Math.max(2, size * 0.13)
  return (
    <span role="status" aria-label={label} className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size, ...style }} {...props}>
      {Array.from({ length: dots }, (_, i) => {
        const a = (i / dots) * Math.PI * 2 - Math.PI / 2
        return (
          <span
            key={i}
            className="absolute rounded-full bg-glow animate-[hc-orbit_1s_linear_infinite] shadow-[0_0_6px_var(--hc-glow)]"
            style={{
              width: d, height: d,
              left: size / 2 + Math.cos(a) * r - d / 2,
              top: size / 2 + Math.sin(a) * r - d / 2,
              animationDelay: `${(i / dots) - 1}s`,
            }}
          />
        )
      })}
    </span>
  )
}
