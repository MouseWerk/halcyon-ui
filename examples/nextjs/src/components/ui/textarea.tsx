"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grow with the content up to this many px. */
  autoGrow?: number
  /** Show a dot-matrix style character counter when maxLength is set. */
  counter?: boolean
}

/** Recessed multi-line field with optional auto-grow and character counter. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoGrow, counter = true, maxLength, onChange, value, defaultValue, ...props }, fwd) => {
    const ref = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(fwd, () => ref.current!)
    const [typed, setLen] = React.useState(String(value ?? defaultValue ?? "").length)
    // Controlled: follow the value prop, also when the parent changes it.
    const len = value !== undefined ? String(value).length : typed

    const grow = React.useCallback(() => {
      const el = ref.current
      if (!el || !autoGrow) return
      el.style.height = "auto"
      el.style.height = `${Math.min(autoGrow, el.scrollHeight)}px`
    }, [autoGrow])
    React.useEffect(grow, [grow, value])

    return (
      <div
        className={cn(
          "relative rounded-[14px] bg-bg shadow-inset transition-shadow duration-300",
          "focus-within:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
          className,
        )}
      >
        <textarea
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={(e) => { setLen(e.target.value.length); grow(); onChange?.(e) }}
          className="block min-h-24 w-full resize-y bg-transparent px-3.5 py-3 text-base leading-relaxed text-ink outline-none sm:text-[13.5px] placeholder:text-muted"
          {...props}
        />
        {counter && maxLength && (
          <span className={cn("pointer-events-none absolute bottom-2 right-3 font-mono text-[11px]", len >= maxLength ? "text-bad" : "text-muted")}>
            {len}/{maxLength}
          </span>
        )}
      </div>
    )
  },
)
Textarea.displayName = "Textarea"
