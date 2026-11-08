import * as React from "react"
import { cn } from "@/lib/utils"

export interface ItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Avatar, icon or image on the left. */
  media?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons, badges or a chevron on the right. */
  actions?: React.ReactNode
  surface?: "raised" | "inset" | "ghost"
  size?: "sm" | "md"
  /** Render as a link. Hover lift and focus ring included. */
  href?: string
}

/**
 * Generic list row: media, title, description and actions. Use it for
 * settings rows, people, files, notifications and search results.
 */
export function Item({ media, title, description, actions, surface = "raised", size = "md", href, className, ...props }: ItemProps) {
  const Comp = (href ? "a" : "div") as "div"
  return (
    <Comp
      {...(href ? { href } : {})}
      className={cn(
        "flex min-w-0 items-center rounded-2xl text-left",
        size === "sm" ? "gap-3 px-3 py-2.5" : "gap-3.5 px-4 py-3.5",
        surface === "raised" && "bg-surface shadow-raised-sm",
        surface === "inset" && "bg-bg shadow-inset-sm",
        surface === "ghost" && "hover:bg-raise/60",
        href && "cursor-pointer transition-[translate,box-shadow,background-color] duration-300 ease-spring hover:-translate-y-0.5 active:translate-y-px",
        className,
      )}
      {...props}
    >
      {media && <span className="grid shrink-0 place-items-center [&_svg]:size-5 [&_svg]:text-muted">{media}</span>}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate font-medium", size === "sm" ? "text-[13px]" : "text-sm")}>{title}</span>
        {description && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{description}</span>}
      </span>
      {actions && <span className="flex shrink-0 items-center gap-2">{actions}</span>}
    </Comp>
  )
}

/** Stack of Items with consistent spacing. */
export function ItemGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

/** Recessed square for an icon, used as Item media. */
export function ItemIcon({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("grid size-10 place-items-center rounded-xl bg-bg shadow-inset-sm [&_svg]:size-[18px] [&_svg]:text-muted", className)} {...props} />
}
