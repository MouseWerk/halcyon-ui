import * as React from "react"
import { cn } from "@/lib/utils"

const variants = {
  /** Raised key that sinks in when pressed. */
  default: "bg-surface text-ink shadow-key active:shadow-inset-sm",
  /** Raised key with the theme glow ring. Use once per view for the main action. */
  glow: "bg-surface text-ink shadow-glow active:shadow-inset-sm",
  /** Flat until hovered. */
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-raise/60 active:shadow-inset-sm",
  /** Recessed well. */
  inset: "bg-bg text-ink shadow-inset-sm active:shadow-inset",
  danger: "bg-surface text-bad shadow-key active:shadow-inset-sm",
} as const

const sizes = {
  sm: "h-8 px-3 text-xs rounded-[10px] gap-1.5 [&_svg]:size-3.5",
  md: "h-10 px-4 text-[13px] rounded-xl gap-2 [&_svg]:size-4",
  lg: "h-12 px-5 text-sm rounded-[14px] gap-2.5 [&_svg]:size-[18px]",
  icon: "size-10 rounded-[13px] [&_svg]:size-[18px]",
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium",
        "cursor-pointer transition-[transform,box-shadow,background-color,color] duration-200 ease-spring",
        "active:translate-y-px active:scale-[.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"

export const buttonVariants = { variants, sizes }
