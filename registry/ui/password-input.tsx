"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Show the four-dot strength meter under the field. */
  strength?: boolean
  /** Custom scoring 0..4. Defaults to a length and variety heuristic. */
  score?: (value: string) => number
}

export function passwordScore(v: string) {
  if (!v) return 0
  let s = 0
  if (v.length >= 8) s++
  if (v.length >= 12) s++
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++
  return Math.max(1, Math.min(4, s))
}

const labels = ["", "Weak", "Fair", "Good", "Strong"]
const tones = ["bg-dot-off", "bg-bad text-bad", "bg-warn text-warn", "bg-ok text-ok", "bg-glow text-glow"]

/** Recessed password field with a reveal key and an optional dot strength meter. */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ strength = false, score = passwordScore, className, onChange, value, defaultValue, ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    // The wrapper is a div, not a label element: a label around the field and
    // the reveal button would merge both into the field's accessible name.
    const input = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => input.current as HTMLInputElement)
    const [inner, setInner] = React.useState(String(defaultValue ?? ""))
    const current = value !== undefined ? String(value) : inner
    const s = strength ? score(current) : 0
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div
          onMouseDown={(e) => { if (!(e.target as Element).closest("button, input")) { e.preventDefault(); input.current?.focus() } }}
          className={cn(
            "flex h-11 cursor-text items-center gap-2 rounded-[13px] bg-bg pl-3.5 pr-1.5 text-muted shadow-inset",
            "transition-[box-shadow] duration-300 ease-out-soft",
            "focus-within:shadow-[inset_3px_3px_7px_var(--hc-sh-dark),inset_-3px_-3px_7px_var(--hc-sh-light),0_0_0_1.5px_var(--hc-glow-soft)]",
          )}
        >
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          <input
            ref={input}
            type={show ? "text" : "password"}
            value={value}
            defaultValue={defaultValue}
            onChange={(e) => { setInner(e.target.value); onChange?.(e) }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-mono text-base tracking-wide text-ink outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-muted sm:text-[13.5px]"
            {...props}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onClick={() => setShow(!show)}
            className={cn(
              "grid size-8 shrink-0 cursor-pointer place-items-center rounded-[10px] transition-[box-shadow,background-color,color,scale] duration-200 ease-spring active:scale-90",
              show ? "bg-bg text-glow-ink shadow-inset-sm" : "bg-surface text-muted shadow-raised-sm hover:text-ink",
            )}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
              {!show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        </div>
        {strength && (
          <div className="flex items-center gap-2.5 px-1" aria-live="polite">
            <div className="flex flex-1 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-[background-color,box-shadow] duration-300", i <= s ? cn(tones[s], "shadow-[0_0_5px_currentColor]") : "bg-dot-off")} style={{ transitionDelay: `${i * 40}ms` }} />
              ))}
            </div>
            <span className="w-12 text-right font-mono text-[11px] text-muted">{labels[s]}</span>
          </div>
        )}
      </div>
    )
  },
)
PasswordInput.displayName = "PasswordInput"
