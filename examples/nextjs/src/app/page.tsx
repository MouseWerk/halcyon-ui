// Server component: renders Halcyon components on the server, interactive
// ones hydrate on the client through their "use client" boundary.
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Meter } from "@/components/ui/meter"
import { StatusLamp } from "@/components/ui/status-lamp"
import { Kbd } from "@/components/ui/kbd"
import { Avatar } from "@/components/ui/avatar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Showcase } from "./showcase"

export default function Page() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6 sm:p-10">
      <header className="flex items-center gap-4">
        <div>
          <Breadcrumb items={[{ label: "examples", href: "/" }, { label: "nextjs" }]} />
          <h1 className="m-0 mt-2 text-3xl font-bold tracking-tight">Halcyon UI on Next.js</h1>
        </div>
        <div className="ml-auto"><ThemeSwitch /></div>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Revenue" prefix="$" value={48.2} decimals={1} suffix="k" delta="+12.4%" spark={[18, 16, 20, 15, 19, 22, 21, 24]} />
        <Stat index={1} label="Users" value={3814} delta="+4.1%" spark={[10, 12, 11, 14, 13, 15, 16, 18]} />
        <Stat index={2} label="Churn" value={2.3} decimals={1} suffix="%" delta="+0.3 pt" trend="down" spark={[8, 7, 9, 8, 10, 9, 11, 12]} />
      </div>

      <Alert tone="warn" title="Rendered on the server">This alert, the stats and the table are server components. Press <Kbd>Ctrl K</Kbd> for the client-side palette.</Alert>

      <Showcase />

      <Card>
        <CardHeader><div><CardTitle>Orders</CardTitle><CardDescription>Static table, no client JS</CardDescription></div></CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead align="right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow><TableCell mono>#40921</TableCell><TableCell>Northwind Labs</TableCell><TableCell><Badge tone="ok">Paid</Badge></TableCell><TableCell align="right">$1,240.00</TableCell></TableRow>
            <TableRow><TableCell mono>#40919</TableCell><TableCell>Kelp Studio</TableCell><TableCell><Badge tone="warn">Pending</Badge></TableCell><TableCell align="right">$299.00</TableCell></TableRow>
          </TableBody>
        </Table>
      </Card>

      <Card className="flex flex-wrap items-center gap-5">
        <Avatar initials="MK" />
        <StatusLamp tone="ok" />
        <Spinner />
        <Skeleton className="h-4 w-40" />
        <Separator orientation="vertical" className="h-8" />
        <Meter value={64} className="w-48" />
      </Card>
    </main>
  )
}
