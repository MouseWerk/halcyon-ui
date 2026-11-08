"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal, useDismiss, useFocusTrap, usePresence, useScrollLock } from "@/lib/overlay"

type Ctx = {
  /** Desktop: expanded (true) or collapsed to icons (false). */
  open: boolean
  setOpen: (o: boolean) => void
  /** Phone: off-canvas panel visible. */
  openMobile: boolean
  setOpenMobile: (o: boolean) => void
  isMobile: boolean
  toggle: () => void
}
const SidebarCtx = React.createContext<Ctx | null>(null)
export function useSidebar() {
  const c = React.useContext(SidebarCtx)
  if (!c) throw new Error("useSidebar must be used inside <SidebarProvider>")
  return c
}

const MOBILE = "(max-width: 767px)"
const subscribeMq = (cb: () => void) => { const m = matchMedia(MOBILE); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb) }

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Remember the collapsed state in localStorage under this key. Set false to disable. */
  storageKey?: string | false
  /** Ctrl/Cmd + this key toggles the sidebar. Set false to disable. */
  shortcut?: string | false
}

/**
 * App shell: a sidebar next to your content. On desktop it collapses to an
 * icon rail (Ctrl/Cmd + B); on phones it becomes an off-canvas panel.
 */
export function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange, storageKey = "hc-sidebar", shortcut = "b", className, children, ...props }: SidebarProviderProps) {
  const isMobile = React.useSyncExternalStore(subscribeMq, () => matchMedia(MOBILE).matches, () => false)
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const [openMobile, setOpenMobile] = React.useState(false)

  React.useEffect(() => {
    if (!storageKey) return
    try { const v = localStorage.getItem(storageKey); if (v === "0" || v === "1") setInner(v === "1") } catch { /* ignore */ }
  }, [storageKey])

  const setOpen = React.useCallback((o: boolean) => {
    setInner(o)
    onOpenChange?.(o)
    if (storageKey) try { localStorage.setItem(storageKey, o ? "1" : "0") } catch { /* ignore */ }
  }, [onOpenChange, storageKey])
  const toggle = React.useCallback(() => (isMobile ? setOpenMobile((o) => !o) : setOpen(!open)), [isMobile, open, setOpen])

  React.useEffect(() => {
    if (!shortcut) return
    const on = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut) { e.preventDefault(); toggle() } }
    window.addEventListener("keydown", on)
    return () => window.removeEventListener("keydown", on)
  }, [shortcut, toggle])

  return (
    <SidebarCtx.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggle }}>
      <div className={cn("flex min-h-dvh w-full", className)} {...props}>{children}</div>
    </SidebarCtx.Provider>
  )
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  side?: "left" | "right"
}

export function Sidebar({ side = "left", className, children, ...props }: SidebarProps) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar()
  const panel = React.useRef<HTMLElement>(null)
  const { mounted, visible } = usePresence(isMobile && openMobile, 380)
  useScrollLock(isMobile && mounted)
  useFocusTrap(isMobile && openMobile, panel)
  useDismiss(isMobile && openMobile, () => setOpenMobile(false), [panel])

  const inner = (collapsed: boolean) => (
    <div data-state={collapsed ? "collapsed" : "expanded"} className="group/sidebar flex h-full min-h-0 flex-col gap-3 p-2.5">{children}</div>
  )

  if (isMobile) {
    if (!mounted) return null
    return (
      <Portal>
        <div className="fixed inset-0 z-50">
          <div aria-hidden="true" className={cn("absolute inset-0 bg-[color-mix(in_oklab,var(--hc-bg)_72%,transparent)] transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")} />
          <aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Sidebar"
            tabIndex={-1}
            className={cn(
              "absolute inset-y-2 w-[min(288px,calc(100%-48px))] rounded-[24px] bg-surface shadow-raised outline-none transition-[translate] duration-[380ms] ease-spring",
              side === "left" ? "left-2" : "right-2",
              visible ? "translate-x-0" : side === "left" ? "-translate-x-[110%]" : "translate-x-[110%]",
              className,
            )}
            {...props}
          >
            {inner(false)}
          </aside>
        </div>
      </Portal>
    )
  }

  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh max-h-full shrink-0 self-start overflow-hidden p-2 transition-[width] duration-500 ease-spring",
        open ? "w-64" : "w-[76px]",
        side === "right" && "order-last",
        className,
      )}
      {...props}
    >
      <div className="h-full rounded-[22px] bg-surface shadow-raised">{inner(!open)}</div>
    </aside>
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden px-1 scrollbar-none", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2", className)} {...props} />
}

