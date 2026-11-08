"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, usePresence, useScrollLock } from "@/lib/overlay"

export interface CommandItem {
  id: string
  label: string
  group?: string
  icon?: React.ReactNode
  shortcut?: string
  keywords?: string[]
  onSelect: () => void
}

export interface CommandPaletteProps {
  items: CommandItem[]
  open?: boolean
  onOpenChange?: (o: boolean) => void
  /** Global shortcut, default Ctrl/Cmd + K. Set false to disable. */
  hotkey?: string | false
  placeholder?: string
}

function score(item: CommandItem, q: string) {
  if (!q) return 1
  const hay = [item.label, item.group ?? "", ...(item.keywords ?? [])].join(" ").toLowerCase()
  const s = q.toLowerCase()
  if (hay.startsWith(s)) return 3
  if (hay.includes(s)) return 2
  let i = 0
  for (const ch of hay) if (ch === s[i]) i++
  return i === s.length ? 1 : 0
}

/** Ctrl/Cmd + K command palette with fuzzy search, groups and keyboard control. */
export function CommandPalette({ items, open, onOpenChange, hotkey = "k", placeholder = "Type a command or search" }: CommandPaletteProps) {
  const [inner, setInner] = React.useState(false)
  const o = open ?? inner
  const setO = React.useCallback((v: boolean) => { setInner(v); onOpenChange?.(v) }, [onOpenChange])
  const [q, setQ] = React.useState("")
  const [active, setActive] = React.useState(0)
  const panel = React.useRef<HTMLDivElement>(null)
  const list = React.useRef<HTMLDivElement>(null)
  const { mounted, visible } = usePresence(o, 220)
  useScrollLock(mounted)
  useFocusTrap(o, panel)
  useDismiss(o, () => setO(false), [panel])

  React.useEffect(() => {
    if (!hotkey) return
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === hotkey) { e.preventDefault(); setO(!o) }
    }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [hotkey, o, setO])

  React.useEffect(() => { if (o) { setQ(""); setActive(0) } }, [o])

  const results = React.useMemo(
    () => items.map((it) => ({ it, s: score(it, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.it),
    [items, q],
  )
  const groups = React.useMemo(() => {
    const m = new Map<string, CommandItem[]>()
    results.forEach((r) => { const g = r.group ?? ""; m.set(g, [...(m.get(g) ?? []), r]) })
    return [...m.entries()]
  }, [results])
  const flat = groups.flatMap(([, xs]) => xs)

  React.useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const pick = (it?: CommandItem) => { if (!it) return; setO(false); it.onSelect() }

  if (!mounted) return null
  let idx = -1
  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[14vh]">
        <div aria-hidden="true" className={cn("absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_72%,transparent)] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className={cn(
            "relative flex max-h-[min(520px,70vh)] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-surface p-2",
            "shadow-[0_30px_80px_-20px_var(--hc-sh-dark),8px_8px_24px_var(--hc-sh-dark),inset_0_1px_0_var(--hc-sh-light)]",
            "transition-[opacity,scale,translate] duration-300 ease-spring",
            visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-3 scale-95 opacity-0",
          )}
        >
          <label className="flex items-center gap-3 rounded-2xl bg-bg px-4 py-3 shadow-inset">
            <svg viewBox="0 0 24 24" className="size-[18px] shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              data-autofocus
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0) }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)) }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
                if (e.key === "Enter") { e.preventDefault(); pick(flat[active]) }
              }}
              placeholder={placeholder}
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            <kbd className="rounded-md bg-surface px-1.5 font-mono text-[11px] text-muted shadow-[1px_1px_2px_var(--hc-sh-dark),-1px_-1px_2px_var(--hc-sh-light)]">Esc</kbd>
          </label>
          <div ref={list} role="listbox" className="mt-2 overflow-y-auto px-1 pb-1">
            {flat.length === 0 && <div className="px-3 py-10 text-center text-sm text-muted">No results for "{q}"</div>}
            {groups.map(([g, xs]) => (
              <div key={g || "_"} className="mb-1">
                {g && <div className="px-3 pb-1 pt-2.5 font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{g}</div>}
                {xs.map((it) => {
                  idx++
                  const i = idx
                  return (
                    <div
                      key={it.id}
                      role="option"
                      data-index={i}
                      aria-selected={i === active}
                      onPointerMove={() => setActive(i)}
                      onClick={() => pick(it)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-100 [&_svg]:size-4 [&_svg]:text-muted",
                        i === active && "bg-bg shadow-inset-sm [&_svg]:text-glow-ink",
                      )}
                    >
                      {it.icon}
                      <span className="flex-1">{it.label}</span>
                      {it.shortcut && <span className="font-mono text-[11px] text-muted">{it.shortcut}</span>}
                      {i === active && <span className="size-1.5 rounded-full bg-glow shadow-[0_0_6px_var(--hc-glow)]" />}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Portal>
  )
}
