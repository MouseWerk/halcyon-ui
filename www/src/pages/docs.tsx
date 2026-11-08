import * as React from "react"
import { cn } from "@/lib/utils"
import { Segmented } from "@/components/ui/segmented"
import { Badge } from "@/components/ui/badge"
import { DotIcon } from "@/components/ui/dot-icon"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Code, Command } from "../site/code"
import { NPX, SHADCN_REGISTRY } from "../site/shell"
import { demos, groups } from "../site/demos"
import { href } from "../router"
import { IconArrow, IconMenu, IconSearch } from "../site/icons"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet } from "@/components/ui/sheet"
import type { GlyphName } from "@/lib/dot-matrix"

// Component sources load on demand when the Code tab opens (keeps the docs chunk small).
const sources = import.meta.glob("../../../registry/ui/*.tsx", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>
function SourceCode({ name }: { name: string }) {
  const [code, setCode] = React.useState<string | null>(null)
  React.useEffect(() => {
    let live = true
    setCode(null)
    sources[`../../../registry/ui/${name}.tsx`]?.().then((c) => { if (live) setCode(c) })
    return () => { live = false }
  }, [name])
  if (code === null) return <div className="grid h-40 place-items-center rounded-2xl bg-bg shadow-inset"><Spinner /></div>
  return <div data-source={name}><Code code={code} maxHeight={520} /></div>
}
const tokensCss = (import.meta.glob("../../../registry/styles/halcyon.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>)["../../../registry/styles/halcyon.css"] ?? ""

const guides = [
  { slug: "", title: "Introduction" },
  { slug: "installation", title: "Installation" },
  { slug: "frameworks", title: "Frameworks" },
  { slug: "theming", title: "Theming" },
  { slug: "cli", title: "CLI" },
]

const groupGlyph: Record<string, GlyphName> = {
  "Getting started": "bolt", Controls: "ring", Forms: "check", Surfaces: "diamond",
  Overlays: "moon", Data: "heart", Feedback: "bell", Navigation: "sun",
}

type Section = { title: string; items: { to: string; label: string }[] }
const sections: Section[] = [
  { title: "Getting started", items: guides.map((g) => ({ to: g.slug ? `/docs/${g.slug}` : "/docs", label: g.title })) },
  ...groups.map((g) => ({
    title: g as string,
    items: demos.filter((d) => d.group === g).map((d) => ({ to: `/docs/components/${d.name}`, label: d.title })),
  })),
]

/**
 * Docs navigation in the Halcyon language: a raised panel, each section in a
 * recessed well, the current page rises out of it with a glowing LED.
 */
function SidebarContent({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  const [q, setQ] = React.useState("")
  const list = React.useRef<HTMLDivElement>(null)
  const query = q.trim().toLowerCase()
  const shown = sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !query || i.label.toLowerCase().includes(query)) }))
    .filter((s) => s.items.length)

  // Keep the current page visible inside the rail without scrolling the window.
  React.useEffect(() => {
    const box = list.current
    const el = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !el) return
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
    if (top < box.scrollTop + 24 || top > box.scrollTop + box.clientHeight - 48) {
      box.scrollTo({ top: top - box.clientHeight / 3, behavior: "smooth" })
    }
  }, [route])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Input
        icon={<IconSearch />}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter"
        aria-label="Filter pages"
        className="h-10 shrink-0"
        trailing={<span className="font-mono text-[11px] text-muted">{shown.reduce((n, s) => n + s.items.length, 0)}</span>}
      />
      <ScrollArea ref={list} className="-mx-1 min-h-0 flex-1 px-1" scrollbar="none" fadeSize={24}>
        <div className="flex flex-col gap-3 pb-2">
          {shown.map((s) => {
            const hasActive = s.items.some((i) => i.to === route)
            return (
              <div key={s.title} className="rounded-[18px] bg-bg p-1.5 shadow-inset-sm">
                <div className="flex items-center gap-2 px-2 pb-1.5 pt-1">
                  <DotIcon icon={groupGlyph[s.title] ?? "diamond"} size={13} glow={hasActive ? 0.6 : 0} className={cn("transition-opacity", !hasActive && "opacity-50")} />
                  <span className="font-mono text-[10px] uppercase tracking-[.16em] text-muted">{s.title}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted">{s.items.length}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {s.items.map((i) => {
                    const active = i.to === route
                    return (
                      <a
                        key={i.to}
                        href={href(i.to)}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-[11px] px-2.5 py-[7px] text-[13.5px]",
                          "transition-[color,background-color,box-shadow,translate] duration-300 ease-spring",
                          active
                            ? "bg-raise font-medium text-ink shadow-raised-sm"
                            : "text-muted hover:translate-x-0.5 hover:text-ink",
                        )}
                      >
                        <span className="flex-1 truncate">{i.label}</span>
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full transition-[background-color,box-shadow] duration-300",
                            active ? "bg-glow shadow-[0_0_8px_var(--hc-glow),0_0_14px_var(--hc-glow-soft)]" : "bg-transparent group-hover:bg-dot-off",
                          )}
                        />
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {!shown.length && <div className="px-3 py-8 text-center text-[13px] text-muted">Nothing matches "{q}"</div>}
        </div>
      </ScrollArea>
    </div>
  )
}

