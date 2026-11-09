import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Kbd } from "@/components/ui/kbd"
import { toast } from "@/components/ui/toast"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Carousel } from "@/components/ui/carousel"
import { AreaChart, BarChart, DonutChart, LineChart } from "@/components/ui/chart"
import { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevron } from "@/components/ui/collapsible"
import { ContextMenu } from "@/components/ui/context-menu"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { DatePicker } from "@/components/ui/date-picker"
import type { DateRange } from "@/components/ui/calendar"
import { Drawer } from "@/components/ui/drawer"
import { Field, FieldLabel, FieldControl, FieldDescription, Fieldset } from "@/components/ui/field"
import { HoverCard } from "@/components/ui/hover-card"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { Item, ItemGroup, ItemIcon } from "@/components/ui/item"
import { Menubar } from "@/components/ui/menubar"
import { NativeSelect } from "@/components/ui/native-select"
import { NavigationMenu } from "@/components/ui/navigation-menu"
import { Resizable } from "@/components/ui/resizable"
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarMenu,
  SidebarMenuButton, SidebarTrigger, SidebarInset,
} from "@/components/ui/sidebar"
import { DotIcon } from "@/components/ui/dot-icon"
import type { DemoEntry } from "./demos"
import { IconBag, IconBell, IconChart, IconCopy, IconDownload, IconGrid, IconSearch, IconServer, IconSettings, IconUsers } from "./icons"

/* ---------- demos ---------- */

function AlertDialogDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <AlertDialog
        trigger={<Button variant="danger">Revoke API key</Button>}
        tone="danger"
        title="Revoke this key?"
        description="Apps using hc_live_8f2a will stop working right away. This cannot be undone."
        actionLabel="Revoke key"
        onAction={() => new Promise((r) => setTimeout(r, 900)).then(() => toast.success("Key revoked"))}
      />
      <AlertDialog
        trigger={<Button>Publish changes</Button>}
        title="Publish to production?"
        description="12 changes go live for every visitor."
        actionLabel="Publish"
        onAction={() => { toast("Published") }}
      />
    </div>
  )
}

function ButtonGroupDemo() {
  return (
    <div className="flex flex-col items-center gap-5">
      <ButtonGroup aria-label="Message actions">
        <Button>Archive</Button>
        <ButtonGroupSeparator />
        <Button>Report</Button>
        <ButtonGroupSeparator />
        <Button variant="danger">Delete</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Zoom">
        <Button size="icon" aria-label="Zoom out">−</Button>
        <ButtonGroupText>100%</ButtonGroupText>
        <Button size="icon" aria-label="Zoom in">+</Button>
      </ButtonGroup>
    </div>
  )
}

const slides = [
  { t: "Soft surfaces", d: "Every element floats or sinks.", g: "sun" as const },
  { t: "Dot matrix", d: "Icons, charts and numbers from dots.", g: "diamond" as const },
  { t: "One glow", d: "Amber by day, violet by night.", g: "moon" as const },
  { t: "Weighted motion", d: "Springs everywhere.", g: "bolt" as const },
  { t: "Yours to own", d: "Copied into your app, not installed.", g: "heart" as const },
]

function CarouselDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Carousel aria-label="Features">
        {slides.map((s) => (
          <div key={s.t} className="flex h-44 flex-col items-center justify-center gap-3 rounded-hc bg-surface shadow-raised-sm">
            <DotIcon icon={s.g} size={40} />
            <div className="text-center"><div className="font-semibold">{s.t}</div><div className="text-[13px] text-muted">{s.d}</div></div>
          </div>
        ))}
      </Carousel>
      <Carousel aria-label="Thumbnails" perView={2.4} gap={12}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid h-24 place-items-center rounded-2xl bg-bg font-dot text-2xl font-extrabold shadow-inset-sm">{String(i + 1).padStart(2, "0")}</div>
        ))}
      </Carousel>
    </div>
  )
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const revenue = months.map((m, i) => ({ month: m, revenue: Math.round(18 + i * 2.4 + Math.sin(i) * 4), costs: Math.round(12 + i * 1.1 + Math.cos(i) * 2) }))

function ChartDemo() {
  return (
    <div className="flex w-full flex-col gap-8">
      <AreaChart title="Revenue and costs by month" data={revenue} index="month" series={[{ key: "revenue", label: "Revenue" }, { key: "costs", label: "Costs" }]} format={(v) => `$${v}k`} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <BarChart title="Signups by quarter" data={[{ q: "Q1", web: 420, mobile: 310 }, { q: "Q2", web: 510, mobile: 380 }, { q: "Q3", web: 470, mobile: 450 }, { q: "Q4", web: 620, mobile: 540 }]} index="q" series={[{ key: "web", label: "Web" }, { key: "mobile", label: "Mobile" }]} height={220} />
        <LineChart title="p95 latency" data={months.slice(0, 8).map((m, i) => ({ m, p95: [182, 176, 190, 171, 165, 168, 152, 148][i] }))} index="m" series={[{ key: "p95", label: "p95 latency" }]} format={(v) => `${v}ms`} height={220} />
      </div>
      <DonutChart title="Traffic by source" data={[{ label: "Search", value: 4810 }, { label: "Direct", value: 2380 }, { label: "Social", value: 1240 }, { label: "Referral", value: 860 }]} />
    </div>
  )
}

