import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `raised` floats above the page, `inset` is pressed into it. */
  surface?: "raised" | "inset"
  /** Stagger index for the entrance animation (70ms per step). */
  index?: number
  animate?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, surface = "raised", index = 0, animate = true, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-w-0 rounded-hc p-5 transition-[background-color,box-shadow,translate,scale] duration-500 ease-out-soft",
        surface === "raised" ? "bg-surface shadow-raised" : "bg-bg shadow-inset",
        animate && "animate-hc-rise",
        className,
      )}
      style={{ animationDelay: `${index * 70}ms`, ...style }}
      {...props}
    />
  ),
)
Card.displayName = "Card"

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3.5 flex items-center gap-2.5", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("m-0 text-sm font-semibold", className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 text-xs text-muted", className)} {...props} />
}

export function CardActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ml-auto flex items-center gap-1.5", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />
}
