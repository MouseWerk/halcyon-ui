import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  people: { initials?: string; src?: string; name?: string }[]
  /** Show at most this many, then a +N chip. */
  max?: number
  size?: number
}

/** Overlapping avatars. Each one lifts on hover; extras collapse into a recessed +N chip. */
export function AvatarGroup({ people, max = 4, size = 34, className, ...props }: AvatarGroupProps) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  const overlap = Math.round(size * 0.28)
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {shown.map((p, i) => (
        <span
          key={i}
          title={p.name}
          className="relative rounded-full ring-[3px] ring-surface transition-[translate] duration-300 ease-spring hover:z-10 hover:-translate-y-1"
          style={{ marginLeft: i ? -overlap : 0, zIndex: shown.length - i }}
        >
          <Avatar initials={p.initials} src={p.src} alt={p.name ?? ""} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className="relative grid place-items-center rounded-full bg-bg font-mono text-[11px] text-muted shadow-inset-sm ring-[3px] ring-surface"
          style={{ width: size, height: size, marginLeft: -overlap }}
          aria-label={`${rest} more`}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
