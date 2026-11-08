"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { DotIcon } from "@/components/ui/dot-icon"
import type { Glyph, GlyphName } from "@/lib/dot-matrix"

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: GlyphName | Glyph
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons or links. */
  action?: React.ReactNode
}

/** Placeholder for an empty list or search: a dot-matrix glyph in a well, a line of text and an action. */
export function EmptyState({ icon = "diamond", title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-hc bg-bg px-6 py-10 text-center shadow-inset", className)} {...props}>
      <span className="grid size-20 place-items-center rounded-[22px] bg-surface shadow-raised animate-hc-pop">
        <DotIcon icon={icon} size={40} />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="m-0 text-base font-semibold tracking-tight">{title}</h3>
        {description && <p className="m-0 text-[13.5px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2.5">{action}</div>}
    </div>
  )
}