function Sidebar({ route }: { route: string }) {
  return (
    <aside className="sticky top-[88px] hidden h-[calc(100dvh-112px)] w-64 shrink-0 lg:flex">
      <div className="flex min-h-0 w-full flex-col rounded-[24px] bg-surface p-3 shadow-raised">
        <SidebarContent route={route} />
      </div>
    </aside>
  )
}

/** On small screens the same navigation lives in a sheet. */
function MobilePicker({ route }: { route: string }) {
  const [open, setOpen] = React.useState(false)
  const current = sections.flatMap((s) => s.items.map((i) => ({ ...i, section: s.title }))).find((i) => i.to === route)
  return (
    <div className="mb-6 lg:hidden">
      <Sheet
        side="left"
        open={open}
        onOpenChange={setOpen}
        title="Documentation"
        className="!p-4"
        trigger={
          <button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-surface px-3.5 py-2.5 text-left shadow-key transition-[scale] duration-200 ease-spring active:scale-[.98]">
            <IconMenu className="size-4 text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] uppercase tracking-[.14em] text-muted">{current?.section ?? "Docs"}</span>
              <span className="block truncate text-sm font-medium">{current?.label ?? "Browse"}</span>
            </span>
            <span className="size-1.5 rounded-full bg-glow shadow-[0_0_8px_var(--hc-glow)]" />
          </button>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarContent route={route} onNavigate={() => setOpen(false)} />
        </div>
      </Sheet>
    </div>
  )
}

function H1({ children, lead }: { children: React.ReactNode; lead?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h1 className="m-0 text-[clamp(32px,4vw,42px)] font-bold tracking-[-.035em]">{children}</h1>
      {lead && <p className="m-0 mt-3 max-w-[62ch] text-[16px] leading-relaxed text-muted">{lead}</p>}
    </div>
  )
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-12 text-xl font-semibold tracking-tight">{children}</h2>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="my-3 max-w-[66ch] leading-relaxed text-ink/80">{children}</p>
}
function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-bg px-1.5 py-0.5 font-mono text-[12.5px] shadow-inset-sm">{children}</code>
}

