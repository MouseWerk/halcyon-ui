import * as React from "react"
import { cn } from "@/lib/utils"
import { DotIcon } from "@/components/ui/dot-icon"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { Kbd } from "@/components/ui/kbd"
import { href } from "../router"
import { IconGithub, IconMenu, IconSearch } from "./icons"
import { Sheet } from "@/components/ui/sheet"
import { CommandPalette } from "@/components/ui/command"
import { catalog } from "./catalog"

export const REPO = "https://github.com/MouseWerk/halcyon-ui"
export const NPX = "npx github:MouseWerk/halcyon-ui"
/** shadcn-compatible registry (built into /r on deploy). */
export const SHADCN_REGISTRY = "https://mousewerk.github.io/halcyon-ui/r"

export function Logo({ className }: { className?: string }) {
  const [hover, setHover] = React.useState(false)
  return (
    <a
      href={href("/")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}
    >
      <span className="grid size-9 place-items-center rounded-[11px] bg-bg shadow-inset-sm">
        <DotIcon icon={hover ? "bolt" : "diamond"} size={20} />
      </span>
      <span>Halcyon<span className="text-muted"> UI</span></span>
    </a>
  )
}

export function Header({ route }: { route: string }) {
  const links = [
    { to: "/docs", label: "Docs" },
    { to: "/docs/components/theme-switch", label: "Components" },
    { to: "/examples/dashboard", label: "Examples" },
  ]
  const [scrolled, setScrolled] = React.useState(false)
  const [search, setSearch] = React.useState(false)
  const [menu, setMenu] = React.useState(false)
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled && "bg-bg/95 shadow-[0_1px_0_var(--hc-line)]",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-3 px-[max(16px,env(safe-area-inset-left))] sm:gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = route === l.to || (l.label === "Docs" && route.startsWith("/docs") && !route.startsWith("/docs/components")) ||
              (l.label === "Components" && route.startsWith("/docs/components")) || (l.label === "Examples" && route.startsWith("/examples"))
            return (
              <a
                key={l.to}
                href={href(l.to)}
                className={cn(
                  "rounded-[10px] px-3 py-1.5 text-[13.5px] font-medium transition-[color,background-color,box-shadow] duration-300",
                  active ? "bg-raise text-ink shadow-raised-sm" : "text-muted hover:text-ink",
                )}
              >
                {l.label}
              </a>
            )
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => setSearch(true)} className="hidden cursor-pointer items-center gap-2 rounded-xl bg-bg px-3 py-2 text-[13px] text-muted shadow-inset-sm transition-colors hover:text-ink lg:flex">
            <IconSearch className="size-3.5" /> Search docs <Kbd>Ctrl K</Kbd>
          </button>
          <button type="button" aria-label="Search" onClick={() => setSearch(true)} className="grid size-10 cursor-pointer place-items-center rounded-[13px] bg-bg text-muted shadow-inset-sm lg:hidden [&_svg]:size-4"><IconSearch /></button>
          <CommandPalette
            open={search}
            onOpenChange={setSearch}
            placeholder="Search docs"
            items={[
              ...[["Introduction", "/docs"], ["Installation", "/docs/installation"], ["Frameworks", "/docs/frameworks"], ["Theming", "/docs/theming"], ["CLI", "/docs/cli"], ["Dashboard example", "/examples/dashboard"]].map(([l, to]) => ({
                id: to, label: l, group: "Guides", onSelect: () => { location.hash = to },
              })),
              ...catalog.map((d) => ({ id: d.name, label: d.title, group: d.group, keywords: [d.name], onSelect: () => { location.hash = `/docs/components/${d.name}` } })),
            ]}
          />
          <a href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub" className="max-md:hidden grid size-10 place-items-center rounded-[13px] bg-surface text-ink shadow-key transition-transform duration-200 ease-spring active:scale-95 [&_svg]:size-[18px]">
            <IconGithub />
          </a>
          <ThemeSwitch size="sm" />
          <Sheet
            side="right"
            title="Halcyon UI"
            open={menu}
            onOpenChange={setMenu}
            trigger={<button type="button" aria-label="Menu" className="grid size-10 cursor-pointer place-items-center rounded-[13px] bg-surface shadow-key transition-[scale] duration-200 ease-spring active:scale-95 md:hidden [&_svg]:size-[18px]"><IconMenu /></button>}
          >
            <nav className="flex flex-col gap-1.5 rounded-[18px] bg-bg p-1.5 shadow-inset">
              {links.map((l) => (
                <a key={l.to} href={href(l.to)} onClick={() => setMenu(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-colors hover:bg-raise">
                  {l.label}<span className="size-1.5 rounded-full bg-dot-off" />
                </a>
              ))}
              <a href={REPO} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-colors hover:bg-raise">GitHub<IconGithub className="size-4 text-muted" /></a>
            </nav>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-6 px-[max(20px,env(safe-area-inset-left))] py-10 text-[13px] text-muted">
        <Logo />
        <p className="m-0">Components you copy, own and change. MIT licensed.</p>
        <div className="ml-auto flex gap-5">
          <a className="hover:text-ink" href={href("/docs")}>Docs</a>
          <a className="hover:text-ink" href={href("/docs/components/theme-switch")}>Components</a>
          <a className="hover:text-ink" href={REPO} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
