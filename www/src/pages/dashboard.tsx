import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardActions } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { DotChart } from "@/components/ui/dot-chart"
import { Segmented } from "@/components/ui/segmented"
import { Nav, NavItem } from "@/components/ui/nav"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Switch } from "@/components/ui/switch"
import { StatusLamp } from "@/components/ui/status-lamp"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Meter } from "@/components/ui/meter"
import { DotIcon } from "@/components/ui/dot-icon"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { IconBag, IconBell, IconChart, IconDownload, IconGrid, IconSearch, IconServer, IconSettings, IconUsers } from "../site/icons"

const RANGES = {
  "7d": { labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], values: [0.9, 1.6, 1.8, 1.7, 2.1, 2.4, 1.3], unit: 0.2, fmt: (v: number) => `$${v.toFixed(1)}k` },
  "30d": { labels: Array.from({ length: 15 }, (_, i) => String(i * 2 + 1)), values: [1.2, 1.5, 1.4, 1.9, 1.6, 2.1, 1.8, 2.4, 2.2, 2.6, 2.3, 2.9, 2.7, 3.1, 3.4], unit: 0.3, fmt: (v: number) => `$${v.toFixed(1)}k` },
  "12m": { labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], values: [21, 24, 22, 27, 29, 31, 30, 34, 37, 36, 42, 48], unit: 4, fmt: (v: number) => `$${v}k` },
}

const ORDERS = [
  { id: "#40921", who: "Northwind Labs", plan: "Team", tone: "ok", status: "Paid", amt: "$1,240.00" },
  { id: "#40920", who: "Aster & Vale", plan: "Pro", tone: "ok", status: "Paid", amt: "$299.00" },
  { id: "#40919", who: "Kelp Studio", plan: "Pro", tone: "warn", status: "Pending", amt: "$299.00" },
  { id: "#40918", who: "Orbitwise GmbH", plan: "Enterprise", tone: "ok", status: "Paid", amt: "$8,900.00" },
  { id: "#40917", who: "Pinecone Coffee", plan: "Starter", tone: "bad", status: "Failed", amt: "$49.00" },
] as const