function CollapsibleDemo() {
  return (
    <Collapsible className="w-full max-w-sm rounded-2xl bg-surface p-4 shadow-raised-sm" defaultOpen={false}>
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-sm font-semibold">3 starred repositories</div><div className="font-mono text-xs text-muted">halcyon-ui</div></div>
        <CollapsibleTrigger><CollapsibleChevron /></CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 pt-3">
        {["dot-matrix", "spring-motion", "theme-tokens"].map((r) => <div key={r} className="rounded-xl bg-bg px-3 py-2 font-mono text-xs shadow-inset-sm">{r}</div>)}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ContextMenuDemo() {
  const [pinned, setPinned] = React.useState(false)
  return (
    <ContextMenu
      items={[
        { label: "Open", icon: <IconGrid />, shortcut: "O", onSelect: () => toast("Opened") },
        { label: "Copy link", icon: <IconCopy />, shortcut: "C", onSelect: () => toast("Link copied") },
        { label: "Download", icon: <IconDownload />, onSelect: () => toast("Downloading") },
        { type: "separator" },
        { type: "checkbox", label: "Pinned", checked: pinned, onCheckedChange: setPinned },
        { type: "separator" },
        { label: "Delete", danger: true, onSelect: () => toast.error("Deleted") },
      ]}
    >
      <div data-context-area className="grid h-44 w-full max-w-sm cursor-context-menu place-items-center rounded-hc bg-bg text-center text-[13px] text-muted shadow-inset outline-offset-4">
        <span>Right-click here<br /><span className="text-xs">long-press on touch, or Shift+F10</span></span>
      </div>
    </ContextMenu>
  )
}

type Order = { id: string; customer: string; plan: string; status: "Paid" | "Pending" | "Failed"; amount: number }
const orders: Order[] = [
  ["40921", "Northwind Labs", "Team", "Paid", 1240], ["40920", "Aster & Vale", "Pro", "Pending", 290], ["40919", "Kelp Studio", "Pro", "Paid", 290],
  ["40918", "Orbitwise GmbH", "Enterprise", "Paid", 8400], ["40917", "Pinecone Coffee", "Starter", "Failed", 49], ["40916", "Lumen & Co", "Team", "Paid", 1240],
  ["40915", "Fjord Supply", "Pro", "Paid", 290], ["40914", "Quill Health", "Enterprise", "Pending", 6200], ["40913", "Mosaic Bank", "Team", "Paid", 1240],
  ["40912", "Tidal Works", "Starter", "Paid", 49], ["40911", "Nimbus Air", "Pro", "Failed", 290], ["40910", "Basalt AI", "Enterprise", "Paid", 9100],
].map(([id, customer, plan, status, amount]) => ({ id: id as string, customer: customer as string, plan: plan as string, status: status as Order["status"], amount: amount as number }))

const orderColumns: DataTableColumn<Order>[] = [
  { key: "id", header: "Order", sortable: true, mono: true, cell: (r) => `#${r.id}` },
  { key: "customer", header: "Customer", sortable: true },
  { key: "plan", header: "Plan", sortable: true, hideOnMobile: true },
  { key: "status", header: "Status", cell: (r) => <Badge tone={r.status === "Paid" ? "ok" : r.status === "Pending" ? "warn" : "bad"}>{r.status}</Badge> },
  { key: "amount", header: "Amount", sortable: true, align: "right", cell: (r) => `$${r.amount.toLocaleString("en-US")}` },
]

type App = { id: string; name: string; vendor: string; parent: string | null; seats: number }
const apps: App[] = [
  { id: "m365", name: "Microsoft 365", vendor: "Microsoft", parent: null, seats: 250 },
  { id: "word", name: "Word", vendor: "Microsoft", parent: "m365", seats: 240 },
  { id: "excel", name: "Excel", vendor: "Microsoft", parent: "m365", seats: 210 },
  { id: "teams", name: "Teams", vendor: "Microsoft", parent: "m365", seats: 248 },
  { id: "adobe", name: "Creative Cloud", vendor: "Adobe", parent: null, seats: 18 },
  { id: "ps", name: "Photoshop", vendor: "Adobe", parent: "adobe", seats: 12 },
  { id: "ai", name: "Illustrator", vendor: "Adobe", parent: "adobe", seats: 9 },
  { id: "jira", name: "Jira", vendor: "Atlassian", parent: null, seats: 60 },
]
const appColumns: DataTableColumn<App>[] = [
  { key: "name", header: "Application", sortable: true, cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: "vendor", header: "Vendor", sortable: true, hideOnMobile: true },
  { key: "seats", header: "Seats", sortable: true, align: "right" },
]

function DataTableDemo() {
  return (
    <div className="flex w-full flex-col gap-8">
      <DataTable className="w-full" aria-label="Orders" data={orders} columns={orderColumns} rowId={(r) => r.id} selectable pageSize={5} searchPlaceholder="Search orders" />
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-muted">Tree mode: child rows fold under their parent</span>
        <DataTable className="w-full" aria-label="Applications" data={apps} columns={appColumns} rowId={(r) => r.id} parentId={(r) => r.parent} pageSize={0} searchPlaceholder="Search applications" initialSort={{ key: "name", dir: "asc" }} />
      </div>
    </div>
  )
}

function DatePickerDemo() {
  const [d, setD] = React.useState<Date | null>(null)
  const [r, setR] = React.useState<DateRange>({ from: null, to: null })
  return (
    <div className="flex flex-col items-center gap-4">
      <DatePicker aria-label="Due date" value={d} onValueChange={setD} />
      <DatePicker mode="range" aria-label="Stay" value={r} onValueChange={setR} />
    </div>
  )
}

function DrawerDemo() {
  const [goal, setGoal] = React.useState(350)
  return (
    <Drawer
      trigger={<Button>Open drawer</Button>}
      title="Move goal"
      description="Set your daily activity goal."
      footer={<><Button variant="glow" onClick={() => toast.success(`Goal set to ${goal} kcal`)}>Save</Button></>}
    >
      <div className="flex items-center justify-center gap-6 py-6">
        <Button size="icon" aria-label="Decrease goal" onClick={() => setGoal((g) => Math.max(100, g - 10))}>−</Button>
        <div className="text-center"><div className="font-dot text-6xl font-extrabold tabular-nums">{goal}</div><div className="font-mono text-xs uppercase tracking-[.14em] text-muted">kcal / day</div></div>
        <Button size="icon" aria-label="Increase goal" onClick={() => setGoal((g) => Math.min(900, g + 10))}>+</Button>
      </div>
    </Drawer>
  )
}

function FieldDemo() {
  const [email, setEmail] = React.useState("ava@")
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  return (
    <form className="flex w-full max-w-sm flex-col gap-6" onSubmit={(e) => { e.preventDefault(); if (valid) toast.success("Saved") }}>
      <Fieldset legend="Profile" description="Shown on invoices and receipts.">
        <Field>
          <FieldLabel>Display name</FieldLabel>
          <FieldControl><Input defaultValue="Ava Lindqvist" /></FieldControl>
        </Field>
        <Field required error={valid ? undefined : "Enter a valid email address."}>
          <FieldLabel>Email</FieldLabel>
          <FieldControl><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FieldControl>
          <FieldDescription>We send receipts here.</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel>Marketing emails</FieldLabel>
          <FieldControl><Switch /></FieldControl>
          <FieldDescription>Product news, at most once a month.</FieldDescription>
        </Field>
      </Fieldset>
      <Button type="submit" variant="glow" className="self-end">Save</Button>
    </form>
  )
}

function HoverCardDemo() {
  return (
    <p className="m-0 text-center text-[13.5px] text-muted">
      Built by{" "}
      <HoverCard
        content={
          <div className="flex gap-3">
            <Avatar initials="MK" size={44} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">@mauricekleindienst</div>
              <div className="mt-0.5 text-[13px] text-muted">Tactile React components. Dot matrix, soft surfaces, springy motion.</div>
              <div className="mt-2 font-mono text-[11px] text-muted">Joined November 2026</div>
            </div>
          </div>
        }
      >
        <a href="https://github.com/mauricekleindienst" className="font-medium text-glow-ink underline-offset-4 hover:underline">@mauricekleindienst</a>
      </HoverCard>
      {" "}and contributors.
    </p>
  )
}

function InputGroupDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupAddon><IconSearch /></InputGroupAddon>
        <InputGroupInput placeholder="Search docs" aria-label="Search docs" />
        <InputGroupAddon><Kbd>⌘K</Kbd></InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput defaultValue="halcyon.app" aria-label="Domain" />
        <InputGroupButton onClick={() => toast("Copied")} aria-label="Copy URL"><IconCopy /></InputGroupButton>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput inputMode="decimal" defaultValue="49.00" aria-label="Price" />
        <InputGroupAddon>USD</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Ask, search or chat..." aria-label="Message" />
        <InputGroupButton className="self-end" onClick={() => toast("Sent")}>Send</InputGroupButton>
      </InputGroup>
    </div>
  )
}

