import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional hint shown after the label in muted text. */
  hint?: React.ReactNode
}

export function Label({ className, hint, children, ...props }: LabelProps) {
  return (
    <label className={cn("flex items-baseline gap-2 text-[13px] font-medium text-ink", className)} {...props}>
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  )
}
