import * as React from "react"
import { cn } from "@/lib/utils"

const tones = {
  neutral: "text-muted",
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad",
  glow: "text-glow-ink",
} as const

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones
  /** Show the glowing dot. */
  dot?: boolean
  /** `raised` pill or recessed `inset` chip. */
  surface?: "raised" | "inset"
}

/** Status pill. The dot carries the color, the label stays in ink for legibility. */
export function Badge({ tone = "neutral", dot = true, surface = "raised", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full py-[3px] pl-2 pr-2.5 text-xs",
        surface === "raised"
          ? "bg-surface shadow-[1px_1px_3px_var(--hc-sh-dark),-1px_-1px_3px_var(--hc-sh-light)]"
          : "bg-bg shadow-inset-sm",
        tones[tone],
        !dot && "pl-2.5",
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />}
      <span className="text-ink">{children}</span>
    </span>
  )
}
