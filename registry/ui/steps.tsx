import * as React from "react"
import { cn } from "@/lib/utils"

export interface Step {
  title: React.ReactNode
  description?: React.ReactNode
}

export interface StepsProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: Step[]
  /** Index of the current step (0-based). Steps before it are done. */
  current: number
  orientation?: "horizontal" | "vertical"
  /** Makes finished steps clickable. */
  onStepClick?: (index: number) => void
}

/**
 * Progress through a flow. Each step is a key: done steps are lit, the current
 * one glows and breathes, upcoming ones stay recessed. A dotted rail connects them.
 */
export function Steps({ steps, current, orientation = "horizontal", onStepClick, className, ...props }: StepsProps) {
  const v = orientation === "vertical"
  return (
    <ol className={cn("m-0 flex list-none p-0", v ? "flex-col" : "w-full items-start", className)} {...props}>
      {steps.map((s, i) => {
        const done = i < current
        const now = i === current
        const last = i === steps.length - 1
        const clickable = done && onStepClick
        const Key = clickable ? "button" : "span"
        return (
          <li key={i} aria-current={now ? "step" : undefined} className={cn("relative flex min-w-0", v ? "gap-3.5 pb-6 last:pb-0" : "flex-1 flex-col items-center gap-2 text-center")}>
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bg-[length:6px_6px] transition-opacity duration-500",
                  done ? "bg-[radial-gradient(circle,var(--hc-glow)_1.2px,transparent_1.5px)]" : "bg-[radial-gradient(circle,var(--hc-dot-off)_1.2px,transparent_1.5px)]",
                  v ? "bottom-1 left-[15px] top-[38px] w-1.5 bg-repeat-y" : "left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[13px] h-1.5 bg-repeat-x",
                )}
              />
            )}
            <Key
              {...(clickable ? { type: "button" as const, onClick: () => onStepClick!(i), "aria-label": `Go to step ${i + 1}` } : {})}
              className={cn(
                "relative grid size-8 shrink-0 place-items-center rounded-[11px] font-mono text-xs transition-[box-shadow,background-color,color] duration-500 ease-out-soft",
                done && "bg-surface text-glow-ink shadow-raised-sm",
                now && "bg-surface text-ink shadow-glow",
                !done && !now && "bg-bg text-muted shadow-inset-sm",
                clickable && "cursor-pointer transition-[scale] active:scale-90",
              )}
            >
              {done ? (
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" /></svg>
              ) : (
                i + 1
              )}
              {now && <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-glow shadow-[0_0_6px_var(--hc-glow)] animate-hc-breathe" />}
            </Key>
            <div className={cn("min-w-0", v ? "pt-1.5" : "px-1")}>
              <div className={cn("text-[13px] font-medium", !done && !now && "text-muted")}>{s.title}</div>
              {s.description && <div className="mt-0.5 text-xs text-muted max-sm:hidden">{s.description}</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