export function SidebarGroup({ label, className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { label?: React.ReactNode }) {
  return (
    <div role="group" className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && (
        <div className="h-4 overflow-hidden px-2.5 font-mono text-[10px] uppercase tracking-[.16em] text-muted transition-opacity duration-300 group-data-[state=collapsed]/sidebar:opacity-0">
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("m-0 flex list-none flex-col gap-1 rounded-2xl bg-bg p-1.5 shadow-inset", className)} {...props} />
}

export interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  active?: boolean
  /** Count chip, hidden when collapsed (a dot shows instead). */
  badge?: React.ReactNode
  /** Accessible name and hover hint when collapsed to icons. */
  tooltip?: string
  href?: string
  /**
   * Component used to render `href` rows, e.g. Next.js `Link` for client-side
   * navigation. Defaults to a plain `<a>`.
   */
  linkAs?: React.ElementType
  /** Opens something outside the app: no LED, since the LED marks the current page. */
  external?: boolean
}

/** Menu row. Active rows rise out of the rail and light their LED; collapsed rows show only the icon. */
export function SidebarMenuButton({ icon, active, badge, tooltip, href, linkAs: LinkComp = "a", external: externalProp, className, children, onClick, ...props }: SidebarMenuButtonProps) {
  const { isMobile, setOpenMobile, open } = useSidebar()
  const collapsed = !isMobile && !open
  const cls = cn(
    "relative flex w-full cursor-pointer items-center gap-2.5 rounded-[11px] px-2.5 py-[9px] text-left text-[13.5px] font-medium",
    "transition-[color,background-color,box-shadow,scale] duration-300 ease-out-soft active:scale-[.97]",
    "[&_svg]:size-[17px] [&_svg]:shrink-0 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0",
    active ? "bg-raise text-ink shadow-raised-sm" : "text-muted hover:text-ink",
    className,
  )
  // Links that leave the app get no LED: it marks the current page
  const external = externalProp || (!!href && /^[a-z][a-z0-9+.-]*:/i.test(href))
  const body = (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:sr-only">{children}</span>
      {badge !== undefined ? (
        <span className="rounded-full bg-bg px-[7px] py-px font-mono text-[11px] shadow-inset-sm group-data-[state=collapsed]/sidebar:absolute group-data-[state=collapsed]/sidebar:right-1.5 group-data-[state=collapsed]/sidebar:top-1 group-data-[state=collapsed]/sidebar:size-1.5 group-data-[state=collapsed]/sidebar:bg-glow group-data-[state=collapsed]/sidebar:p-0 group-data-[state=collapsed]/sidebar:text-[0px] group-data-[state=collapsed]/sidebar:shadow-[0_0_6px_var(--hc-glow)]">{badge}</span>
      ) : external ? null : (
        <i className={cn("size-1.5 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300 group-data-[state=collapsed]/sidebar:hidden", active ? "bg-glow shadow-[0_0_8px_var(--hc-glow),0_0_16px_var(--hc-glow-soft)]" : "bg-dot-off")} />
      )}
    </>
  )
  const common = {
    "aria-current": active ? ("page" as const) : undefined,
    title: collapsed ? tooltip : undefined,
    className: cls,
  }
  const after = () => { if (isMobile) setOpenMobile(false) }
  return (
    <li>
      {href ? (
        <LinkComp href={href} {...common} onClick={after}>{body}</LinkComp>
      ) : (
        <button type="button" {...common} onClick={(e) => { onClick?.(e); after() }} {...props}>{body}</button>
      )}
    </li>
  )
}

export function SidebarSeparator({ className }: { className?: string }) {
  return <li role="separator" className={cn("mx-2 my-1 h-px list-none bg-line", className)} />
}

/** Key that toggles the sidebar (collapses on desktop, opens the panel on phones). */
export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle, open, isMobile, openMobile } = useSidebar()
  const expanded = isMobile ? openMobile : open
  return (
    <button
      type="button"
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      onClick={toggle}
      className={cn("grid size-9 shrink-0 cursor-pointer place-items-center rounded-[11px] bg-surface text-muted shadow-key transition-[scale,box-shadow,color] duration-200 ease-spring hover:text-ink active:scale-90 active:shadow-inset-sm", className)}
      {...props}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></svg>
    </button>
  )
}

/** The main content area next to the sidebar. */
export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <main className={cn("min-w-0 flex-1", className)} {...props} />
}
