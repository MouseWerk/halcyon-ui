import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { ThemeSwitch } from "@/components/ui/theme-switch"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Stat } from "@/components/ui/stat"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Toaster, toast } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"

function App() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-10">
      <header className="flex items-center"><h1 className="m-0 text-3xl font-bold tracking-tight">Halcyon UI on Vite</h1><div className="ml-auto"><ThemeSwitch /></div></header>
      <div className="grid gap-5 sm:grid-cols-2">
        <Stat label="Revenue" prefix="$" value={48.2} decimals={1} suffix="k" delta="+12.4%" spark={[18, 16, 20, 15, 19, 22, 21, 24]} />
        <Stat index={1} label="Users" value={3814} delta="+4.1%" spark={[10, 12, 11, 14, 13, 15, 16, 18]} />
      </div>
      <Card className="flex flex-col gap-4">
        <CardHeader><div><CardTitle>Controls</CardTitle><CardDescription>Copied in with the CLI</CardDescription></div></CardHeader>
        <div className="flex flex-wrap items-center gap-4">
          <Switch defaultChecked aria-label="Sync" />
          <Select aria-label="Region" defaultValue="eu" options={[{ value: "eu", label: "Frankfurt" }, { value: "us", label: "Virginia" }]} />
          <Button onClick={() => toast("Saved")}>Toast</Button>
          <Dialog>
            <DialogTrigger><Button variant="glow">Dialog</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Hello from Vite</DialogTitle><DialogDescription>Everything works.</DialogDescription></DialogHeader></DialogContent>
          </Dialog>
        </div>
        <Slider defaultValue={60} aria-label="Volume" />
      </Card>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster />
    </ErrorBoundary>
  </StrictMode>,
)
