import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Counter } from "@/components/ui/counter"
import { Sparkline } from "@/components/ui/sparkline"

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "prefix"> {
  label: string
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  /** e.g. "+12.4%" */
  delta?: string
  /** Is the delta good news? Colors it ok / bad. */
  trend?: "up" | "down"
  spark?: number[]
  /** Small right-aligned note, e.g. "sample". */
  note?: string
  index?: number
  /** Play the card entrance animation. */
  animate?: boolean
}

/** KPI tile: label, counting dot-matrix number, delta chip and sparkline. Lifts on hover. */
export function Stat({ label, value, decimals, prefix, suffix, delta, trend = "up", spark, note, index, animate, className, ...props }: StatProps) {
  return (
    <Card index={index} animate={animate} className={cn("flex flex-col gap-2.5 hover:-translate-y-[3px] duration-300 ease-spring", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{label}</span>
        {note && <span className="font-mono text-[11px] text-muted">{note}</span>}
      </div>
      <div className="text-[40px] leading-none">
        {prefix && <small className="font-dot text-[22px] font-extrabold text-muted">{prefix}</small>}
        <Counter value={value} decimals={decimals} />
        {suffix && <small className="font-dot text-[22px] font-extrabold text-muted">{suffix}</small>}
      </div>
      {(delta || spark) && (
        <div className="flex items-center gap-2.5">
          {delta && (
            <span className={cn("rounded-full bg-bg px-2 py-0.5 font-mono text-[11.5px] shadow-inset-sm", trend === "up" ? "text-ok" : "text-bad")}>
              {delta}
            </span>
          )}
          {spark && <Sparkline data={spark} className="flex-1" />}
        </div>
      )}
    </Card>
  )
}