function ItemDemo() {
  return (
    <ItemGroup className="w-full max-w-md">
      <Item media={<Avatar initials="AV" />} title="Ava Lindqvist" description="Owner · ava@halcyon.app" actions={<Badge tone="glow">You</Badge>} />
      <Item media={<ItemIcon><IconBell /></ItemIcon>} title="Deploy notifications" description="Email and push when a deploy finishes." actions={<Switch aria-label="Deploy notifications" defaultChecked />} />
      <Item href="#/docs/components/item" surface="inset" media={<ItemIcon><IconDownload /></ItemIcon>} title="invoice-2026-11.pdf" description="248 KB · just now" actions={<span aria-hidden="true" className="text-muted">›</span>} />
    </ItemGroup>
  )
}

function MenubarDemo() {
  const [grid, setGrid] = React.useState(true)
  const [zoom, setZoom] = React.useState("100")
  return (
    <Menubar
      aria-label="Editor"
      menus={[
        { label: "File", items: [{ label: "New tab", shortcut: "T", onSelect: () => toast("New tab") }, { label: "New window", shortcut: "N", onSelect: () => toast("New window") }, { type: "separator" }, { label: "Share", onSelect: () => toast("Share") }, { label: "Print", shortcut: "P", onSelect: () => toast("Print") }] },
        { label: "Edit", items: [{ label: "Undo", shortcut: "Z", onSelect: () => toast("Undo") }, { label: "Redo", shortcut: "Y", onSelect: () => toast("Redo") }, { type: "separator" }, { label: "Cut", onSelect: () => toast("Cut") }, { label: "Copy", onSelect: () => toast("Copy") }, { label: "Paste", onSelect: () => toast("Paste") }] },
        { label: "View", items: [{ type: "checkbox", label: "Show grid", checked: grid, onCheckedChange: setGrid }, { type: "separator" }, { type: "label", label: "Zoom" }, ...["75", "100", "150"].map((z) => ({ type: "radio" as const, label: `${z}%`, checked: zoom === z, onSelect: () => setZoom(z) }))] },
        { label: "Help", items: [{ label: "Documentation", onSelect: () => toast("Docs") }, { label: "Keyboard shortcuts", onSelect: () => toast("Shortcuts") }] },
      ]}
    />
  )
}