export function DashboardExample() {
  const [range, setRange] = React.useState<keyof typeof RANGES>("12m")
  const [page, setPage] = React.useState("Overview")
  const r = RANGES[range]
  const nav = [
    { l: "Overview", i: <IconGrid /> },
    { l: "Customers", i: <IconUsers /> },
    { l: "Orders", i: <IconBag />, c: 12 },
    { l: "Analytics", i: <IconChart /> },
    { l: "Infrastructure", i: <IconServer /> },
    { l: "Settings", i: <IconSettings /> },
  ]

  return (
    <div className="mx-auto grid grid-cols-1 w-full max-w-[1280px] gap-5 px-[max(16px,env(safe-area-inset-left))] pt-6 lg:grid-cols-[232px_minmax(0,1fr)]">
      <Card className="flex flex-col gap-4 self-start p-3 lg:sticky lg:top-[88px] lg:h-[calc(100dvh-112px)]">
        {/* workspace switcher */}
        <div className="hidden items-center gap-2.5 rounded-[14px] px-1.5 py-1 lg:flex">
          <span className="grid size-9 place-items-center rounded-[11px] bg-bg shadow-inset-sm"><DotIcon icon="diamond" size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold">Halcyon Labs</div>
            <div className="font-mono text-[11px] text-muted">production</div>
          </div>
          <StatusLamp tone="ok" />
        </div>
        <div className="hidden px-2 font-mono text-[10px] uppercase tracking-[.16em] text-muted lg:block">Workspace</div>
        <Nav className="max-lg:flex-row max-lg:overflow-x-auto max-lg:scrollbar-none max-lg:[mask-image:linear-gradient(to_right,black_82%,transparent)]">
          {nav.slice(0, 4).map((x) => <NavItem key={x.l} icon={x.i} count={x.c} active={page === x.l} onClick={() => setPage(x.l)} className="max-lg:w-auto max-lg:shrink-0">{x.l}</NavItem>)}
          <div className="mx-2 my-1 hidden h-px bg-line lg:block" />
          {nav.slice(4).map((x) => <NavItem key={x.l} icon={x.i} count={x.c} active={page === x.l} onClick={() => setPage(x.l)} className="max-lg:w-auto max-lg:shrink-0">{x.l}</NavItem>)}
        </Nav>

        {/* usage + account pinned to the bottom */}
        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <div className="flex flex-col gap-2 rounded-[16px] bg-bg p-3 shadow-inset-sm">
            <div className="flex justify-between text-xs"><span className="text-muted">Storage</span><span className="font-mono">64 / 100 GB</span></div>
            <Meter value={64} segments={14} />
          </div>
          <div className="flex items-center gap-2.5 rounded-[16px] bg-raise p-2.5 shadow-raised-sm">
            <Avatar initials="MK" />
            <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-medium">Maurice K.</div><div className="text-xs text-muted">Owner, Pro plan</div></div>
            <Button size="icon" variant="ghost" aria-label="Settings" className="size-8 rounded-[10px]" onClick={() => setPage("Settings")}><IconSettings /></Button>
          </div>
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="font-mono text-[11.5px] text-muted">workspace / {page.toLowerCase()}</div>
            <h1 className="m-0 text-[22px] font-semibold tracking-tight">Good evening</h1>
          </div>
          <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
            <Input className="min-w-0 flex-1 sm:w-[300px] sm:flex-none" icon={<IconSearch />} placeholder="Search orders, logs" trailing={<Kbd>Ctrl K</Kbd>} />
            <Button size="icon" aria-label="Notifications" className="shrink-0" onClick={() => toast("3 unread notifications")}><IconBell /><span className="absolute right-2.5 top-2.5 size-[7px] rounded-full bg-glow shadow-[0_0_8px_var(--hc-glow)]" /></Button>
            <Button variant="glow" className="max-sm:hidden" onClick={() => toast("Deploy started for build 0.4.13", { tone: "ok" })}>Deploy</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Stat index={0} label="Monthly revenue" prefix="$" value={48.2} decimals={1} suffix="k" delta="+12.4%" spark={[18, 16, 20, 15, 19, 22, 21, 24, 23, 27]} note="sample" />
          <Stat index={1} label="Active users" value={3814} delta="+4.1%" spark={[10, 12, 11, 14, 13, 13, 15, 16, 15, 18]} note="sample" />
          <Stat index={2} label="Churn" value={2.3} decimals={1} suffix="%" delta="+0.3 pt" trend="down" spark={[8, 7, 9, 8, 8, 10, 9, 11, 10, 12]} note="sample" />
          <Stat index={3} label="p95 latency" value={184} suffix="ms" delta="-22 ms" spark={[24, 22, 23, 20, 21, 19, 18, 19, 17, 15]} note="sample" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card index={4}>
            <CardHeader>
              <div><CardTitle>Revenue</CardTitle><CardDescription>Each dot is booked revenue, sample data</CardDescription></div>
              <CardActions>
                <Segmented value={range} onValueChange={setRange} aria-label="Range" options={[{ value: "7d", label: "7D" }, { value: "30d", label: "30D" }, { value: "12m", label: "12M" }]} />
              </CardActions>
            </CardHeader>
            <div><DotChart labels={r.labels} values={r.values} unit={r.unit} format={r.fmt} /></div>
          </Card>

          <Card index={5}>
            <CardHeader><div><CardTitle>Services</CardTitle><CardDescription>Live status, sample data</CardDescription></div></CardHeader>
            <div className="flex flex-col gap-2.5">
              {([["ok", "API gateway", "99.99%", "eu-central"], ["ok", "Auth", "99.97%", "global"], ["warn", "Job queue", "backlog 1.2k", "us-east"], ["ok", "Postgres primary", "41% cpu", "eu-central"], ["bad", "Webhooks", "3 failing", "retrying"]] as const).map(([t, n, a, b]) => (
                <div key={n} className="flex items-center gap-3 rounded-[13px] bg-bg px-3 py-2.5 shadow-inset">
                  <StatusLamp tone={t} />
                  <span className="font-medium">{n}</span>
                  <span className="ml-auto text-right font-mono text-[11.5px] leading-tight text-muted">{a}<br />{b}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Card index={6}>
            <CardHeader>
              <div><CardTitle>Recent orders</CardTitle><CardDescription>Sample rows</CardDescription></div>
              <CardActions><Button onClick={() => toast("Export queued")}><IconDownload />Export</Button></CardActions>
            </CardHeader>
            <Table className="max-sm:min-w-0">
              <TableHeader><TableRow><TableHead className="max-sm:hidden">Order</TableHead><TableHead>Customer</TableHead><TableHead className="max-md:hidden">Plan</TableHead><TableHead>Status</TableHead><TableHead align="right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {ORDERS.map((o) => (
                  <TableRow key={o.id} onClick={() => toast(`Opened ${o.id}`)}>
                    <TableCell mono className="max-sm:hidden">{o.id}</TableCell><TableCell className="max-sm:rounded-l-xl">{o.who}</TableCell><TableCell className="max-md:hidden">{o.plan}</TableCell>
                    <TableCell><Badge tone={o.tone}>{o.status}</Badge></TableCell><TableCell align="right">{o.amt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card index={7}>
            <CardHeader>
              <div><CardTitle>Controls</CardTitle><CardDescription>Workspace settings</CardDescription></div>
            </CardHeader>
            <div className="flex flex-col">
              {[["Maintenance mode", "Show a status page to visitors", false], ["New sign-ups", "Allow self-serve registration", true], ["Beta features", "Ship flagged features to 10%", true], ["Weekly digest", "Email a summary every Monday", false]].map(([t, d, on]) => (
                <div key={t as string} className="flex items-center gap-4 border-b border-line py-2.5 last:border-0">
                  <div className="min-w-0"><div className="font-medium">{t}</div><div className="text-xs text-muted">{d}</div></div>
                  <Switch className="ml-auto" defaultChecked={on as boolean} aria-label={t as string} onCheckedChange={(v) => toast(`${t} ${v ? "on" : "off"}`)} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted"><StatusLamp tone="ok" steady />Last change saved 2 min ago</div>
          </Card>
        </div>
      </div>
    </div>
  )
}
