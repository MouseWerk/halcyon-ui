import * as React from "react"
import { cn } from "@/lib/utils"

const tones = {
  ok: "bg-ok text-ok animate-hc-breathe",
  warn: "bg-warn text-warn animate-[hc-breathe_1.4s_ease-in-out_infinite]",
  bad: "bg-bad text-bad animate-hc-breathe-fast",
  glow: "bg-glow text-glow",
  off: "bg-dot-off text-transparent",
} as const

export interface StatusLampProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones
  /** Disable the breathing animation. */
  steady?: boolean
}

/** A glowing indicator LED. Breathing speed rises with severity. */
export function StatusLamp({ tone = "ok", steady, className, ...props }: StatusLampProps) {
  return (
    <span
      role="presentation"
      className={cn(
        "inline-block size-[9px] shrink-0 rounded-full shadow-lamp",
        tones[tone],
        steady && "animate-none",
        className,
      )}
      {...props}
    />
  )
}
