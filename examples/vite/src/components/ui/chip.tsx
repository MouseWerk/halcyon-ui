"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Selectable filter chip: pass `selected` (and `onSelectedChange`). */
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  /** Shows a remove key and calls this when it is pressed (or on Backspace/Delete). */
  onRemove?: () => void
  icon?: React.ReactNode
}

/**
 * Compact pill for filters and tags. Selected chips sink and their dot lights
 * up. Removable chips get a small recessed x key.
 */
export function Chip({ selected, onSelectedChange, onRemove, icon, className, children, onClick, onKeyDown, ...props }: ChipProps) {
  const selectable = selected !== undefined
  return (
    <span className={cn("inline-flex items-center rounded-full transition-[box-shadow,background-color] duration-300 ease-out-soft", selected ? "bg-bg shadow-inset-sm" : "bg-surface shadow-raised-sm", className)}>
      <button
        type="button"
        aria-pressed={selectable ? selected : undefined}
        onClick={(e) => { onClick?.(e); if (!e.defaultPrevented && selectable) onSelectedChange?.(!selected) }}
        onKeyDown={(e) => { onKeyDown?.(e); if (onRemove && (e.key === "Backspace" || e.key === "Delete")) { e.preventDefault(); onRemove() } }}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-full py-1 pl-2.5 text-xs transition-[color,scale] duration-200 ease-spring active:scale-95 [&_svg]:size-3.5",
          onRemove ? "pr-1.5" : "pr-3",
          selected ? "text-ink" : "text-muted hover:text-ink",
        )}
        {...props}
      >
        {icon ?? (selectable && (
          <span className={cn("size-1.5 rounded-full transition-[background-color,box-shadow] duration-300", selected ? "bg-glow shadow-[0_0_6px_var(--hc-glow)]" : "bg-dot-off")} />
        ))}
        {children}
      </button>
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          tabIndex={-1}
          onClick={onRemove}
          className="mr-1 grid size-[18px] cursor-pointer place-items-center rounded-full bg-bg text-muted shadow-inset-sm transition-[color,scale] duration-200 ease-spring hover:text-bad active:scale-90"
        >
          <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="m3 3 6 6M9 3 3 9" /></svg>
        </button>
      )}
    </span>
  )
}
