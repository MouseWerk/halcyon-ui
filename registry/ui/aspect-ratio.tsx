import * as React from "react"
import { cn } from "@/lib/utils"

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** width / height, e.g. 16 / 9 */
  ratio?: number
  /** `inset` puts the content in a recessed frame. */
  surface?: "none" | "inset" | "raised"
}

/** Keeps its content at a fixed ratio. Children (img, video, iframe) fill the box. */
export function AspectRatio({ ratio = 16 / 9, surface = "none", className, style, children, ...props }: AspectRatioProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden [&>*]:absolute [&>*]:inset-0 [&>*]:size-full [&>img]:object-cover [&>video]:object-cover",
        surface === "inset" && "rounded-hc bg-bg shadow-inset",
        surface === "raised" && "rounded-hc bg-surface shadow-raised",
        className,
      )}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
