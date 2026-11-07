import * as React from "react"
import { cn } from "@/lib/utils"

const tones = {
  info: { lamp: "bg-glow text-glow", ring: "shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),inset_0_0_0_1px_var(--hc-glow-soft)]" },
  ok: { lamp: "bg-ok text-ok", ring: "shadow-inset" },
  warn: { lamp: "bg-warn text-warn", ring: "shadow-inset" },
  bad: { lamp: "bg-bad text-bad", ring: "shadow-inset" },
} as const

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: keyof typeof tones
  title?: React.ReactNode
  /** Optional action area on the right. */
  action?: React.ReactNode
}

/** Recessed message well. A status LED on the left carries the tone. */
export function Alert({ tone = "info", title, action, className, children, ...props }: AlertProps) {
  return (
    <div
      role={tone === "bad" || tone === "warn" ? "alert" : "status"}
      className={cn("flex flex-wrap items-start gap-x-3.5 gap-y-3 rounded-2xl bg-bg px-4 py-3.5", tones[tone].ring, className)}
      {...props}
    >
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]", tones[tone].lamp)} />
      <div className="min-w-0 flex-1 basis-48">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {children && <div className={cn("text-[13.5px] leading-relaxed text-muted", title && "mt-0.5")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center max-sm:ml-[22px]">{action}</div>}
    </div>
  )
}