function NativeSelectDemo() {
  const [v, setV] = React.useState("")
  return (
    <div className="flex flex-col items-center gap-3">
      <NativeSelect aria-label="Timezone" placeholder="Choose a timezone" value={v} onChange={(e) => setV(e.target.value)}>
        <optgroup label="Europe"><option value="Europe/Berlin">Berlin</option><option value="Europe/London">London</option></optgroup>
        <optgroup label="Americas"><option value="America/New_York">New York</option><option value="America/Los_Angeles">Los Angeles</option></optgroup>
        <optgroup label="Asia"><option value="Asia/Tokyo">Tokyo</option></optgroup>
      </NativeSelect>
      <span className="font-mono text-xs text-muted">value: {v || "none"}</span>
    </div>
  )
}

function NavigationMenuDemo() {
  return (
    <NavigationMenu
      aria-label="Product"
      items={[
        { label: "Product", columns: 2, links: [
          { label: "Components", href: "#/docs/components/button", description: "80 tactile pieces to copy.", icon: <IconGrid /> },
          { label: "Charts", href: "#/docs/components/chart", description: "Area, line, bar and donut.", icon: <IconChart /> },
          { label: "Dashboard", href: "#/examples/dashboard", description: "A full admin panel example.", icon: <IconServer /> },
          { label: "Theming", href: "#/docs/theming", description: "Tokens for both themes.", icon: <IconSettings /> },
        ] },
        { label: "Resources", links: [
          { label: "Installation", href: "#/docs/installation", description: "Set up in one command." },
          { label: "CLI", href: "#/docs/cli", description: "init, add, list." },
        ] },
        { label: "Docs", href: "#/docs" },
      ]}
    />
  )
}

function ResizableDemo() {
  const pane = "grid h-full place-items-center p-4 text-center font-mono text-xs text-muted"
  return (
    <div className="h-72 w-full max-w-xl overflow-hidden rounded-hc bg-bg shadow-inset">
      <Resizable defaultSizes={[30, 70]} minSize={18}>
        <div className={pane}>Sidebar</div>
        <Resizable direction="vertical" defaultSizes={[60, 40]} minSize={20}>
          <div className={pane}>Editor</div>
          <div className={pane}>Terminal</div>
        </Resizable>
      </Resizable>
    </div>
  )
}

