"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  size?: "sm" | "md" | "lg"
}

const sizes = {
  sm: "h-8 min-w-8 px-2.5 text-xs rounded-[10px] [&_svg]:size-3.5",
  md: "h-10 min-w-10 px-3 text-[13px] rounded-xl [&_svg]:size-4",
  lg: "h-12 min-w-12 px-4 text-sm rounded-[14px] [&_svg]:size-[18px]",
} as const

/**
 * A key that stays down. Off it is raised; on it sinks into the surface, the
 * label picks up the glow and a small LED lights in the corner.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ pressed, defaultPressed = false, onPressedChange, size = "md", className, onClick, children, ...props }, ref) => {
    const [inner, setInner] = React.useState(defaultPressed)
    const on = pressed ?? inner
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={on}
        data-state={on ? "on" : "off"}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented) return
          setInner(!on)
          onPressedChange?.(!on)
        }}
        className={cn(
          "relative inline-flex cursor-pointer select-none items-center justify-center gap-2 font-medium",
          "transition-[box-shadow,background-color,color,scale] duration-300 ease-spring active:scale-[.96]",
          "disabled:pointer-events-none disabled:opacity-50",
          on ? "bg-bg text-glow-ink shadow-inset-sm" : "bg-surface text-muted shadow-key hover:text-ink",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
        <i
          aria-hidden="true"
          className={cn(
            "absolute right-1.5 top-1.5 size-1 rounded-full transition-[background-color,box-shadow] duration-300",
            on ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "bg-transparent",
          )}
        />
      </button>
    )
  },
)
Toggle.displayName = "Toggle"
