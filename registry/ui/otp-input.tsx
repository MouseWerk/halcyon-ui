"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface OtpInputProps {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void
  /** Allowed characters. */
  pattern?: RegExp
  /** Visual gap after this many slots (e.g. 3 for 123 456). */
  groupSize?: number
  disabled?: boolean
  invalid?: boolean
  className?: string
  "aria-label"?: string
}

/**
 * One-time code field: a row of recessed wells. Typing moves forward,
 * Backspace moves back, pasting fills every slot. The active well glows.
 * Uses one real input, so autofill (autocomplete="one-time-code") works.
 */
export function OtpInput({
  length = 6, value, defaultValue = "", onValueChange, onComplete, pattern = /^[0-9]$/, groupSize, disabled, invalid, className, ...aria
}: OtpInputProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = (value ?? inner).slice(0, length)
  const [focused, setFocused] = React.useState(false)
  const ref = React.useRef<HTMLInputElement>(null)

  const update = (next: string) => {
    const clean = [...next].filter((c) => pattern.test(c)).join("").slice(0, length)
    setInner(clean)
    onValueChange?.(clean)
    if (clean.length === length && clean !== v) onComplete?.(clean)
  }

  const active = Math.min(v.length, length - 1)

  return (
    <div
      className={cn("relative inline-flex items-center gap-2", disabled && "pointer-events-none opacity-50", className)}
      onClick={() => ref.current?.focus()}
    >
      <input
        ref={ref}
        value={v}
        disabled={disabled}
        inputMode={pattern.test("0") && !pattern.test("a") ? "numeric" : "text"}
        autoComplete="one-time-code"
        aria-label={aria["aria-label"] ?? "One-time code"}
        aria-invalid={invalid || undefined}
        onChange={(e) => update(e.target.value)}
        onFocus={(e) => { setFocused(true); const n = e.target.value.length; e.target.setSelectionRange(n, n) }}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 z-10 w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none"
      />
      {Array.from({ length }, (_, i) => {
        const ch = v[i]
        const isActive = focused && i === active
        return (
          <React.Fragment key={i}>
            {groupSize && i > 0 && i % groupSize === 0 && <span aria-hidden="true" className="size-1 rounded-full bg-dot-off" />}
            <span
              aria-hidden="true"
              className={cn(
                "relative grid h-11 w-8 place-items-center min-[360px]:w-[34px] rounded-xl bg-bg font-dot text-xl font-extrabold shadow-inset-sm min-[400px]:h-12 min-[400px]:w-10 min-[400px]:text-2xl",
                "transition-[box-shadow] duration-300 ease-out-soft sm:h-14 sm:w-11",
                isActive && "shadow-[inset_2px_2px_5px_var(--hc-sh-dark),inset_-2px_-2px_5px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
                invalid && "shadow-[inset_2px_2px_5px_var(--hc-sh-dark),inset_-2px_-2px_5px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-bad)]",
              )}
            >
              {ch ? <span className="animate-hc-pop">{ch}</span> : <span className="size-1.5 rounded-full bg-dot-off" />}
              {isActive && !ch && <span className="absolute bottom-2.5 h-0.5 w-4 rounded-full bg-glow animate-hc-breathe-fast" />}
            </span>
          </React.Fragment>
        )
      })}
    </div>
  )
}
