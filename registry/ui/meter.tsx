import * as React from "react"
import { cn } from "@/lib/utils"

export interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..max */
  value: number
  max?: number
  /** Number of dot segments. */
  segments?: number
  tone?: "glow" | "ok" | "warn" | "bad"
}

const fill = { glow: "bg-glow text-glow", ok: "bg-ok text-ok", warn: "bg-warn text-warn", bad: "bg-bad text-bad" } as const

/** Dot-segment progress meter in a recessed track. Segments light up one by one. */
export function Meter({ value, max = 100, segments = 20, tone = "glow", className, ...props }: MeterProps) {
  const lit = Math.round((Math.min(max, Math.max(0, value)) / max) * segments)
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("flex h-4 items-center gap-[3px] rounded-full bg-bg px-[5px] shadow-inset-sm", className)}
      {...props}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-[background-color,box-shadow] duration-300",
            i < lit ? cn(fill[tone], "shadow-[0_0_5px_currentColor]") : "bg-dot-off",
          )}
          style={{ transitionDelay: `${i * 22}ms` }}
        />
      ))}
    </div>
  )
}
