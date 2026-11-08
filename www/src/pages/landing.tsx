import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { DotIcon } from "@/components/ui/dot-icon"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Meter } from "@/components/ui/meter"
import { Stat } from "@/components/ui/stat"
import { StatusLamp } from "@/components/ui/status-lamp"
import { Segmented } from "@/components/ui/segmented"
import { DotChart } from "@/components/ui/dot-chart"
import { Nav, NavItem } from "@/components/ui/nav"
import { Counter } from "@/components/ui/counter"
import { toast } from "@/components/ui/toast"
import { glyphs, type GlyphName } from "@/lib/dot-matrix"
import { useTheme } from "@/hooks/use-theme"
import { Code, Command } from "../site/code"
import { NPX, REPO } from "../site/shell"
import { demos, groups } from "../site/demos"
import { href } from "../router"
import { IconArrow, IconBag, IconChart, IconGithub, IconGrid, IconUsers } from "../site/icons"

const wrap = "mx-auto w-full max-w-[1280px] px-[max(20px,env(safe-area-inset-left))]"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[11px] uppercase tracking-[.18em] text-muted">{children}</div>
}

function Hero() {
  const { theme } = useTheme()
  return (
    <section className="relative overflow-hidden">
      <div className="dot-field pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[38%] size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-glow-soft opacity-40 blur-[120px] transition-colors duration-700" />

      <div className={cn(wrap, "relative flex flex-col items-center pb-16 pt-14 text-center sm:pt-20")}>
        <a href={href("/docs/components/theme-switch")} className="animate-hc-rise">
          <Badge tone="glow" className="py-1.5 pl-2.5 pr-3 text-[12.5px]">
            v0.1 &middot; {demos.length} components, copy-paste ready
          </Badge>
        </a>

        <h1 className="mt-7 max-w-[15ch] text-balance text-[clamp(44px,8vw,96px)] font-bold leading-[.95] tracking-[-.045em] animate-hc-rise [animation-delay:80ms]">
          Interfaces you want to{" "}
          <span className="font-dot font-black tracking-[-.02em] text-glow-ink text-glow-shadow">press</span>.
        </h1>

        <p className="mt-6 max-w-[56ch] text-pretty text-[17px] leading-relaxed text-muted animate-hc-rise [animation-delay:160ms]">
          Halcyon UI is a set of tactile React components with soft surfaces, dot-matrix icons and springy motion.
          You copy them into your project and they are yours. Built on Tailwind CSS v4.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-hc-rise [animation-delay:240ms]">
          <a href={href("/docs")}><Button variant="glow" size="lg">Get started <IconArrow /></Button></a>
          <a href={REPO} target="_blank" rel="noreferrer"><Button size="lg"><IconGithub /> GitHub</Button></a>
        </div>

        <Command cmd={`${NPX} init`} className="mt-6 w-full max-w-[520px] animate-hc-rise [animation-delay:320ms]" />

        {/* stage */}
        <div className="mt-16 w-full max-w-[1080px] animate-hc-rise rounded-[36px] bg-bg p-4 text-left shadow-inset [animation-delay:420ms] sm:mt-20 sm:p-6">
          <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8">
            {/* left rack */}
            <div className="hidden flex-col gap-5 lg:flex">
              <Stat label="Active users" value={3814} delta="+4.1%" spark={[10, 12, 11, 14, 13, 13, 15, 16, 15, 18]} animate={false} />
              <Card animate={false} className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[13px]"><span className="font-medium">Build 0.4.13</span><StatusLamp tone="glow" /></div>
                <Meter value={72} />
                <div className="flex justify-between font-mono text-[11px] text-muted"><span>deploying</span><span>72%</span></div>
              </Card>
            </div>

            {/* the switch */}
            <div className="flex flex-col items-center gap-4 py-6 lg:py-10">
              <div className="rounded-[34px] bg-surface p-6 shadow-raised">
                <ThemeSwitch size="lg" />
              </div>
              <span className="h-4 font-mono text-xs text-muted">
                {theme === "dark" ? "Night. The glow turned violet." : "Go on, press it."}
              </span>
            </div>

            {/* right rack */}
            <div className="hidden flex-col gap-5 lg:flex">
              <Card animate={false} className="flex flex-col gap-3.5">
                {["Maintenance mode", "Beta features", "Weekly digest"].map((l, i) => (
                  <div key={l} className="flex items-center justify-between gap-3 text-[13px]">
                    <span>{l}</span>
                    <Switch defaultChecked={i === 1} aria-label={l} />
                  </div>
                ))}
              </Card>
              <Card animate={false} className="flex items-center gap-2 p-4">
                <Badge tone="ok">Paid</Badge><Badge tone="warn">Pending</Badge><Badge tone="bad">Failed</Badge>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GlyphMarquee() {
  const names = Object.keys(glyphs) as GlyphName[]
  const row = [...names, ...names, ...names]
  return (
    <div className="relative overflow-hidden border-y border-line py-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="animate-marquee flex w-max gap-6">
        {[...row, ...row].map((n, i) => (
          <div key={i} className="grid size-16 shrink-0 place-items-center rounded-[18px] bg-bg shadow-inset-sm">
            <DotIcon icon={n} size={30} glow={0.35} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MorphTile() {
  const seq: GlyphName[] = ["heart", "bolt", "check", "bell", "ring"]
  const [i, setI] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % seq.length), 2200)
    return () => clearInterval(t)
  }, [seq.length])
  return (
    <div className="grid h-40 place-items-center">
      <div className="grid size-28 place-items-center rounded-[28px] bg-surface shadow-glow">
        <DotIcon icon={seq[i]} size={60} />
      </div>
    </div>
  )
}

function SpringTile() {
  const [n, setN] = React.useState(0)
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => setN(n + 1)}
        className="grid size-20 cursor-pointer place-items-center rounded-[22px] bg-surface shadow-key transition-[scale,box-shadow] duration-300 ease-spring active:scale-[.86] active:shadow-inset"
      >
        <Counter value={n} duration={400} className="text-3xl" />
      </button>
      <span className="font-mono text-[11px] text-muted">pressed {n} times</span>
    </div>
  )
}

/** Two theme islands side by side: the same parts in day and night. */
function ThemeTile() {
  return (
    <div className="grid h-40 grid-cols-2 gap-3">
      {(["light", "dark"] as const).map((t) => (
        <div key={t} data-theme={t} className="flex flex-col justify-between rounded-2xl bg-bg p-3.5 text-ink shadow-inset">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">{t === "light" ? "Day" : "Night"}</span>
            <StatusLamp tone="glow" steady />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-dot text-2xl font-extrabold">{t === "light" ? "12:00" : "00:00"}</span>
            <Meter value={t === "light" ? 60 : 80} segments={8} className="w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

const features: { title: string; text: string; tile: React.ReactNode; span: string }[] = [
  {
    title: "Copy, don't install",
    text: "The CLI copies source files into your project. No package to update, no styles to fight. Change anything.",
    tile: <div className="flex h-40 flex-col justify-center gap-3"><Command cmd={`${NPX} add stat`} /><Command cmd={`${NPX} add --all`} /></div>,
    span: "lg:col-span-2",
  },
  {
    title: "Dot-matrix glyphs",
    text: "Icons drawn from 169 dots. Swap the icon and they scatter and regroup.",
    tile: <MorphTile />,
    span: "",
  },
  {
    title: "Motion with weight",
    text: "Spring easing, keys that sink when pressed, cards that rise in sequence.",
    tile: <SpringTile />,
    span: "",
  },
  {
    title: "Two themes, one glow",
    text: "Amber by day, violet by night. Every color is a token, so both themes stay in step.",
    tile: <ThemeTile />,
    span: "",
  },
  {
    title: "Tailwind v4 tokens",
    text: "Utilities like shadow-raised, bg-surface and ease-spring work everywhere in your app.",
    tile: (
      <div className="flex h-40 items-center">
        <Code className="w-full [&_pre]:whitespace-pre-wrap" code={`<div className="
  bg-surface
  shadow-raised
  ease-spring" />`} />
      </div>
    ),
    span: "",
  },
]

function Features() {
  return (
    <section className={cn(wrap, "mt-28")}>
      <div className="mb-10 flex flex-col gap-3">
        <Eyebrow>Why Halcyon</Eyebrow>
        <h2 className="m-0 max-w-[22ch] text-balance text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-.035em]">
          Soft to look at. Satisfying to use.
        </h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card key={f.title} index={i} className={cn("flex flex-col gap-4 p-6", f.span)}>
            {f.tile}
            <div>
              <h3 className="m-0 text-[15px] font-semibold">{f.title}</h3>
              <p className="m-0 mt-1 text-[13.5px] leading-relaxed text-muted">{f.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function Showcase() {
  const [r, setR] = React.useState<"12m" | "7d">("12m")
  const [active, setActive] = React.useState("Overview")
  const data = r === "12m"
    ? { labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], values: [21, 24, 22, 27, 29, 31, 30, 34, 37, 36, 42, 48], unit: 4 }
    : { labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], values: [0.9, 1.6, 1.8, 1.7, 2.1, 2.4, 1.3], unit: 0.2 }
  return (
    <section className={cn(wrap, "mt-28")}>
      <div className="mb-10 flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>Example</Eyebrow>
          <h2 className="m-0 max-w-[20ch] text-balance text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-.035em]">
            A whole admin panel, from the same parts.
          </h2>
        </div>
        <a href={href("/examples/dashboard")} className="ml-auto"><Button>Open the dashboard <IconArrow /></Button></a>
      </div>

      <div className="rounded-[28px] bg-bg p-3 shadow-inset sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <Card animate={false} className="hidden flex-col gap-4 self-start p-4 lg:flex">
            <div className="px-1.5 font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">Workspace</div>
            <Nav>
              {[["Overview", <IconGrid key="a" />], ["Customers", <IconUsers key="b" />], ["Orders", <IconBag key="c" />], ["Analytics", <IconChart key="d" />]].map(([l, i]) => (
                <NavItem key={l as string} icon={i} active={active === l} onClick={() => setActive(l as string)}>{l}</NavItem>
              ))}
            </Nav>
          </Card>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <Stat label="Revenue" prefix="$" value={48.2} decimals={1} suffix="k" delta="+12.4%" spark={[18, 16, 20, 15, 19, 22, 21, 24, 23, 27]} note="sample" />
              <Stat index={1} label="Users" value={3814} delta="+4.1%" spark={[10, 12, 11, 14, 13, 13, 15, 16, 15, 18]} note="sample" />
              <Stat index={2} label="Churn" value={2.3} decimals={1} suffix="%" delta="+0.3 pt" trend="down" spark={[8, 7, 9, 8, 8, 10, 9, 11, 10, 12]} note="sample" />
            </div>
            <Card index={3}>
              <div className="mb-3 flex items-center gap-3">
                <div><h3 className="m-0 text-sm font-semibold">Revenue</h3><p className="m-0 text-xs text-muted">Each dot is a unit of booked revenue</p></div>
                <Segmented className="ml-auto" value={r} onValueChange={setR} options={[{ value: "7d", label: "7D" }, { value: "12m", label: "12M" }]} />
              </div>
              <div className="overflow-x-auto max-sm:[mask-image:linear-gradient(to_right,black_80%,transparent)]"><DotChart {...data} format={(v) => `$${r === "12m" ? v : v.toFixed(1)}k`} /></div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function ComponentGrid() {
  return (
    <section className={cn(wrap, "mt-28")}>
      <div className="mb-10 flex flex-col gap-3">
        <Eyebrow>Components</Eyebrow>
        <h2 className="m-0 text-balance text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-.035em]">
          {demos.length} pieces. All of them pressable.
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g} className="grid items-start gap-3 rounded-[22px] bg-bg p-3 shadow-inset sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center sm:p-4">
            <div className="flex items-center gap-2 px-1.5 font-mono text-[10.5px] uppercase tracking-[.16em] text-muted">
              {g}
              <span className="text-glow-ink">{demos.filter((d) => d.group === g).length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {demos.filter((d) => d.group === g).map((d) => (
                <a
                  key={d.name}
                  href={href(`/docs/components/${d.name}`)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-surface px-3.5 py-2 text-[13.5px] font-medium shadow-raised-sm transition-[translate,box-shadow] duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-glow active:translate-y-px active:shadow-inset-sm"
                >
                  <span className="size-1.5 rounded-full bg-dot-off transition-[background-color,box-shadow] duration-300 group-hover:bg-glow group-hover:shadow-[0_0_6px_var(--hc-glow)]" />
                  {d.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className={cn(wrap, "mt-28")}>
      <Card animate={false} className="relative overflow-hidden px-6 py-14 text-center sm:px-14">
        <div className="dot-field pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(60%_80%_at_50%_100%,black,transparent)]" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="grid size-20 place-items-center rounded-[22px] bg-bg shadow-inset">
            <DotIcon icon="bolt" size={42} />
          </div>
          <h2 className="m-0 max-w-[18ch] text-balance text-[clamp(30px,4vw,46px)] font-bold leading-[1.05] tracking-[-.035em]">
            Start with one switch. Keep going.
          </h2>
          <Command cmd={`${NPX} add theme-switch`} className="w-full max-w-[540px]" />
          <a href={href("/docs/components/theme-switch")} className="inline-flex items-center gap-2 text-[13.5px] font-medium text-muted transition-colors hover:text-ink">Browse all {demos.length} components <IconArrow className="size-4" /></a>
        </div>
      </Card>
    </section>
  )
}

export function Landing() {
  return (
    <>
      <Hero />
      <GlyphMarquee />
      <Features />
      <Showcase />
      <ComponentGrid />
      <FinalCta />
    </>
  )
}
