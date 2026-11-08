"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusLamp } from "@/components/ui/status-lamp"

type Tone = "glow" | "ok" | "warn" | "bad"
type ToastItem = { id: number; message: React.ReactNode; tone: Tone }

const subs = new Set<(t: ToastItem) => void>()
let nextId = 1

/** Show a toast from anywhere: toast("Saved"), toast("Webhook failing", { tone: "bad" }) */
export function toast(message: React.ReactNode, opts: { tone?: Tone } = {}) {
  const item = { id: nextId++, message, tone: opts.tone ?? "glow" }
  subs.forEach((fn) => fn(item))
}

/** Mount once near the root. Toasts spring up from the bottom edge. */
export function Toaster({ duration = 2400, className }: { duration?: number; className?: string }) {
  const [items, setItems] = React.useState<(ToastItem & { shown: boolean })[]>([])

  React.useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (cb: () => void, ms: number) => { const id = setTimeout(() => { timers.delete(id); cb() }, ms); timers.add(id) }
    const fn = (t: ToastItem) => {
      setItems((xs) => [...xs.slice(-2), { ...t, shown: false }])
      // two frames so the hidden state paints first and the spring-in transition runs
      later(() => setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, shown: true } : x))), 32)
      later(() => setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, shown: false } : x))), duration)
      later(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), duration + 600)
    }
    subs.add(fn)
    return () => { subs.delete(fn); timers.forEach(clearTimeout) }
  }, [duration])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2",
        "bottom-[calc(24px+env(safe-area-inset-bottom,0px))]",
        className,
      )}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 rounded-[14px] bg-surface px-4 py-[11px] text-[13px] shadow-raised",
            "transition-[translate,opacity] duration-[550ms] ease-spring",
            t.shown ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0",
          )}
        >
          <StatusLamp tone={t.tone} steady />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
