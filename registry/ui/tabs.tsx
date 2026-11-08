"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Ctx = { value: string; set: (v: string) => void; base: string }
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect
const TabsCtx = React.createContext<Ctx | null>(null)
const useTabs = () => {
  const c = React.useContext(TabsCtx)
  if (!c) throw new Error("Tabs parts must be used inside <Tabs>")
  return c
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string
  defaultValue: string
  onValueChange?: (v: string) => void
}

export function Tabs({ value, defaultValue, onValueChange, className, ...props }: TabsProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const v = value ?? inner
  const base = React.useId()
  const set = React.useCallback((n: string) => { setInner(n); onValueChange?.(n) }, [onValueChange])
  return (
    <TabsCtx.Provider value={{ value: v, set, base }}>
      <div className={cn("flex flex-col gap-4", className)} {...props} />
    </TabsCtx.Provider>
  )
}

/** Recessed tab rail; a raised thumb springs to the active tab. */
export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { value } = useTabs()
  const ref = React.useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = React.useState({ left: 0, width: 0, ready: false })

  const place = React.useCallback(() => {
    const el = ref.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
  }, [])
  useIsoLayoutEffect(place, [value, place])
  React.useEffect(() => {
    const ro = new ResizeObserver(place)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [place])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return
    e.preventDefault()
    const tabs = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [])
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement)
    const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    tabs[n]?.focus()
    tabs[n]?.click()
  }

  return (
    <div
      ref={ref}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn("relative inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-[14px] bg-bg p-1 shadow-inset-sm scrollbar-none", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("absolute bottom-1 top-1 rounded-[10px] bg-raise shadow-raised-sm transition-[left,width] duration-[450ms] ease-spring", !thumb.ready && "opacity-0")}
        style={{ left: thumb.left, width: thumb.width }}
      />
      {children}
    </div>
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const t = useTabs()
  const on = t.value === value
  return (
    <button
      type="button"
      role="tab"
      id={`${t.base}-t-${value}`}
      aria-controls={`${t.base}-p-${value}`}
      aria-selected={on}
      tabIndex={on ? 0 : -1}
      onClick={() => t.set(value)}
      className={cn(
        "relative z-10 flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 [&_svg]:size-4",
        on ? "text-ink" : "text-muted hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
      {on && <span className="size-1 rounded-full bg-glow shadow-[0_0_6px_var(--hc-glow)]" />}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const t = useTabs()
  if (t.value !== value) return null
  return (
    <div
      role="tabpanel"
      id={`${t.base}-p-${value}`}
      aria-labelledby={`${t.base}-t-${value}`}
      tabIndex={0}
      className={cn("animate-hc-rise outline-none", className)}
      {...props}
    />
  )
}
