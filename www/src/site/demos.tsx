import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardActions } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { DotIcon } from "@/components/ui/dot-icon"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { StatusLamp } from "@/components/ui/status-lamp"
import { Badge } from "@/components/ui/badge"
import { Segmented } from "@/components/ui/segmented"
import { Sparkline } from "@/components/ui/sparkline"
import { Counter } from "@/components/ui/counter"
import { Stat } from "@/components/ui/stat"
import { DotChart } from "@/components/ui/dot-chart"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { Nav, NavItem } from "@/components/ui/nav"
import { Avatar } from "@/components/ui/avatar"
import { Meter } from "@/components/ui/meter"
import { glyphs, type GlyphName } from "@/lib/dot-matrix"
import { moreDemos } from "./demos-more"
import { newDemos } from "./demos-new"
import { IconBag, IconBell, IconChart, IconDownload, IconGrid, IconSearch, IconUsers } from "./icons"

export type Prop = { name: string; type: string; default?: string; description: string }
export type DemoEntry = {
  name: string
  title: string
  group: (typeof groups)[number]
  description: string
  Demo: React.ComponentType
  usage: string
  props: Prop[]
}

function GlyphCycler() {
  const names = Object.keys(glyphs) as GlyphName[]
  const [i, setI] = React.useState(0)
  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => setI((i + 1) % names.length)}
        className="grid size-28 cursor-pointer place-items-center rounded-[26px] bg-surface shadow-glow transition-transform duration-300 ease-spring active:scale-95"
        aria-label="Next glyph"
      >
        <DotIcon icon={names[i]} size={64} />
      </button>
      <div className="flex flex-wrap justify-center gap-1.5">
        {names.map((n, k) => (
          <button key={n} type="button" onClick={() => setI(k)}
            className={`cursor-pointer rounded-lg px-2 py-1 font-mono text-[11px] transition-colors ${k === i ? "bg-raise text-ink shadow-raised-sm" : "text-muted hover:text-ink"}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function SegmentedDemo() {
  const [v, setV] = React.useState<"7d" | "30d" | "12m">("12m")
  return (
    <div className="flex flex-col items-center gap-4">
      <Segmented aria-label="Range" value={v} onValueChange={setV}
        options={[{ value: "7d", label: "7D" }, { value: "30d", label: "30D" }, { value: "12m", label: "12M" }]} />
      <span className="font-mono text-xs text-muted">value: {v}</span>
    </div>
  )
}

function CounterDemo() {
  const [v, setV] = React.useState(1280)
  return (
    <div className="flex flex-col items-center gap-5">
      <Counter value={v} className="text-6xl" />
      <Button onClick={() => setV(Math.round(Math.random() * 9000) + 500)}>Randomise</Button>
    </div>
  )
}

function MeterDemo() {
  const [v, setV] = React.useState(64)
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Meter value={v} />
      <Meter value={82} tone="warn" segments={14} />
      <Meter value={30} tone="ok" segments={10} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setV(Math.max(0, v - 15))}>Less</Button>
        <Button size="sm" onClick={() => setV(Math.min(100, v + 15))}>More</Button>
      </div>
    </div>
  )
}

function NavDemo() {
  const [a, setA] = React.useState("Overview")
  const items = [
    { l: "Overview", i: <IconGrid /> },
    { l: "Customers", i: <IconUsers /> },
    { l: "Orders", i: <IconBag />, c: 12 },
    { l: "Analytics", i: <IconChart /> },
  ]
  return (
    <Nav className="w-60">
      {items.map((x) => <NavItem key={x.l} icon={x.i} active={a === x.l} count={x.c} onClick={() => setA(x.l)}>{x.l}</NavItem>)}
    </Nav>
  )
}

function ChartDemo() {
  const [r, setR] = React.useState<"12m" | "7d">("12m")
  const data = r === "12m"
    ? { labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], values: [21, 24, 22, 27, 29, 31, 30, 34, 37, 36, 42, 48], unit: 4 }
    : { labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], values: [0.9, 1.6, 1.8, 1.7, 2.1, 2.4, 1.3], unit: 0.2 }
  return (
    <div className="w-full">
      <div className="mb-3 flex justify-end">
        <Segmented value={r} onValueChange={setR} options={[{ value: "7d", label: "7D" }, { value: "12m", label: "12M" }]} />
      </div>
      <div className="overflow-x-auto">
        <DotChart {...data} format={(v) => `$${r === "12m" ? v : v.toFixed(1)}k`} />
      </div>
    </div>
  )
}

const baseDemos: DemoEntry[] = [
  {
    name: "theme-switch", title: "Theme Switch", group: "Controls",
    description: "The signature control. The dot-matrix sun bursts into particles and re-forms as a moon while the glow shifts from amber to violet and the new theme spreads out from the switch.",
    Demo: () => <ThemeSwitch />,
    usage: `import { ThemeSwitch } from "@/components/ui/theme-switch"

export function Header() {
  return <ThemeSwitch />
}`,
    props: [
      { name: "reveal", type: "boolean", default: "true", description: "Circular reveal from the switch via the View Transitions API. Falls back to a plain swap." },
    ],
  },
  {
    name: "button", title: "Button", group: "Controls",
    description: "A raised key that sinks into the surface when pressed. Use the glow variant once per view for the main action.",
    Demo: () => (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Default</Button>
        <Button variant="glow">Deploy</Button>
        <Button variant="inset">Inset</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Delete</Button>
        <Button size="icon" aria-label="Download"><IconDownload /></Button>
      </div>
    ),
    usage: `import { Button } from "@/components/ui/button"

<Button variant="glow" onClick={deploy}>Deploy</Button>`,
    props: [
      { name: "variant", type: '"default" | "glow" | "ghost" | "inset" | "danger"', default: '"default"', description: "Surface treatment." },
      { name: "size", type: '"sm" | "md" | "lg" | "icon"', default: '"md"', description: "Height and padding." },
    ],
  },
  {
    name: "switch", title: "Switch", group: "Controls",
    description: "Small tactile switch. The knob springs across, stretches while held and its LED lights up in the theme glow.",
    Demo: () => (
      <div className="flex flex-col gap-4">
        {["Maintenance mode", "New sign-ups", "Beta features"].map((l, i) => (
          <label key={l} className="flex w-72 items-center justify-between gap-4">
            <span>{l}</span>
            <Switch defaultChecked={i > 0} aria-label={l} onCheckedChange={(on) => toast(`${l} ${on ? "on" : "off"}`)} />
          </label>
        ))}
      </div>
    ),
    usage: `import { Switch } from "@/components/ui/switch"

<Switch checked={enabled} onCheckedChange={setEnabled} aria-label="New sign-ups" />`,
    props: [
      { name: "checked", type: "boolean", description: "Controlled state." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the next state." },
    ],
  },
  {
    name: "segmented", title: "Segmented", group: "Controls",
    description: "A segmented control whose raised thumb springs between options inside a recessed track.",
    Demo: SegmentedDemo,
    usage: `import { Segmented } from "@/components/ui/segmented"

<Segmented
  value={range}
  onValueChange={setRange}
  options={[{ value: "7d", label: "7D" }, { value: "12m", label: "12M" }]}
/>`,
    props: [
      { name: "options", type: "{ value: T; label: ReactNode }[]", description: "The segments." },
      { name: "value / defaultValue", type: "T", description: "Controlled or initial value." },
      { name: "onValueChange", type: "(value: T) => void", description: "Called on selection." },
    ],
  },
  {
    name: "input", title: "Input", group: "Forms",
    description: "Recessed text field. The well picks up a glow ring when focused. Has slots for a leading icon and a trailing element.",
    Demo: () => <Input className="w-full max-w-sm" icon={<IconSearch />} placeholder="Search orders" trailing={<Kbd>Ctrl K</Kbd>} />,
    usage: `import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"

<Input icon={<SearchIcon />} placeholder="Search" trailing={<Kbd>Ctrl K</Kbd>} />`,
    props: [
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "trailing", type: "ReactNode", description: "Trailing element, e.g. a Kbd." },
      { name: "...props", type: "InputHTMLAttributes", description: "Passed to the input element." },
    ],
  },
  {
    name: "dot-icon", title: "Dot Icon", group: "Surfaces",
    description: "Canvas icons built from a 13 x 13 dot grid. Change the icon prop and the dots scatter and settle into the new glyph. Draw your own with glyph() or bitmap().",
    Demo: GlyphCycler,
    usage: `import { DotIcon } from "@/components/ui/dot-icon"
import { bitmap } from "@/lib/dot-matrix"

<DotIcon icon={done ? "check" : "ring"} size={32} />

const arrow = bitmap(["..#..", ".###.", "#####", "..#..", "..#.."])
<DotIcon icon={arrow} />`,
    props: [
      { name: "icon", type: "GlyphName | Glyph", description: "Built-in glyph name or a custom glyph." },
      { name: "size", type: "number", default: "24", description: "Size in px." },
      { name: "glow", type: "number", default: "0.55", description: "Halo strength. 0 turns it off." },
    ],
  },
  {
    name: "card", title: "Card", group: "Surfaces",
    description: "Raised or inset surface. Cards rise into place with a stagger when they mount.",
    Demo: () => (
      <div className="grid w-full max-w-xl gap-5 sm:grid-cols-2">
        <Card index={0}>
          <CardHeader><div><CardTitle>Raised</CardTitle><CardDescription>Floats above the page</CardDescription></div></CardHeader>
          <p className="m-0 text-sm text-muted">For content groups that stand on their own.</p>
        </Card>
        <Card index={1} surface="inset">
          <CardHeader><div><CardTitle>Inset</CardTitle><CardDescription>Pressed into the page</CardDescription></div><CardActions><StatusLamp tone="ok" /></CardActions></CardHeader>
          <p className="m-0 text-sm text-muted">For wells, rails and grouped controls.</p>
        </Card>
      </div>
    ),
    usage: `import { Card, CardHeader, CardTitle, CardDescription, CardActions } from "@/components/ui/card"

<Card index={2}>
  <CardHeader>
    <div><CardTitle>Revenue</CardTitle><CardDescription>Last 12 months</CardDescription></div>
    <CardActions>...</CardActions>
  </CardHeader>
  ...
</Card>`,
    props: [
      { name: "surface", type: '"raised" | "inset"', default: '"raised"', description: "Elevation." },
      { name: "index", type: "number", default: "0", description: "Stagger step for the entrance (70 ms each)." },
      { name: "animate", type: "boolean", default: "true", description: "Play the entrance animation." },
    ],
  },
  {
    name: "avatar", title: "Avatar", group: "Surfaces",
    description: "Raised round avatar with initials or an image.",
    Demo: () => <div className="flex gap-3"><Avatar initials="MK" /><Avatar initials="NL" size={44} /><Avatar initials="SY" size={56} /></div>,
    usage: `import { Avatar } from "@/components/ui/avatar"

<Avatar initials="MK" />`,
    props: [
      { name: "initials", type: "string", description: "Shown without an image." },
      { name: "src", type: "string", description: "Image URL." },
      { name: "size", type: "number", default: "34", description: "Size in px." },
    ],
  },
  {
    name: "stat", title: "Stat", group: "Data",
    description: "KPI tile with a counting dot-matrix number, a delta chip and a self-drawing sparkline. Lifts on hover.",
    Demo: () => (
      <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        <Stat label="Monthly revenue" prefix="$" value={48.2} decimals={1} suffix="k" delta="+12.4%" spark={[18, 16, 20, 15, 19, 22, 21, 24, 23, 27]} note="sample" />
        <Stat index={1} label="p95 latency" value={184} suffix="ms" delta="-22 ms" spark={[24, 22, 23, 20, 21, 19, 18, 19, 17, 15]} note="sample" />
      </div>
    ),
    usage: `import { Stat } from "@/components/ui/stat"

<Stat label="Monthly revenue" prefix="$" value={48.2} decimals={1} suffix="k"
      delta="+12.4%" trend="up" spark={[18, 16, 20, 15, 19, 22]} />`,
    props: [
      { name: "label", type: "string", description: "Eyebrow label." },
      { name: "value", type: "number", description: "Number to count up to." },
      { name: "prefix / suffix", type: "string", description: "Units around the number." },
      { name: "delta", type: "string", description: "Change chip text." },
      { name: "trend", type: '"up" | "down"', default: '"up"', description: "Whether the delta is good (ok) or bad." },
      { name: "spark", type: "number[]", description: "Sparkline data." },
    ],
  },
  {
    name: "dot-chart", title: "Dot Chart", group: "Data",
    description: "Dot-matrix bar chart. Each lit dot is one unit, columns pop in with a staggered spring and the peak glows.",
    Demo: ChartDemo,
    usage: `import { DotChart } from "@/components/ui/dot-chart"

<DotChart
  labels={["Jan", "Feb", "Mar"]}
  values={[24, 22, 27]}
  unit={4}
  format={(v) => \`$\${v}k\`}
/>`,
    props: [
      { name: "labels", type: "string[]", description: "Column labels." },
      { name: "values", type: "number[]", description: "Column values." },
      { name: "unit", type: "number", description: "Value of one lit dot." },
      { name: "rows", type: "number", default: "12", description: "Matrix height in dots." },
      { name: "dotsPerColumn", type: "number", default: "3", description: "Dot width of each column." },
      { name: "format", type: "(v: number) => string", description: "Y-axis tick formatter." },
    ],
  },
  {
    name: "sparkline", title: "Sparkline", group: "Data",
    description: "A sparkline that draws itself in the theme glow, with a soft area fill and an emphasised endpoint.",
    Demo: () => <div className="w-72"><Sparkline data={[10, 12, 11, 14, 13, 13, 15, 16, 15, 18]} className="h-16" /></div>,
    usage: `import { Sparkline } from "@/components/ui/sparkline"

<Sparkline data={[10, 12, 11, 14, 13, 18]} />`,
    props: [
      { name: "data", type: "number[]", description: "Points." },
      { name: "animate", type: "boolean", default: "true", description: "Draw the line in on mount." },
    ],
  },
  {
    name: "counter", title: "Counter", group: "Data",
    description: "Dot-matrix numeral that counts to its value and re-counts when the value changes.",
    Demo: CounterDemo,
    usage: `import { Counter } from "@/components/ui/counter"

<Counter value={3814} className="text-5xl" />`,
    props: [
      { name: "value", type: "number", description: "Target value." },
      { name: "decimals", type: "number", default: "0", description: "Fraction digits." },
      { name: "duration", type: "number", default: "1400", description: "Animation length in ms." },
    ],
  },
  {
    name: "table", title: "Table", group: "Data",
    description: "Rows are recessed strips that slide right and lighten on hover.",
    Demo: () => (
      <div className="w-full">
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead align="right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow onClick={() => toast("Opened #40921")}><TableCell mono>#40921</TableCell><TableCell>Northwind Labs</TableCell><TableCell><Badge tone="ok">Paid</Badge></TableCell><TableCell align="right">$1,240.00</TableCell></TableRow>
            <TableRow onClick={() => toast("Opened #40919")}><TableCell mono>#40919</TableCell><TableCell>Kelp Studio</TableCell><TableCell><Badge tone="warn">Pending</Badge></TableCell><TableCell align="right">$299.00</TableCell></TableRow>
            <TableRow onClick={() => toast("Opened #40917")}><TableCell mono>#40917</TableCell><TableCell>Pinecone Coffee</TableCell><TableCell><Badge tone="bad">Failed</Badge></TableCell><TableCell align="right">$49.00</TableCell></TableRow>
          </TableBody>
        </Table>
      </div>
    ),
    usage: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader><TableRow><TableHead>Order</TableHead><TableHead align="right">Amount</TableHead></TableRow></TableHeader>
  <TableBody>
    <TableRow onClick={open}><TableCell mono>#40921</TableCell><TableCell align="right">$1,240.00</TableCell></TableRow>
  </TableBody>
</Table>`,
    props: [
      { name: "TableCell mono", type: "boolean", description: "Monospaced cell, for ids." },
      { name: "TableCell / TableHead align", type: '"right"', description: "Right-align numbers." },
    ],
  },
  {
    name: "badge", title: "Badge", group: "Feedback",
    description: "Status pill. The glowing dot carries the color so the label stays readable.",
    Demo: () => <div className="flex flex-wrap justify-center gap-2.5"><Badge tone="ok">Paid</Badge><Badge tone="warn">Pending</Badge><Badge tone="bad">Failed</Badge><Badge tone="glow">Beta</Badge><Badge surface="inset">Draft</Badge></div>,
    usage: `import { Badge } from "@/components/ui/badge"

<Badge tone="ok">Paid</Badge>`,
    props: [
      { name: "tone", type: '"neutral" | "ok" | "warn" | "bad" | "glow"', default: '"neutral"', description: "Dot color." },
      { name: "surface", type: '"raised" | "inset"', default: '"raised"', description: "Elevation." },
      { name: "dot", type: "boolean", default: "true", description: "Show the dot." },
    ],
  },
  {
    name: "status-lamp", title: "Status Lamp", group: "Feedback",
    description: "A glowing LED. Its breathing speeds up with severity, so problems catch the eye first.",
    Demo: () => (
      <div className="flex flex-col gap-3">
        {([["ok", "API gateway"], ["warn", "Job queue"], ["bad", "Webhooks"], ["glow", "Deploying"]] as const).map(([t, l]) => (
          <div key={t} className="flex w-64 items-center gap-3 rounded-[13px] bg-bg px-3 py-2.5 shadow-inset-sm"><StatusLamp tone={t} /><span>{l}</span></div>
        ))}
      </div>
    ),
    usage: `import { StatusLamp } from "@/components/ui/status-lamp"

<StatusLamp tone="warn" />`,
    props: [
      { name: "tone", type: '"ok" | "warn" | "bad" | "glow" | "off"', default: '"ok"', description: "Color and breathing speed." },
      { name: "steady", type: "boolean", description: "No breathing." },
    ],
  },
  {
    name: "meter", title: "Meter", group: "Feedback",
    description: "Dot-segment progress meter in a recessed track. Segments light up one after another.",
    Demo: MeterDemo,
    usage: `import { Meter } from "@/components/ui/meter"

<Meter value={64} />`,
    props: [
      { name: "value", type: "number", description: "Current value." },
      { name: "max", type: "number", default: "100", description: "Maximum." },
      { name: "segments", type: "number", default: "20", description: "Number of dots." },
      { name: "tone", type: '"glow" | "ok" | "warn" | "bad"', default: '"glow"', description: "Lit color." },
    ],
  },
  {
    name: "toast", title: "Toast", group: "Feedback",
    description: "Call toast() from anywhere. Messages spring up from the bottom edge with a status lamp.",
    Demo: () => (
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => toast("Changes saved", { tone: "ok" })}>Show toast</Button>
        <Button variant="danger" onClick={() => toast("Webhook endpoint failing", { tone: "bad" })}>Error toast</Button>
      </div>
    ),
    usage: `import { Toaster, toast } from "@/components/ui/toast"

// once, near the root
<Toaster />

toast("Changes saved")
toast("Webhook endpoint failing", { tone: "bad" })`,
    props: [
      { name: "toast(message, { tone })", type: '"glow" | "ok" | "warn" | "bad"', default: '"glow"', description: "Shows a toast." },
      { name: "Toaster duration", type: "number", default: "2400", description: "How long each toast stays, in ms." },
    ],
  },
  {
    name: "nav", title: "Nav", group: "Navigation",
    description: "A recessed sidebar rail. The active item rises out of the rail and its LED lights up.",
    Demo: NavDemo,
    usage: `import { Nav, NavItem } from "@/components/ui/nav"

<Nav>
  <NavItem icon={<GridIcon />} active>Overview</NavItem>
  <NavItem icon={<BagIcon />} count={12}>Orders</NavItem>
</Nav>`,
    props: [
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "active", type: "boolean", description: "Current page." },
      { name: "count", type: "number", description: "Count chip instead of the LED." },
    ],
  },
  {
    name: "kbd", title: "Kbd", group: "Navigation",
    description: "A tiny raised keycap for shortcuts.",
    Demo: () => <div className="flex items-center gap-2 text-sm text-muted">Press <Kbd>Ctrl</Kbd><Kbd>K</Kbd> to search <IconBell className="hidden" /></div>,
    usage: `import { Kbd } from "@/components/ui/kbd"

<Kbd>Ctrl K</Kbd>`,
    props: [],
  },
]

import { groups } from "./catalog"
export { groups }

export const demos: DemoEntry[] = [...baseDemos, ...moreDemos, ...newDemos].sort(
  (a, b) => groups.indexOf(a.group) - groups.indexOf(b.group),
)
