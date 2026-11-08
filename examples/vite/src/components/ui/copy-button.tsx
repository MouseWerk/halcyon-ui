"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Text to copy, or a function that returns it. */
  value: string | (() => string)
  /** How long the "copied" state lasts, in ms. */
  timeout?: number
  onCopied?: (text: string) => void
  /** Show a text label next to the icon. */
  label?: boolean
}

async function writeText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for insecure contexts and older WebViews.
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0"
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand("copy") } catch { ok = false }
    ta.remove()
    return ok
  }
}

/** Raised key that copies to the clipboard. The icon swaps to a glowing check that draws itself in. */
export function CopyButton({ value, timeout = 1600, onCopied, label, className, onClick, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const t = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(t.current), [])

  return (
    <button
      type="button"
      aria-label={label ? undefined : copied ? "Copied" : "Copy"}
      onClick={async (e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        const text = typeof value === "function" ? value() : value
        if (!(await writeText(text))) return
        setCopied(true)
        onCopied?.(text)
        clearTimeout(t.current)
        t.current = setTimeout(() => setCopied(false), timeout)
      }}
      className={cn(
        "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-surface px-2 text-xs font-medium shadow-key",
        "transition-[scale,box-shadow,color] duration-200 ease-spring active:scale-95 active:shadow-inset-sm",
        copied ? "text-glow-ink" : "text-muted hover:text-ink",
        className,
      )}
      {...props}
    >
      <span className="relative grid size-3.5 place-items-center">
        <svg viewBox="0 0 24 24" className={cn("absolute size-3.5 transition-[opacity,scale] duration-300 ease-spring", copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15" />
        </svg>
        <svg viewBox="0 0 16 16" className={cn("absolute size-3.5 transition-[opacity,scale] duration-300 ease-spring", copied ? "scale-100 opacity-100" : "scale-50 opacity-0")} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength={1} className={cn("transition-[stroke-dashoffset] duration-300 [stroke-dasharray:1]", copied ? "[stroke-dashoffset:0] delay-100" : "[stroke-dashoffset:1]")} />
        </svg>
      </span>
      {label && <span>{copied ? "Copied" : "Copy"}</span>}
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </button>
  )
}
