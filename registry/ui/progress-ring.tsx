import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..max */
  value: number
  max?: number
  size?: number
  /** Dots in the ring. */
  dots?: number
  tone?: "glow" | "ok" | "warn" | "bad"
  /** Center content. Defaults to the percentage. */
  children?: React.ReactNode
}

const fills = { glow: "fill-glow", ok: "fill-ok", warn: "fill-warn", bad: "fill-bad" } as const
const glows = { glow: "var(--hc-glow)", ok: "var(--hc-ok)", warn: "var(--hc-warn)", bad: "var(--hc-bad)" } as const

/** Circular progress made of dots around a recessed dial. Dots light up one by one. */
export function ProgressRing({ value, max = 100, size = 96, dots = 32, tone = "glow", children, className, style, ...props }: ProgressRingProps) {
  const k = Math.min(1, Math.max(0, value / max))
  const lit = Math.round(k * dots)
  const r = size / 2
  const ringR = r - 5
  const dotR = Math.max(1.4, Math.min(2.6, (Math.PI * ringR) / dots / 2.4))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={props["aria-label"] ?? "Progress"}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 overflow-visible" aria-hidden="true">
        {Array.from({ length: dots }, (_, i) => {
          const a = (i / dots) * Math.PI * 2 - Math.PI / 2
          const on = i < lit
          return (
            <circle
              key={i}
              cx={r + Math.cos(a) * ringR}
              cy={r + Math.sin(a) * ringR}
              r={dotR}
              className={cn("transition-[fill] duration-300", on ? fills[tone] : "fill-dot-off")}
              style={{ transitionDelay: `${i * 18}ms`, filter: on && i === lit - 1 ? `drop-shadow(0 0 3px ${glows[tone]})` : undefined }}
            />
          )
        })}
      </svg>
      <span className="grid place-items-center rounded-full bg-bg shadow-inset-sm" style={{ width: size - 24, height: size - 24 }}>
        {children ?? <span className="font-dot font-extrabold tabular-nums" style={{ fontSize: Math.max(12, size * 0.22) }}>{Math.round(k * 100)}<small className="text-muted" style={{ fontSize: "0.55em" }}>%</small></span>}
      </span>
    </div>
  )
}
