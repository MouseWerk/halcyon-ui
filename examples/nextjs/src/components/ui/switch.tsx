"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Tactile switch. When on, the key lights up like the theme switch: a glowing
 * rim, a halo, light pooling under the key and a bright LED. The track picks
 * up a faint glow too. The knob springs across and stretches while pressed.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked = false, onCheckedChange, className, onClick, ...props }, ref) => {
    const [inner, setInner] = React.useState(defaultChecked)
    const on = checked ?? inner
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={on}
        data-state={on ? "on" : "off"}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented) return
          setInner(!on)
          onCheckedChange?.(!on)
        }}
        className={cn(
          "group relative h-[28px] w-[50px] shrink-0 cursor-pointer rounded-[11px] bg-bg ring-1 ring-inset ring-line",
          "transition-[background-color,box-shadow] duration-500 ease-out-soft",
          on
            ? "shadow-[inset_2px_2px_5px_var(--hc-sh-dark),inset_-2px_-2px_5px_var(--hc-sh-light),inset_0_0_12px_var(--hc-glow-soft)]"
            : "shadow-inset-sm",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute left-[4px] top-[4px] grid h-[20px] w-[20px] place-items-center rounded-[7px]",
            "bg-linear-to-br from-raise to-surface",
            "transition-[translate,width,box-shadow] duration-[600ms,220ms,450ms] ease-spring group-active:w-[25px]",
            "after:pointer-events-none after:absolute after:-inset-px after:rounded-[inherit] after:transition-opacity after:duration-500",
            "after:bg-[radial-gradient(120%_70%_at_50%_120%,var(--hc-glow-soft),transparent_65%)]",
            on
              ? "translate-x-[22px] shadow-[0_0_0_1.5px_var(--hc-glow-soft),0_0_14px_var(--hc-glow-soft),0_0_4px_var(--hc-glow-soft),0_2px_5px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)] after:opacity-100 group-active:translate-x-[17px]"
              : "translate-x-0 shadow-[0_2px_5px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)] after:opacity-0",
          )}
        >
          <i
            className={cn(
              "relative z-10 rounded-full transition-[background-color,box-shadow,width,height] duration-300",
              on
                ? "size-[6px] bg-glow shadow-[0_0_4px_var(--hc-glow),0_0_10px_var(--hc-glow),0_0_18px_var(--hc-glow-soft)]"
                : "size-[5px] bg-dot-off",
            )}
          />
        </span>
      </button>
    )
  },
)
Switch.displayName = "Switch"
