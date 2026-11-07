import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Shown when there is no image. */
  initials?: string
  src?: string
  alt?: string
  size?: number
}

export function Avatar({ initials, src, alt = "", size = 34, className, style, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-raise text-xs font-semibold",
        "shadow-[2px_2px_5px_var(--hc-sh-dark),-2px_-2px_5px_var(--hc-sh-light)]",
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : initials}
    </span>
  )
}
