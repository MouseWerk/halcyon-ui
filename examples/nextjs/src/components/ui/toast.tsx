"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { StatusLamp } from "@/components/ui/status-lamp"

type Tone = "glow" | "ok" | "warn" | "bad"

export interface ToastOptions {
  tone?: Tone
  description?: React.ReactNode
  /** A key inside the toast, e.g. Undo. Pressing it also dismisses the toast. */
  action?: { label: React.ReactNode; onClick: () => void }
  /** ms before it leaves; Infinity keeps it until dismissed. Defaults to the Toaster duration. */
  duration?: number
  /** Reuse an id to update a toast in place (used by toast.promise). */
  id?: number
  /** Shows a spinner instead of the lamp. */
  loading?: boolean
}

type ToastItem = ToastOptions & { id: number; message: React.ReactNode }
type Event = { type: "show"; item: ToastItem } | { type: "dismiss"; id?: number }

const subs = new Set<(e: Event) => void>()
let nextId = 1
const emit = (e: Event) => subs.forEach((fn) => fn(e))

/** Show a toast from anywhere: toast("Saved"), toast("Webhook failing", { tone: "bad", description: "3 retries left" }) */
export function toast(message: React.ReactNode, opts: ToastOptions = {}) {
  const id = opts.id ?? nextId++
  emit({ type: "show", item: { ...opts, id, message, tone: opts.tone ?? "glow" } })
  return id
}
toast.success = (m: React.ReactNode, o: Omit<ToastOptions, "tone"> = {}) => toast(m, { ...o, tone: "ok" })
toast.warning = (m: React.ReactNode, o: Omit<ToastOptions, "tone"> = {}) => toast(m, { ...o, tone: "warn" })
toast.error = (m: React.ReactNode, o: Omit<ToastOptions, "tone"> = {}) => toast(m, { ...o, tone: "bad" })
/** Dismiss one toast, or all of them. */
toast.dismiss = (id?: number) => emit({ type: "dismiss", id })
/** Loading toast that turns into success or error when the promise settles. */
toast.promise = <T,>(p: Promise<T>, msgs: { loading: React.ReactNode; success: React.ReactNode | ((v: T) => React.ReactNode); error: React.ReactNode | ((e: unknown) => React.ReactNode) }) => {
  const id = toast(msgs.loading, { loading: true, duration: Infinity })
  p.then(
    (v) => toast(typeof msgs.success === "function" ? (msgs.success as (v: T) => React.ReactNode)(v) : msgs.success, { id, tone: "ok" }),
    (e) => toast(typeof msgs.error === "function" ? (msgs.error as (e: unknown) => React.ReactNode)(e) : msgs.error, { id, tone: "bad" }),
  )
  return p
}

const positions = {
  "bottom-center": "inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] items-center flex-col-reverse",
  "top-center": "inset-x-0 top-[calc(24px+env(safe-area-inset-top,0px))] items-center flex-col",
  "bottom-right": "right-[max(24px,env(safe-area-inset-right))] bottom-[calc(24px+env(safe-area-inset-bottom,0px))] items-end flex-col-reverse max-sm:inset-x-0 max-sm:items-center",
  "top-right": "right-[max(24px,env(safe-area-inset-right))] top-[calc(24px+env(safe-area-inset-top,0px))] items-end flex-col max-sm:inset-x-0 max-sm:items-center",
} as const

export interface ToasterProps {
  duration?: number
  position?: keyof typeof positions
  /** Toasts visible at once; older ones leave. */
  max?: number
  /** Show a small close key on every toast. */
  closeButton?: boolean
  className?: string
}

type Live = ToastItem & { shown: boolean; dx: number }

