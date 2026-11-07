"use client"

/**
 * Small, dependency-free overlay toolkit used by Dialog, Sheet, Popover,
 * Tooltip, DropdownMenu, Select and Command.
 */
import * as React from "react"
import { createPortal } from "react-dom"

export const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

const noopSubscribe = () => () => {}

/**
 * Render into document.body on the client only (SSR safe). On the client the
 * portal content mounts in the same commit as its parent, so refs to it are
 * ready when the parent's effects run (positioning, focus).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const isClient = React.useSyncExternalStore(noopSubscribe, () => true, () => false)
  return isClient ? createPortal(children, document.body) : null
}

/**
 * Keeps an element mounted long enough to play its exit animation.
 * `visible` flips one frame after mount so CSS transitions can run.
 */
export function usePresence(open: boolean, exitMs = 220) {
  const [mounted, setMounted] = React.useState(open)
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(r)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), exitMs)
    return () => clearTimeout(t)
  }, [open, exitMs])
  return { mounted, visible }
}

/** Controlled / uncontrolled open state. */
export function useOpenState(open?: boolean, defaultOpen = false, onOpenChange?: (o: boolean) => void) {
  const [inner, setInner] = React.useState(defaultOpen)
  const value = open ?? inner
  const set = React.useCallback((o: boolean) => { setInner(o); onOpenChange?.(o) }, [onOpenChange])
  return [value, set] as const
}

/** Close on Escape and on pointer down outside the given elements. */
export function useDismiss(open: boolean, onClose: () => void, refs: React.RefObject<HTMLElement | null>[], { outside = true } = {}) {
  const close = React.useRef(onClose)
  close.current = onClose
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close.current() } }
    const onDown = (e: PointerEvent) => {
      if (!outside) return
      const t = e.target as Node
      if (refs.some((r) => r.current?.contains(t))) return
      close.current()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, outside])
}

/** Lock page scroll while a modal is open (keeps layout from jumping). */
export function useScrollLock(locked: boolean) {
  useIsoLayoutEffect(() => {
    if (!locked) return
    const { body, documentElement: html } = document
    // Nested modals: only the first lock does the work.
    const count = Number(html.dataset.hcLocks ?? 0)
    html.dataset.hcLocks = String(count + 1)
    if (count > 0) return () => { html.dataset.hcLocks = String(Number(html.dataset.hcLocks) - 1) }

    const gap = window.innerWidth - html.clientWidth
    // halcyon.css sets scrollbar-gutter: stable, which keeps the space reserved.
    const gutterStable = getComputedStyle(html).scrollbarGutter?.includes("stable")
    const prev = { overflow: html.style.overflow, pad: body.style.paddingRight }
    html.style.overflow = "hidden"
    if (gap > 0 && !gutterStable) body.style.paddingRight = `${gap}px`
    return () => {
      html.style.overflow = prev.overflow
      body.style.paddingRight = prev.pad
      delete html.dataset.hcLocks
    }
  }, [locked])
}

/** Trap Tab focus inside a container and restore focus on close. */
export function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!active) return
    const prev = document.activeElement as HTMLElement | null
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
    const t = setTimeout(() => {
      const el = ref.current
      if (!el) return
      const auto = el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>(sel)
      ;(auto ?? el).focus({ preventScroll: true })
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(sel)).filter((n) => n.offsetParent !== null)
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); prev?.focus?.({ preventScroll: true }) }
  }, [active, ref])
}

export type Side = "top" | "bottom" | "left" | "right"
export type Align = "start" | "center" | "end"

/**
 * Position a floating element next to an anchor (fixed positioning).
 * Flips to the other side when there is no room and stays inside the viewport.
 */
export function useAnchorPosition(
  open: boolean,
  anchor: React.RefObject<HTMLElement | null>,
  floating: React.RefObject<HTMLElement | null>,
  { side = "bottom", align = "center", offset = 8, matchWidth = false }: { side?: Side; align?: Align; offset?: number; matchWidth?: boolean } = {},
) {
  const [pos, setPos] = React.useState<{ top: number; left: number; side: Side; width?: number; origin: string }>({ top: -9999, left: -9999, side, origin: "center" })

  const update = React.useCallback(() => {
    const a = anchor.current, f = floating.current
    if (!a || !f) return
    const ar = a.getBoundingClientRect()
    const fw = matchWidth ? ar.width : f.offsetWidth
    const fh = f.offsetHeight
    const vw = window.innerWidth, vh = window.innerHeight, pad = 8
    let s = side
    if (s === "bottom" && ar.bottom + offset + fh > vh - pad && ar.top - offset - fh > pad) s = "top"
    else if (s === "top" && ar.top - offset - fh < pad && ar.bottom + offset + fh < vh - pad) s = "bottom"
    else if (s === "right" && ar.right + offset + fw > vw - pad) s = "left"
    else if (s === "left" && ar.left - offset - fw < pad) s = "right"

    let top = 0, left = 0
    const along = (start: number, size: number, fsize: number) =>
      align === "start" ? start : align === "end" ? start + size - fsize : start + size / 2 - fsize / 2
    if (s === "bottom" || s === "top") {
      top = s === "bottom" ? ar.bottom + offset : ar.top - offset - fh
      left = along(ar.left, ar.width, fw)
    } else {
      left = s === "right" ? ar.right + offset : ar.left - offset - fw
      top = along(ar.top, ar.height, fh)
    }
    left = Math.min(Math.max(pad, left), vw - fw - pad)
    top = Math.min(Math.max(pad, top), vh - fh - pad)
    const origin = s === "bottom" ? "top" : s === "top" ? "bottom" : s === "left" ? "right" : "left"
    setPos({ top, left, side: s, width: matchWidth ? ar.width : undefined, origin })
  }, [anchor, floating, side, align, offset, matchWidth])

  useIsoLayoutEffect(() => {
    if (!open) return
    update()
    const r = requestAnimationFrame(update)
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    const ro = new ResizeObserver(update)
    if (floating.current) ro.observe(floating.current)
    return () => {
      cancelAnimationFrame(r)
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
      ro.disconnect()
    }
  }, [open, update])

  return pos
}

/** Merge several refs into one callback ref. */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const r of refs) {
      if (typeof r === "function") r(node)
      else if (r) (r as React.MutableRefObject<T | null>).current = node
    }
  }
}

/** Base classes for floating panels (popover, dropdown, select, tooltip). */
export const panelClass =
  "rounded-2xl bg-surface p-1.5 text-ink shadow-[0_18px_40px_-8px_var(--hc-sh-dark),8px_8px_20px_var(--hc-sh-dark),-4px_-4px_12px_var(--hc-sh-light),inset_0_1px_0_var(--hc-sh-light)] transition-[opacity,scale,translate] duration-200 ease-spring"
