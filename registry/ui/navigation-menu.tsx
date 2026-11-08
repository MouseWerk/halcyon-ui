"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { panelClass } from "@/lib/overlay"

export interface NavLink {
  label: React.ReactNode
  href: string
  description?: React.ReactNode
  icon?: React.ReactNode
}

export interface NavigationMenuItem {
  label: React.ReactNode
  /** A plain link... */
  href?: string
  /** ...or a panel: a list of links or any content. */
  links?: NavLink[]
  content?: React.ReactNode
  /** Columns for the link grid. */
  columns?: 1 | 2
  active?: boolean
}

export interface NavigationMenuProps {
  items: NavigationMenuItem[]
  className?: string
  "aria-label"?: string
}

/**
 * Site navigation with dropdown panels (mega menu). Opens on hover with a
 * short intent delay, on click and with the keyboard; a raised thumb
 * follows the open item.
 */
export function NavigationMenu({ items, className, ...aria }: NavigationMenuProps) {
  const [open, setOpen] = React.useState<number | null>(null)
  const root = React.useRef<HTMLElement>(null)
  const t = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const triggers = React.useRef<(HTMLElement | null)[]>([])
  const [thumb, setThumb] = React.useState<{ left: number; width: number } | null>(null)

  const openAt = (i: number | null, delay = 0) => {
    clearTimeout(t.current)
    t.current = setTimeout(() => setOpen(i), delay)
  }
  React.useEffect(() => () => clearTimeout(t.current), [])

  React.useEffect(() => {
    if (open === null) return
    const el = triggers.current[open]
    if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth })
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); triggers.current[open]?.focus() } }
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])

  const current = open !== null ? items[open] : null

  return (
    <nav
      ref={root}
      aria-label={aria["aria-label"] ?? "Main"}
      className={cn("relative", className)}
      onPointerLeave={(e) => e.pointerType === "mouse" && openAt(null, 200)}
    >
      <ul
        className="relative m-0 flex list-none items-center gap-1 rounded-[14px] bg-bg p-1 shadow-inset-sm"
        onKeyDown={(e) => {
          const i = triggers.current.indexOf(document.activeElement as HTMLElement)
          if (i < 0) return
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault()
            const n = (i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length
            triggers.current[n]?.focus()
            if (open !== null) setOpen(items[n].href ? null : n)
          } else if (e.key === "ArrowDown" && !items[i].href) {
            e.preventDefault()
            setOpen(i)
            requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("[data-nav-panel] a")?.focus())
          }
        }}
      >
        <span
          aria-hidden="true"
          className={cn("absolute bottom-1 top-1 rounded-[10px] bg-raise shadow-raised-sm transition-[left,width,opacity] duration-[400ms] ease-spring", open === null && "opacity-0")}
          style={thumb ?? { left: 0, width: 0 }}
        />
        {items.map((it, i) => {
          const cls = cn(
            "relative z-10 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
            open === i || it.active ? "text-ink" : "text-muted hover:text-ink",
          )
          return (
            <li key={i}>
              {it.href ? (
                <a ref={(n) => { triggers.current[i] = n }} href={it.href} aria-current={it.active ? "page" : undefined} className={cls} onPointerEnter={(e) => e.pointerType === "mouse" && openAt(null, 120)}>
                  {it.label}
                </a>
              ) : (
                <button
                  ref={(n) => { triggers.current[i] = n }}
                  type="button"
                  aria-expanded={open === i}
                  onClick={() => openAt(open === i ? null : i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && openAt(i, open === null ? 120 : 0)}
                  className={cls}
                >
                  {it.label}
                  <svg aria-hidden="true" viewBox="0 0 12 12" className={cn("size-2.5 transition-transform duration-300 ease-spring", open === i && "rotate-180 text-glow-ink")} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m3 4.5 3 3 3-3" /></svg>
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {current && !current.href && (
        <div
          data-nav-panel
          onPointerEnter={() => clearTimeout(t.current)}
          className={cn(panelClass, "absolute left-0 top-[calc(100%+8px)] z-50 w-[min(560px,calc(100vw-32px))] origin-top-left animate-hc-pop p-2")}
        >
          {current.content ?? (
            <ul className={cn("m-0 grid list-none gap-1 p-0", current.columns === 2 && "sm:grid-cols-2")}>
              {current.links?.map((l, k) => (
                <li key={k}>
                  <a href={l.href} onClick={() => setOpen(null)} className="flex gap-3 rounded-xl p-3 transition-[background-color,box-shadow] duration-200 hover:bg-bg hover:shadow-inset-sm focus-visible:bg-bg">
                    {l.icon && <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-bg shadow-inset-sm [&_svg]:size-4 [&_svg]:text-glow-ink">{l.icon}</span>}
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium">{l.label}</span>
                      {l.description && <span className="mt-0.5 block text-xs leading-snug text-muted">{l.description}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </nav>
  )
}