/** Mount once near the root. Toasts spring in from the edge; swipe sideways to dismiss. */
export function Toaster({ duration = 3200, position = "bottom-center", max = 3, closeButton = false, className }: ToasterProps) {
  const [items, setItems] = React.useState<Live[]>([])
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const top = position.startsWith("top")
  const itemsRef = React.useRef(items)
  itemsRef.current = items

  const hide = React.useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, shown: false } : x)))
    timers.current.set(id, setTimeout(() => { timers.current.delete(id); setItems((xs) => xs.filter((x) => x.id !== id)) }, 450))
  }, [])

  const schedule = React.useCallback((t: ToastItem) => {
    clearTimeout(timers.current.get(t.id))
    const d = t.duration ?? duration
    if (Number.isFinite(d)) timers.current.set(t.id, setTimeout(() => hide(t.id), d))
  }, [duration, hide])

  React.useEffect(() => {
    const fn = (e: Event) => {
      if (e.type === "dismiss") {
        if (e.id === undefined) itemsRef.current.forEach((x) => hide(x.id))
        else hide(e.id)
        return
      }
      const t = e.item
      setItems((xs) => {
        const existing = xs.find((x) => x.id === t.id)
        if (existing) return xs.map((x) => (x.id === t.id ? { ...x, ...t, loading: t.loading ?? false, shown: true } : x))
        return [...xs, { ...t, shown: false, dx: 0 }]
      })
      setTimeout(() => setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, shown: true } : x))), 32)
      schedule(t)
    }
    subs.add(fn)
    const map = timers.current
    return () => { subs.delete(fn); map.forEach(clearTimeout); map.clear() }
  }, [schedule, hide])

  // Keep only the newest `max` visible.
  React.useEffect(() => {
    const live = items.filter((x) => x.shown)
    if (live.length > max) live.slice(0, live.length - max).forEach((x) => hide(x.id))
  }, [items, max, hide])

  return (
    <section aria-label="Notifications" className={cn("pointer-events-none fixed z-[70] flex gap-2 px-4", positions[position], className)}>
      <ol className={cn("m-0 flex w-full max-w-sm list-none gap-2 p-0", top ? "flex-col-reverse" : "flex-col")} role="status" aria-live="polite">
        {items.map((t) => (
          <ToastCard key={t.id} t={t} top={top} closeButton={closeButton} onClose={() => hide(t.id)} onPause={() => clearTimeout(timers.current.get(t.id))} onResume={() => schedule(t)} />
        ))}
      </ol>
    </section>
  )
}

function ToastCard({ t, top, closeButton, onClose, onPause, onResume }: { t: Live; top: boolean; closeButton: boolean; onClose: () => void; onPause: () => void; onResume: () => void }) {
  const [dx, setDx] = React.useState(0)
  const start = React.useRef<number | null>(null)
  return (
    <li
      onPointerEnter={onPause}
      onPointerLeave={onResume}
      onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; start.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current) }}
      onPointerUp={() => { start.current = null; if (Math.abs(dx) > 80) onClose(); else setDx(0) }}
      onPointerCancel={() => { start.current = null; setDx(0) }}
      className={cn(
        "pointer-events-auto flex touch-pan-y items-start gap-3 rounded-[16px] bg-surface px-4 py-3 text-[13px] shadow-raised",
        start.current === null && "transition-[translate,opacity,scale] duration-[450ms] ease-spring",
        t.shown ? "opacity-100" : "opacity-0",
      )}
      style={{ translate: t.shown ? `${dx}px 0` : `0 ${top ? "-140%" : "140%"}`, opacity: t.shown ? Math.max(0.2, 1 - Math.abs(dx) / 200) : 0, scale: t.shown ? "1" : "0.96" }}
    >
      <span className="mt-[5px] grid size-[9px] shrink-0 place-items-center">
        {t.loading ? <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-glow border-t-transparent" /> : <StatusLamp tone={t.tone ?? "glow"} steady />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium leading-snug">{t.message}</div>
        {t.description && <div className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.description}</div>}
      </div>
      {t.action && (
        <button
          type="button"
          onClick={() => { t.action!.onClick(); onClose() }}
          className="h-7 shrink-0 cursor-pointer self-center rounded-lg bg-bg px-2.5 text-xs font-medium text-glow-ink shadow-inset-sm transition-[scale] duration-200 ease-spring active:scale-95"
        >
          {t.action.label}
        </button>
      )}
      {closeButton && (
        <button type="button" aria-label="Dismiss" onClick={onClose} className="-mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted hover:text-ink">
          <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="m3 3 6 6M9 3 3 9" /></svg>
        </button>
      )}
    </li>
  )
}