function SidebarDemo() {
  const [page, setPage] = React.useState("Overview")
  const nav = [
    { l: "Overview", i: <IconGrid /> },
    { l: "Customers", i: <IconUsers /> },
    { l: "Orders", i: <IconBag />, b: 12 },
    { l: "Analytics", i: <IconChart /> },
  ]
  return (
    <div className="h-[540px] w-full overflow-hidden rounded-hc bg-bg shadow-inset">
      <SidebarProvider className="h-full min-h-0" storageKey={false}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2.5 px-1 py-1">
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-bg shadow-inset-sm"><DotIcon icon="diamond" size={18} /></span>
              <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
                <div className="truncate text-[13.5px] font-semibold">Halcyon Labs</div>
                <div className="font-mono text-[11px] text-muted">production</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label="Workspace">
              <SidebarMenu>
                {nav.map((x) => <SidebarMenuButton key={x.l} icon={x.i} badge={x.b} tooltip={x.l} active={page === x.l} onClick={() => setPage(x.l)}>{x.l}</SidebarMenuButton>)}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup label="System">
              <SidebarMenu>
                <SidebarMenuButton icon={<IconServer />} tooltip="Infrastructure" active={page === "Infrastructure"} onClick={() => setPage("Infrastructure")}>Infrastructure</SidebarMenuButton>
                <SidebarMenuButton icon={<IconSettings />} tooltip="Settings" active={page === "Settings"} onClick={() => setPage("Settings")}>Settings</SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2.5 rounded-[14px] bg-raise p-2 shadow-raised-sm group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:p-1">
              <Avatar initials="MK" size={30} />
              <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden"><div className="truncate text-[13px] font-medium">Maurice K.</div><div className="text-xs text-muted">Owner</div></div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col gap-4 overflow-auto p-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h3 className="m-0 text-base font-semibold">{page}</h3>
            <span className="ml-auto hidden font-mono text-[11px] text-muted sm:block">Ctrl/⌘ + B</span>
          </div>
          <div className="grid grid-cols-1 flex-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((k) => <div key={k} className="min-h-20 rounded-2xl bg-surface shadow-raised-sm" />)}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

/* ---------- entries ---------- */

export const shadcnDemos: DemoEntry[] = [
  {
    name: "button-group", title: "Button Group", group: "Controls",
    description: "Joins buttons into one raised strip, like keys on a keyboard row. Engraved separators and text segments included; each key still sinks on its own.",
    Demo: ButtonGroupDemo,
    usage: `import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"

<ButtonGroup>
  <Button>Archive</Button>
  <ButtonGroupSeparator />
  <Button>Report</Button>
</ButtonGroup>`,
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the strip." },
      { name: "ButtonGroupSeparator", type: "component", description: "Engraved divider." },
      { name: "ButtonGroupText", type: "component", description: "Recessed text segment, e.g. a unit." },
    ],
  },
  {
    name: "field", title: "Field", group: "Forms",
    description: "Form field wiring without boilerplate. FieldLabel, FieldControl, FieldDescription and the error message get matching ids, aria-describedby, aria-invalid and aria-required automatically. Works with any form library.",
    Demo: FieldDemo,
    usage: `import { Field, FieldLabel, FieldControl, FieldDescription, Fieldset } from "@/components/ui/field"

<Field required error={errors.email}>
  <FieldLabel>Email</FieldLabel>
  <FieldControl><Input type="email" {...register("email")} /></FieldControl>
  <FieldDescription>We send receipts here.</FieldDescription>
</Field>`,
    props: [
      { name: "error", type: "ReactNode", description: "Error text; marks the control invalid and announces it." },
      { name: "required", type: "boolean", description: "Adds aria-required and a glowing asterisk." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Stacked, or label and control on one row (switches)." },
      { name: "FieldControl", type: "component", description: "Wraps any control and wires its id and aria attributes." },
      { name: "Fieldset", type: "{ legend?, description? }", description: "Groups related fields." },
    ],
  },
  {
    name: "input-group", title: "Input Group", group: "Forms",
    description: "A recessed well that holds an input with addons: icons, text such as https:// or USD, keycaps and buttons. The whole well lights up on focus and turns red when invalid.",
    Demo: InputGroupDemo,
    usage: `import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput defaultValue="halcyon.app" />
  <InputGroupButton>Copy</InputGroupButton>
</InputGroup>`,
    props: [
      { name: "InputGroupAddon", type: "component", description: "Icon or text; clicking it focuses the input." },
      { name: "InputGroupInput / InputGroupTextarea", type: "component", description: "The field itself." },
      { name: "InputGroupButton", type: "component", description: "Small raised key inside the well." },
    ],
  },
  {
    name: "native-select", title: "Native Select", group: "Forms",
    description: "A real <select> dressed as a raised key. It uses the platform picker, which is the best choice on phones and for very long lists.",
    Demo: NativeSelectDemo,
    usage: `import { NativeSelect } from "@/components/ui/native-select"

<NativeSelect placeholder="Choose a timezone" value={tz} onChange={(e) => setTz(e.target.value)}>
  <option value="Europe/Berlin">Berlin</option>
</NativeSelect>`,
    props: [
      { name: "placeholder", type: "string", description: "Disabled first option shown when empty." },
      { name: "...props", type: "SelectHTMLAttributes", description: "Passed to the select." },
    ],
  },
  {
    name: "date-picker", title: "Date Picker", group: "Forms",
    description: "A raised trigger that opens the Calendar in a floating panel. Pick a single day or a range; it closes and returns focus when the choice is complete.",
    Demo: DatePickerDemo,
    usage: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker value={due} onValueChange={setDue} />
<DatePicker mode="range" value={stay} onValueChange={setStay} />`,
    props: [
      { name: "mode", type: '"single" | "range"', default: '"single"', description: "One day or a start and end." },
      { name: "value / defaultValue", type: "Date | null  |  { from, to }", description: "Depends on mode." },
      { name: "min / max / isDisabled", type: "Date / Date / (d) => boolean", description: "Selectable days." },
      { name: "format / locale", type: "Intl.DateTimeFormatOptions / string", description: "Trigger label format." },
    ],
  },
  {
    name: "aspect-ratio", title: "Aspect Ratio", group: "Surfaces",
    description: "Keeps media at a fixed ratio. Images, video and iframes fill the box; optional inset or raised frame.",
    Demo: () => (
      <div className="grid w-full max-w-lg grid-cols-2 gap-4">
        <AspectRatio ratio={16 / 9} surface="inset"><div className="grid place-items-center font-mono text-xs text-muted">16 : 9</div></AspectRatio>
        <AspectRatio ratio={1} surface="raised"><div className="grid place-items-center"><DotIcon icon="ring" size={36} /></div></AspectRatio>
      </div>
    ),
    usage: `import { AspectRatio } from "@/components/ui/aspect-ratio"

<AspectRatio ratio={16 / 9} surface="inset">
  <img src="/cover.jpg" alt="" />
</AspectRatio>`,
    props: [
      { name: "ratio", type: "number", default: "16 / 9", description: "Width divided by height." },
      { name: "surface", type: '"none" | "inset" | "raised"', default: '"none"', description: "Frame style." },
    ],
  },
  {
    name: "collapsible", title: "Collapsible", group: "Surfaces",
    description: "Shows and hides a section. The height animates with the grid-rows trick, so nothing is measured, and hidden content is inert.",
    Demo: CollapsibleDemo,
    usage: `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger><Button>Details</Button></CollapsibleTrigger>
  <CollapsibleContent>...</CollapsibleContent>
</Collapsible>`,
    props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Controlled or uncontrolled." },
      { name: "CollapsibleChevron", type: "component", description: "Ready-made toggle key." },
    ],
  },
  {
    name: "item", title: "Item", group: "Surfaces",
    description: "A list row with media, title, description and actions, for settings, people, files and search results. Raised, inset or ghost; links lift on hover.",
    Demo: ItemDemo,
    usage: `import { Item, ItemGroup, ItemIcon } from "@/components/ui/item"

<Item media={<Avatar initials="AV" />} title="Ava" description="Owner" actions={<Badge>You</Badge>} />`,
    props: [
      { name: "media / title / description / actions", type: "ReactNode", description: "The four slots." },
      { name: "surface", type: '"raised" | "inset" | "ghost"', default: '"raised"', description: "Look." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Density." },
      { name: "href", type: "string", description: "Render as a link." },
    ],
  },
  {
    name: "carousel", title: "Carousel", group: "Surfaces",
    description: "A swipeable carousel built on native scroll-snap, so it feels right on every touch device. Raised arrows, dot indicators, arrow keys, several slides per view and optional autoplay that pauses on hover and respects reduced motion.",
    Demo: CarouselDemo,
    usage: `import { Carousel } from "@/components/ui/carousel"

<Carousel aria-label="Features" perView={1}>
  <Slide />
  <Slide />
</Carousel>`,
    props: [
      { name: "perView", type: "number", default: "1", description: "Slides visible at once; fractions give a peek." },
      { name: "gap", type: "number", default: "16", description: "Space between slides in px." },
      { name: "autoplay", type: "number", description: "Interval in ms." },
      { name: "loop", type: "boolean", default: "false", description: "Wrap around at the ends." },
      { name: "onIndexChange", type: "(i: number) => void", description: "Called when the slide changes." },
    ],
  },
  {
    name: "resizable", title: "Resizable", group: "Surfaces",
    description: "Split panels with draggable dividers. The handle is a recessed groove with a dot grip that glows while you drag. Arrow keys resize, Enter or a double-click resets, and sizes can be remembered.",
    Demo: ResizableDemo,
    usage: `import { Resizable } from "@/components/ui/resizable"

<Resizable defaultSizes={[30, 70]} minSize={15} storageKey="layout">
  <Sidebar />
  <Editor />
</Resizable>`,
    props: [
      { name: "direction", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Split direction." },
      { name: "defaultSizes", type: "number[]", description: "Percentages, equal by default." },
      { name: "minSize", type: "number | number[]", default: "10", description: "Minimum per panel in %." },
      { name: "storageKey", type: "string", description: "Persist sizes in localStorage." },
      { name: "onSizesChange", type: "(sizes: number[]) => void", description: "Called while resizing." },
    ],
  },
  {
    name: "alert-dialog", title: "Alert Dialog", group: "Overlays",
    description: "A confirmation that interrupts. Unlike Dialog it ignores backdrop clicks, focuses Cancel first and waits for async actions with a spinner on the action key.",
    Demo: AlertDialogDemo,
    usage: `import { AlertDialog } from "@/components/ui/alert-dialog"

<AlertDialog
  trigger={<Button variant="danger">Revoke key</Button>}
  tone="danger"
  title="Revoke this key?"
  description="Apps using it stop working right away."
  actionLabel="Revoke"
  onAction={() => api.revoke(key)}
/>`,
    props: [
      { name: "title / description", type: "ReactNode", description: "The question and its consequences." },
      { name: "onAction", type: "() => void | Promise", description: "A promise keeps the dialog open with a spinner until it settles." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "Red action key for destructive actions." },
      { name: "actionLabel / cancelLabel", type: "ReactNode", default: '"Continue" / "Cancel"', description: "Key labels." },
      { name: "open / onOpenChange / trigger", type: "—", description: "Controlled or with a trigger element." },
    ],
  },
  {
    name: "context-menu", title: "Context Menu", group: "Overlays",
    description: "A right-click menu that opens at the pointer and stays inside the viewport. Long-press on touch and Shift+F10 or the Menu key on the keyboard. Same items as Dropdown Menu, including checkboxes and radios.",
    Demo: ContextMenuDemo,
    usage: `import { ContextMenu } from "@/components/ui/context-menu"

<ContextMenu items={[{ label: "Copy link", onSelect: copy }, { type: "separator" }, { label: "Delete", danger: true, onSelect: remove }]}>
  <div>Right-click me</div>
</ContextMenu>`,
    props: [
      { name: "items", type: "DropdownItem[]", description: "item, separator, label, checkbox, radio." },
      { name: "children", type: "ReactElement", description: "The area that reacts." },
      { name: "disabled", type: "boolean", description: "Fall back to the browser menu." },
    ],
  },
  {
    name: "drawer", title: "Drawer", group: "Overlays",
    description: "A bottom drawer for phones that works on desktop too. Drag the handle or the panel down to dismiss; it follows your finger and springs back if you let go early. Safe-area aware.",
    Demo: DrawerDemo,
    usage: `import { Drawer } from "@/components/ui/drawer"

<Drawer trigger={<Button>Edit goal</Button>} title="Move goal" footer={<Button>Save</Button>}>
  ...
</Drawer>`,
    props: [
      { name: "trigger", type: "ReactElement", description: "Element that opens it." },
      { name: "title / description", type: "ReactNode", description: "Header." },
      { name: "footer", type: "ReactNode", description: "Sticky bottom row." },
      { name: "open / onOpenChange", type: "boolean", description: "Controlled mode." },
    ],
  },
  {
    name: "hover-card", title: "Hover Card", group: "Overlays",
    description: "A rich preview that appears when hovering a link or name, or when it gets keyboard focus. Stays open while the pointer is over the card.",
    Demo: HoverCardDemo,
    usage: `import { HoverCard } from "@/components/ui/hover-card"

<HoverCard content={<Profile user={user} />}>
  <a href={user.url}>@{user.name}</a>
</HoverCard>`,
    props: [
      { name: "content", type: "ReactNode", description: "Card body." },
      { name: "side / align", type: "Side / Align", default: '"bottom" / "center"', description: "Placement; flips when there is no room." },
      { name: "openDelay / closeDelay", type: "number", default: "500 / 200", description: "Hover intent timing." },
    ],
  },
  {
    name: "chart", title: "Chart", group: "Data",
    description: "Area, line, bar and donut charts in plain SVG, no chart library. Crosshair tooltips, arrow-key navigation, a draw-in on mount and five categorical colour slots per theme validated for colour-blind separation.",
    Demo: ChartDemo,
    usage: `import { AreaChart, BarChart, LineChart, DonutChart } from "@/components/ui/chart"

<AreaChart
  data={[{ month: "Jan", revenue: 18 }, ...]}
  index="month"
  series={[{ key: "revenue", label: "Revenue" }]}
  format={(v) => \`$\${v}k\`}
/>`,
    props: [
      { name: "data / index", type: "Record<string, string | number>[] / string", description: "Rows and the x-axis key." },
      { name: "series", type: "{ key, label, color? }[]", description: "One per line, area or bar; colours follow the chart slots." },
      { name: "format", type: "(v: number) => string", description: "Axis and tooltip values." },
      { name: "height / legend / title", type: "number / boolean / string", default: "240 / true / —", description: "Size, legend (2+ series) and screen-reader title." },
      { name: "DonutChart data", type: "{ label, value, color? }[]", description: "Segments; center shows the total or the hovered share." },
    ],
  },
  {
    name: "data-table", title: "Data Table", group: "Data",
    description: "Sorting, search, row selection, pagination and an optional one-level tree (child rows fold under their parent) on top of the Halcyon table style. Columns can hide on phones; sort state is announced with aria-sort.",
    Demo: DataTableDemo,
    usage: `import { DataTable, type DataTableColumn } from "@/components/ui/data-table"

const columns: DataTableColumn<Order>[] = [
  { key: "id", header: "Order", sortable: true, mono: true },
  { key: "amount", header: "Amount", sortable: true, align: "right" },
]

<DataTable data={orders} columns={columns} rowId={(r) => r.id} selectable pageSize={10} />`,
    props: [
      { name: "columns", type: "DataTableColumn<T>[]", description: "key, header, accessor?, cell?, sortable?, align?, mono? (no wrap), hideOnMobile?, hideBelow? (\"md\" | \"lg\" | \"xl\" | \"2xl\": drop minor columns on narrow desktops instead of scrolling sideways)" },
      { name: "data / rowId", type: "T[] / (row, i) => string", description: "Rows and their stable ids." },
      { name: "searchable", type: "boolean | string[]", default: "true", description: "Search field; optionally limited to keys. Keys that are not columns read row[key]." },
      { name: "selectable / onSelectionChange", type: "boolean / (ids) => void", description: "Checkbox column. The selection only ever contains rows that are still visible after search and filters." },
      { name: "renderCard", type: "(row) => ReactNode", description: "Phone layout: each row as a card below the sm breakpoint." },
      { name: "pageSize", type: "number", default: "10", description: "0 shows all rows." },
      { name: "parentId", type: "(row) => string | null", description: "Tree mode: child rows fold under their parent behind a toggle (collapsed by default); sorting keeps children with their parent, pages count top-level rows, search opens matches." },
      { name: "toolbar / empty / onRowClick", type: "ReactNode / ReactNode / (row) => void", description: "Extras." },
    ],
  },
  {
    name: "menubar", title: "Menubar", group: "Navigation",
    description: "A desktop-app menu bar. Once a menu is open, hovering another switches to it and Left/Right move between menus. Items support shortcuts, checkboxes and radio groups.",
    Demo: MenubarDemo,
    usage: `import { Menubar } from "@/components/ui/menubar"

<Menubar menus={[
  { label: "File", items: [{ label: "New tab", shortcut: "T", onSelect: newTab }] },
  { label: "View", items: [{ type: "checkbox", label: "Show grid", checked, onCheckedChange }] },
]} />`,
    props: [{ name: "menus", type: "{ label, items: DropdownItem[] }[]", description: "One entry per menu." }],
  },
  {
    name: "navigation-menu", title: "Navigation Menu", group: "Navigation",
    description: "Site navigation with dropdown panels (a mega menu). Opens on hover with a short intent delay, on click and with the keyboard; a raised thumb follows the open item.",
    Demo: NavigationMenuDemo,
    usage: `import { NavigationMenu } from "@/components/ui/navigation-menu"

<NavigationMenu items={[
  { label: "Product", columns: 2, links: [{ label: "Components", href: "/docs", description: "..." }] },
  { label: "Docs", href: "/docs" },
]} />`,
    props: [
      { name: "items", type: "{ label, href?, links?, content?, columns?, active? }[]", description: "Plain links or panels." },
    ],
  },
  {
    name: "sidebar", title: "Sidebar", group: "Navigation",
    description: "An app shell sidebar. On desktop it collapses to an icon rail (Ctrl/Cmd + B, remembered across visits); on phones it becomes an off-canvas panel with focus trap. Groups, badges, a footer and a trigger key included.",
    Demo: SidebarDemo,
    usage: `import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"

<SidebarProvider>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarMenu>
          <SidebarMenuButton icon={<Grid />} active tooltip="Overview">Overview</SidebarMenuButton>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset><SidebarTrigger /> ...</SidebarInset>
</SidebarProvider>`,
    props: [
      { name: "SidebarProvider defaultOpen / open / onOpenChange", type: "boolean", default: "true", description: "Expanded on desktop." },
      { name: "SidebarProvider storageKey / shortcut", type: "string | false", default: '"hc-sidebar" / "b"', description: "Persistence and keyboard toggle." },
      { name: "Sidebar side", type: '"left" | "right"', default: '"left"', description: "Edge." },
      { name: "SidebarMenuButton", type: "{ icon, active, badge, tooltip, href, linkAs, external }", description: "Menu row. Collapsed rows show tooltip (or the text) in a floating tooltip; linkAs renders href rows with e.g. Next.js Link; external drops the LED for links that leave the app." },
      { name: "useSidebar()", type: "hook", description: "open, toggle, isMobile..." },
    ],
  },
]