function Steps({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-8 p-0">
      {items.map((s, i) => (
        <li key={s.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4">
          <span className="grid size-10 place-items-center rounded-xl bg-surface font-dot text-lg font-extrabold shadow-raised-sm">{i + 1}</span>
          <div className="min-w-0 pt-2">
            <h3 className="m-0 mb-3 text-[15px] font-semibold">{s.title}</h3>
            {s.body}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Introduction() {
  return (
    <>
      <H1 lead="Tactile React components with soft surfaces, dot-matrix icons and springy motion. You copy them into your app, and from then on they are your code.">Introduction</H1>
      <P>Halcyon UI is not a package you add to your dependencies. It is a collection of components and a small CLI that copies their source into your project, the same way shadcn/ui works. You can read every line, change anything, and nothing breaks when a new version ships.</P>
      <H2>The design language</H2>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Raised and inset", "Every element either floats above the page or is pressed into it. Light falls from the top left."],
          ["One glow per theme", "Amber in light mode, violet in dark mode. It marks what is active, important or alive."],
          ["Dot matrix", "Icons, numbers and charts are built from dots, which makes data feel like a hardware display."],
          ["Weighted motion", "Spring easing everywhere. Keys sink, knobs stretch, cards rise in sequence."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl bg-bg p-5 shadow-inset">
            <h3 className="m-0 text-[15px] font-semibold">{t}</h3>
            <p className="m-0 mt-1.5 text-[13.5px] leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
      <H2>Next</H2>
      <a href={href("/docs/installation")} className="inline-flex items-center gap-2 font-medium text-glow-ink hover:underline">Install it in your app <IconArrow className="size-4" /></a>
    </>
  )
}

function Installation() {
  return (
    <>
      <H1 lead="Halcyon UI needs React 18 or newer and Tailwind CSS v4. Any React setup works: Vite, Next.js, Remix or Astro.">Installation</H1>
      <Steps
        items={[
          { title: "Run init in your project", body: <><Command cmd={`${NPX} init`} /><P>This writes <C>halcyon.json</C>, the design tokens, the <C>cn()</C> helper and the theme hook, and installs <C>clsx</C> and <C>tailwind-merge</C>.</P></> },
          { title: "Import the tokens after Tailwind", body: <Code code={`/* src/index.css */
@import "tailwindcss";
@import "./styles/halcyon.css";`} /> },
          { title: "Load the fonts", body: <Code code={`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Doto:wght@600;800;900&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">`} /> },
          { title: "Check your path alias", body: <><P>Components import from <C>@/components/ui</C>, <C>@/lib</C> and <C>@/hooks</C>. If your project uses another alias, set it in <C>halcyon.json</C> and the CLI rewrites the imports while copying.</P><Code code={`{
  "ui": "src/components/ui",
  "lib": "src/lib",
  "hooks": "src/hooks",
  "css": "src/styles/halcyon.css",
  "aliases": { "ui": "~/components/ui", "lib": "~/lib", "hooks": "~/hooks" }
}`} /></> },
          { title: "Add components", body: <><Command cmd={`${NPX} add theme-switch stat dot-chart`} /><P>Dependencies between components are resolved for you.</P></> },
        ]}
      />
      <H2>Already using shadcn/ui?</H2>
      <P>Every component is also published as a shadcn registry item, so the official CLI installs it into an existing shadcn project. The design tokens are merged into your CSS automatically and Halcyon components sit next to your shadcn ones.</P>
      <Command cmd={`npx shadcn@latest add ${SHADCN_REGISTRY}/sidebar.json`} />
      <P>Or register the namespace once in <C>components.json</C> and use short names:</P>
      <Code code={`{
  "registries": {
    "@halcyon": "${SHADCN_REGISTRY}/{name}.json"
  }
}`} />
      <Command cmd="npx shadcn@latest add @halcyon/knob @halcyon/data-table" />
      <P>shadcn already defines a <C>muted</C> colour, so in shadcn projects Halcyon's secondary text colour is called <C>text-hc-muted</C>. Everything else keeps its name.</P>
    </>
  )
}

function Frameworks() {
  const [fw, setFw] = React.useState<"next" | "vite" | "rr" | "astro">("next")
  return (
    <>
      <H1 lead="Every component works in any React 18+ app with Tailwind CSS v4. Interactive parts carry a &quot;use client&quot; directive, the theme hook is SSR safe and nothing touches window during render.">Frameworks</H1>
      <Segmented value={fw} onValueChange={setFw} options={[{ value: "next", label: "Next.js" }, { value: "vite", label: "Vite" }, { value: "rr", label: "React Router" }, { value: "astro", label: "Astro" }]} />
      <div key={fw} className="mt-8 animate-hc-rise">
        {fw === "next" && (
          <Steps items={[
            { title: "Create the app (skip if you have one)", body: <Command cmd="npx create-next-app@latest my-app --ts --tailwind --app --src-dir" /> },
            { title: "Initialise Halcyon", body: <><Command cmd={`${NPX} init --yes`} /><P>Detects Next.js, writes into <C>src/components/ui</C>, and adds the token import to <C>globals.css</C>.</P></> },
            { title: "Fonts, theme script and toaster in the root layout", body: <Code code={`// src/app/layout.tsx
import { Geist, Geist_Mono, Doto } from "next/font/google"
import { ThemeScript } from "@/components/ui/theme-switch"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

const sans = Geist({ subsets: ["latin"], variable: "--hc-font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--hc-font-mono" })
const dot = Doto({ subsets: ["latin"], weight: ["600", "800", "900"], variable: "--hc-font-dot" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={\`\${sans.variable} \${mono.variable} \${dot.variable}\`}>
      <head><ThemeScript /></head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`} /> },
            { title: "Use components in server or client components", body: <><Code code={`// src/app/page.tsx (a server component)
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { Stat } from "@/components/ui/stat"

export default function Page() {
  return (
    <main className="p-10">
      <ThemeSwitch />
      <Stat label="Revenue" prefix="$" value={48.2} decimals={1} suffix="k" />
    </main>
  )
}`} /><P>Pass event handlers like <C>onClick</C> only from client components, as usual in the App Router.</P></> },
          ]} />
        )}
        {fw === "vite" && (
          <Steps items={[
            { title: "Create the app and add Tailwind", body: <><Command cmd="npm create vite@latest my-app -- --template react-ts" /><Command className="mt-2" cmd="npm i tailwindcss @tailwindcss/vite" /></> },
            { title: "Configure the plugin and the @ alias", body: <Code code={`// vite.config.ts
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
})

// tsconfig.app.json -> compilerOptions
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }`} /> },
            { title: "Initialise Halcyon", body: <><Command cmd={`${NPX} init --yes`} /><P>Adds the token import to <C>src/index.css</C>.</P></> },
            { title: "Fonts and the theme script in index.html", body: <Code code={`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Doto:wght@600;800;900&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<script>/* paste themeScript from src/hooks/use-theme.ts, or: */
  try{var t=localStorage.getItem("hc-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  document.documentElement.dataset.theme=t;document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}
</script>`} /> },
          ]} />
        )}
        {fw === "rr" && (
          <Steps items={[
            { title: "Initialise Halcyon", body: <><Command cmd={`${NPX} init --yes`} /><P>Detects React Router or Remix, writes into <C>app/components/ui</C> and rewrites imports to the <C>~/</C> alias.</P></> },
            { title: "Theme script in root.tsx", body: <Code code={`// app/root.tsx
import { ThemeScript } from "~/components/ui/theme-switch"
import { Toaster } from "~/components/ui/toast"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Meta /><Links />
        <ThemeScript />
      </head>
      <body>{children}<Toaster /><ScrollRestoration /><Scripts /></body>
    </html>
  )
}`} /> },
          ]} />
        )}
        {fw === "astro" && (
          <Steps items={[
            { title: "Add React and Tailwind", body: <><Command cmd="npx astro add react" /><Command className="mt-2" cmd="npx astro add tailwind" /></> },
            { title: "Initialise Halcyon", body: <Command cmd={`${NPX} init --yes`} /> },
            { title: "Hydrate interactive components", body: <Code code={`---
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { Card } from "@/components/ui/card"
---
<Card>Static, no JS shipped</Card>
<ThemeSwitch client:load />`} /> },
          ]} />
        )}
      </div>
      <H2>Compatibility</H2>
      <div className="overflow-x-auto max-sm:[mask-image:linear-gradient(to_right,black_80%,transparent)]">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5 text-[13.5px]">
          <tbody>
            {[
              ["React", "18.2+ and 19"],
              ["Tailwind CSS", "v4 (uses @theme, @utility, @custom-variant)"],
              ["Next.js", "App Router and Pages Router, RSC safe"],
              ["Vite", "5+"],
              ["React Router / Remix", "v7 / v2"],
              ["Astro", "4+ with @astrojs/react"],
              ["Browsers", "Last 2 versions of Chrome, Edge, Safari, Firefox. View transitions degrade gracefully."],
            ].map(([a, b]) => (
              <tr key={a}><td className="w-48 rounded-l-xl bg-bg px-3 py-2.5 font-medium">{a}</td><td className="rounded-r-xl bg-bg px-3 py-2.5 text-muted">{b}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Theming() {
  const tokens = [
    ["bg", "--hc-bg", "Page background and recessed wells"],
    ["surface", "--hc-surface", "Raised cards and keys"],
    ["raise", "--hc-raise", "Highest surfaces: active nav, thumbs"],
    ["ink", "--hc-ink", "Text"],
    ["muted", "--hc-muted", "Secondary text"],
    ["glow", "--hc-glow", "The accent: LEDs, chart dots, rings"],
    ["glow-soft", "--hc-glow-soft", "Halos and focus rings"],
    ["ok / warn / bad", "--hc-ok ...", "Semantic status colors"],
  ]
  return (
    <>
      <H1 lead="Every color is a CSS variable with a light and a dark value. Tailwind utilities are mapped to them, so you can use them anywhere in your app.">Theming</H1>
      <H2>Color tokens</H2>
      <div className="overflow-x-auto max-sm:[mask-image:linear-gradient(to_right,black_80%,transparent)]">
        <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5 text-[13.5px]">
          <thead><tr className="text-left font-mono text-[10.5px] uppercase tracking-[.12em] text-muted"><th className="px-3 font-normal">Utility</th><th className="px-3 font-normal">Variable</th><th className="px-3 font-normal">Used for</th></tr></thead>
          <tbody>
            {tokens.map(([u, v, d]) => (
              <tr key={u}>
                <td className="rounded-l-xl bg-bg px-3 py-2.5 font-mono text-[12.5px]">
                  <span className="inline-flex items-center gap-2"><span className="size-3.5 rounded-[5px] shadow-raised-sm" style={{ background: `var(${v.split(" ")[0]})` }} />{u}</span>
                </td>
                <td className="bg-bg px-3 py-2.5 font-mono text-[12.5px] text-muted">{v}</td>
                <td className="rounded-r-xl bg-bg px-3 py-2.5">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H2>Surface utilities</H2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["shadow-raised", "bg-surface shadow-raised"], ["shadow-inset", "bg-bg shadow-inset"], ["shadow-glow", "bg-surface shadow-glow"]].map(([n, cls]) => (
          <div key={n} className="flex flex-col items-center gap-3">
            <div className={cn("h-24 w-full rounded-2xl", cls)} />
            <code className="font-mono text-xs text-muted">{n}</code>
          </div>
        ))}
      </div>
      <H2>Change the glow</H2>
      <P>Override the variables after the import. This turns the glow green in light mode and cyan in dark mode.</P>
      <Code code={`:root { --hc-glow: #3ccf7a; --hc-glow-ink: #1d7d47; --hc-glow-soft: rgb(60 207 122 / .38); }
:root.dark { --hc-glow: #4fd8ff; --hc-glow-ink: #9be9ff; --hc-glow-soft: rgb(79 216 255 / .4); }`} />
      <H2>Dark mode</H2>
      <P>The theme is set by a <C>dark</C> class or <C>data-theme="dark"</C> on the html element. <C>useTheme()</C> handles both and remembers the choice. Add this to your html head to avoid a flash on load:</P>
      <Code code={`<script>
  try {
    var t = localStorage.getItem("hc-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = t;
    if (t === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
</script>`} />
      <H2>Full token file</H2>
      <Code code={tokensCss} maxHeight={420} />
    </>
  )
}

function Cli() {
  return (
    <>
      <H1 lead="The CLI has no dependencies and runs straight from GitHub with npx.">CLI</H1>
      <H2>init</H2>
      <Command cmd={`${NPX} init`} />
      <P>Asks for paths (or use <C>--yes</C> for defaults), writes <C>halcyon.json</C>, the tokens, utils and theme hook.</P>
      <H2>add</H2>
      <Command cmd={`${NPX} add button card switch`} />
      <P>Copies components and the components they depend on. Existing files are skipped unless you pass <C>--overwrite</C>. <C>--all</C> adds every component.</P>
      <H2>list</H2>
      <Command cmd={`${NPX} list`} />
      <H2>Components</H2>
      <div className="grid gap-2 sm:grid-cols-2">
        {demos.map((d) => (
          <a key={d.name} href={href(`/docs/components/${d.name}`)} className="flex items-center justify-between rounded-xl bg-bg px-3.5 py-2.5 font-mono text-[12.5px] shadow-inset-sm transition-colors hover:text-glow-ink">
            {d.name}<span className="text-muted">{d.group}</span>
          </a>
        ))}
      </div>
    </>
  )
}

function ComponentPage({ name }: { name: string }) {
  const d = demos.find((x) => x.name === name)
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  React.useEffect(() => setTab("preview"), [name])
  if (!d) return <NotFound />
  const i = demos.indexOf(d)
  const prev = demos[i - 1], next = demos[i + 1]
  return (
    <>
      <div className="mb-3"><Badge surface="inset" tone="glow">{d.group}</Badge></div>
      <H1 lead={d.description}>{d.title}</H1>

      <div className="mb-4 flex items-center">
        <Segmented value={tab} onValueChange={setTab} options={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }]} />
      </div>
      {tab === "preview" ? (
        <div data-demo={d.name} className="dot-field relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[24px] bg-bg p-4 shadow-inset sm:p-8">
          <ErrorBoundary resetKeys={[name]}><d.Demo key={name} /></ErrorBoundary>
        </div>
      ) : (
        <SourceCode name={d.name} />
      )}

      <H2>Installation</H2>
      <Command cmd={`${NPX} add ${d.name}`} />
      <P>With the shadcn CLI:</P>
      <Command cmd={`npx shadcn@latest add ${SHADCN_REGISTRY}/${d.name}.json`} />

      <H2>Usage</H2>
      <Code code={d.usage} />

      {d.props.length > 0 && (
        <>
          <H2>Props</H2>
          <div className="overflow-x-auto max-sm:[mask-image:linear-gradient(to_right,black_80%,transparent)]">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-1.5 text-[13.5px]">
              <thead><tr className="text-left font-mono text-[10.5px] uppercase tracking-[.12em] text-muted"><th className="px-3 font-normal">Prop</th><th className="px-3 font-normal">Type</th><th className="px-3 font-normal">Default</th><th className="px-3 font-normal">Description</th></tr></thead>
              <tbody>
                {d.props.map((p) => (
                  <tr key={p.name}>
                    <td className="rounded-l-xl bg-bg px-3 py-2.5 font-mono text-[12.5px] text-glow-ink">{p.name}</td>
                    <td className="bg-bg px-3 py-2.5 font-mono text-[12px] text-muted">{p.type}</td>
                    <td className="bg-bg px-3 py-2.5 font-mono text-[12px]">{p.default ?? "-"}</td>
                    <td className="rounded-r-xl bg-bg px-3 py-2.5">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-16 flex justify-between gap-4">
        {prev ? <a href={href(`/docs/components/${prev.name}`)} className="rounded-xl bg-surface px-4 py-3 text-sm shadow-raised-sm transition-transform duration-300 ease-spring hover:-translate-x-0.5"><span className="block font-mono text-[11px] text-muted">Previous</span>{prev.title}</a> : <span />}
        {next && <a href={href(`/docs/components/${next.name}`)} className="rounded-xl bg-surface px-4 py-3 text-right text-sm shadow-raised-sm transition-transform duration-300 ease-spring hover:translate-x-0.5"><span className="block font-mono text-[11px] text-muted">Next</span>{next.title}</a>}
      </div>
    </>
  )
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-5 py-24 text-center">
      <div className="grid size-24 place-items-center rounded-[24px] bg-bg shadow-inset"><DotIcon icon="cross" size={48} /></div>
      <h1 className="m-0 text-3xl font-bold tracking-tight">Nothing here</h1>
      <a href={href("/docs")} className="font-medium text-glow-ink hover:underline">Back to the docs</a>
    </div>
  )
}

export function Docs({ route }: { route: string }) {
  let page: React.ReactNode
  const m = route.match(/^\/docs\/components\/(.+)$/)
  if (m) page = <ComponentPage name={m[1]} />
  else if (route === "/docs") page = <Introduction />
  else if (route === "/docs/installation") page = <Installation />
  else if (route === "/docs/frameworks") page = <Frameworks />
  else if (route === "/docs/theming") page = <Theming />
  else if (route === "/docs/cli") page = <Cli />
  else page = <NotFound />

  return (
    <div className="mx-auto flex w-full max-w-[1280px] gap-12 px-[max(20px,env(safe-area-inset-left))] pt-8">
      <Sidebar route={route} />
      <article key={route} className="min-w-0 flex-1 animate-hc-rise pb-10">
        <MobilePicker route={route} />
        {page}
      </article>
    </div>
  )
}
