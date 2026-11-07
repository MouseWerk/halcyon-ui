import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Select } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Sheet } from "@/components/ui/sheet"
import { Popover } from "@/components/ui/popover"
import { Tooltip } from "@/components/ui/tooltip"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { CommandPalette } from "@/components/ui/command"
import { Alert } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Pagination } from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Kbd } from "@/components/ui/kbd"
import { toast } from "@/components/ui/toast"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import type { DemoEntry } from "./demos"
import { IconBag, IconBell, IconChart, IconCopy, IconDownload, IconGrid, IconSearch, IconSettings, IconUsers } from "./icons"

function CheckboxDemo() {
  const [items, setItems] = React.useState([true, false, true])
  const all = items.every(Boolean), none = items.every((x) => !x)
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="All notifications" checked={all ? true : none ? false : "indeterminate"} onCheckedChange={(v) => setItems(items.map(() => v))} />
      <div className="ml-8 flex flex-col gap-3">
        {["Deploys", "Failed payments", "New sign-ups"].map((l, i) => (
          <Checkbox key={l} label={l} checked={items[i]} onCheckedChange={(v) => setItems(items.map((x, k) => (k === i ? v : x)))} />
        ))}
      </div>
    </div>
  )
}

function SliderDemo() {
  const [v, setV] = React.useState(64)
  const [replicas, setReplicas] = React.useState(3)
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[13px]"><Label>Volume</Label><span className="font-mono text-muted">{v}%</span></div>
        <Slider value={v} onValueChange={setV} aria-label="Volume" format={(x) => `${x}%`} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[13px]"><Label>Replicas</Label><span className="font-mono text-muted">{replicas}</span></div>
        <Slider value={replicas} onValueChange={setReplicas} min={1} max={9} ticks={9} aria-label="Replicas" />
      </div>
    </div>
  )
}

function CommandDemo() {
  const [open, setOpen] = React.useState(false)
  const go = (s: string) => () => toast(s)
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="glow" onClick={() => setOpen(true)}><IconSearch /> Open command palette</Button>
      <span className="max-w-xs text-center text-xs text-muted">In your app it also opens with <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>. On this site that shortcut opens the docs search.</span>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        hotkey={false}
        items={[
          { id: "o", label: "Overview", group: "Navigate", icon: <IconGrid />, onSelect: go("Overview") },
          { id: "c", label: "Customers", group: "Navigate", icon: <IconUsers />, onSelect: go("Customers") },
          { id: "or", label: "Orders", group: "Navigate", icon: <IconBag />, onSelect: go("Orders") },
          { id: "a", label: "Analytics", group: "Navigate", icon: <IconChart />, onSelect: go("Analytics") },
          { id: "d", label: "Deploy production", group: "Actions", icon: <IconDownload />, shortcut: "D", onSelect: go("Deploy started") },
          { id: "n", label: "Notification settings", group: "Actions", icon: <IconBell />, onSelect: go("Notifications") },
          { id: "s", label: "Workspace settings", group: "Actions", icon: <IconSettings />, keywords: ["preferences"], onSelect: go("Settings") },
        ]}
      />
    </div>
  )
}

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error("Chart data was undefined")
  return <div className="rounded-2xl bg-surface p-4 text-sm shadow-raised">Revenue widget is fine.</div>
}

function ErrorBoundaryDemo() {
  const [armed, setArmed] = React.useState(false)
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ErrorBoundary resetKeys={[armed]} onError={() => toast("Caught a render error", { tone: "bad" })}>
        <Bomb armed={armed} />
      </ErrorBoundary>
      <div className="flex gap-2">
        <Button variant="danger" onClick={() => setArmed(true)}>Break the widget</Button>
        <Button onClick={() => setArmed(false)}>Fix it</Button>
      </div>
      <p className="m-0 text-xs text-muted">The rest of this page keeps working while the widget is broken.</p>
    </div>
  )
}

function DialogDemo() {
  const [text, setText] = React.useState("")
  const ok = text.trim() === "Halcyon Labs"
  return (
    <Dialog onOpenChange={(o) => !o && setText("")}>
      <DialogTrigger><Button variant="danger">Delete workspace</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this workspace?</DialogTitle>
          <DialogDescription>All projects, deploys and logs will be removed. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-ws">Type <span className="rounded-md bg-bg px-1.5 py-0.5 font-mono text-[12px] shadow-inset-sm">Halcyon Labs</span> to confirm</Label>
          <Input id="confirm-ws" value={text} onChange={(e) => setText(e.target.value)} placeholder="Halcyon Labs" autoComplete="off" />
        </div>
        <DialogFooter>
          <DialogClose><Button>Cancel</Button></DialogClose>
          <DialogClose><Button variant="danger" disabled={!ok} onClick={() => toast("Workspace deleted (demo)", { tone: "bad" })}>Delete workspace</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaginationDemo() {
  const [p, setP] = React.useState(4)
  return <Pagination page={p} pageCount={12} onPageChange={setP} />
}

function SkeletonDemo() {
  return (
    <div className="flex w-full max-w-sm items-center gap-4 rounded-2xl bg-surface p-5 shadow-raised">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-1 flex-col gap-2.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  )
}

export const moreDemos: DemoEntry[] = [
  {
    name: "checkbox", title: "Checkbox", group: "Forms",
    description: "A recessed box. When checked a glowing key pops into the well and the tick draws itself. Supports the indeterminate state.",
    Demo: CheckboxDemo,
    usage: `import { Checkbox } from "@/components/ui/checkbox"

<Checkbox label="Deploys" checked={on} onCheckedChange={setOn} />
<Checkbox checked="indeterminate" />`,
    props: [
      { name: "checked", type: 'boolean | "indeterminate"', description: "Controlled state." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Initial state." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called on toggle." },
      { name: "label", type: "ReactNode", description: "Clickable label next to the box." },
    ],
  },
  {
    name: "radio-group", title: "Radio Group", group: "Forms",
    description: "Recessed wells; the chosen one gets a glowing bead that springs in. Arrow keys move the choice.",
    Demo: () => (
      <RadioGroup defaultValue="pro" className="w-72">
        <RadioItem value="starter" label="Starter" description="1 project, community support" />
        <RadioItem value="pro" label="Pro" description="Unlimited projects, email support" />
        <RadioItem value="team" label="Team" description="SSO, audit log, priority support" />
      </RadioGroup>
    ),
    usage: `import { RadioGroup, RadioItem } from "@/components/ui/radio-group"

<RadioGroup value={plan} onValueChange={setPlan}>
  <RadioItem value="starter" label="Starter" />
  <RadioItem value="pro" label="Pro" description="Unlimited projects" />
</RadioGroup>`,
    props: [
      { name: "value / defaultValue", type: "string", description: "Selected value." },
      { name: "onValueChange", type: "(v: string) => void", description: "Called on change." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Layout and arrow keys." },
    ],
  },
  {
    name: "slider", title: "Slider", group: "Forms",
    description: "The filled part of the track is a row of lit dots. The knob lights up and grows while dragged and shows its value.",
    Demo: SliderDemo,
    usage: `import { Slider } from "@/components/ui/slider"

<Slider value={volume} onValueChange={setVolume} aria-label="Volume" />`,
    props: [
      { name: "value / defaultValue", type: "number", default: "50", description: "Current value." },
      { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "Range." },
      { name: "ticks", type: "number", description: "Show tick dots." },
      { name: "format", type: "(v: number) => string", description: "Value bubble text." },
    ],
  },
  {
    name: "select", title: "Select", group: "Forms",
    description: "A raised trigger opens a floating listbox. Arrow keys, Home, End, typeahead and Escape all work.",
    Demo: () => (
      <div className="flex flex-col gap-2">
        <Label htmlFor="region">Region</Label>
        <Select id="region" defaultValue="eu" options={[
          { value: "eu", label: "Frankfurt", description: "eu-central-1" },
          { value: "us", label: "Virginia", description: "us-east-1" },
          { value: "ap", label: "Singapore", description: "ap-southeast-1" },
          { value: "sa", label: "Sao Paulo", description: "sa-east-1", disabled: true },
        ]} />
      </div>
    ),
    usage: `import { Select } from "@/components/ui/select"

<Select
  value={region}
  onValueChange={setRegion}
  options={[{ value: "eu", label: "Frankfurt" }, { value: "us", label: "Virginia" }]}
/>`,
    props: [
      { name: "options", type: "{ value, label, description?, disabled? }[]", description: "Choices." },
      { name: "value / defaultValue", type: "string", description: "Selected value." },
      { name: "onValueChange", type: "(v: string) => void", description: "Called on select." },
      { name: "placeholder", type: "string", default: '"Select"', description: "Shown with no value." },
    ],
  },
  {
    name: "textarea", title: "Textarea", group: "Forms",
    description: "Recessed multi-line field that can grow with its content and count characters.",
    Demo: () => <Textarea className="w-96 max-w-full" placeholder="Release notes for build 0.4.13" maxLength={200} autoGrow={220} />,
    usage: `import { Textarea } from "@/components/ui/textarea"

<Textarea maxLength={200} autoGrow={240} placeholder="Release notes" />`,
    props: [
      { name: "autoGrow", type: "number", description: "Grow up to this height in px." },
      { name: "counter", type: "boolean", default: "true", description: "Show count when maxLength is set." },
    ],
  },
  {
    name: "label", title: "Label", group: "Forms",
    description: "Form label with an optional muted hint.",
    Demo: () => (
      <div className="flex w-80 flex-col gap-2">
        <Label htmlFor="ws" hint="Shown in the sidebar">Workspace name</Label>
        <Input id="ws" defaultValue="Halcyon Labs" />
      </div>
    ),
    usage: `import { Label } from "@/components/ui/label"

<Label htmlFor="name" hint="optional">Name</Label>`,
    props: [{ name: "hint", type: "ReactNode", description: "Muted text after the label." }],
  },
  {
    name: "tabs", title: "Tabs", group: "Navigation",
    description: "A recessed rail with a raised thumb that springs to the active tab. Arrow keys, Home and End switch tabs.",
    Demo: () => (
      <Tabs defaultValue="overview" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="rounded-2xl bg-surface p-5 text-sm shadow-raised">Three services running, one warning.</TabsContent>
        <TabsContent value="usage" className="rounded-2xl bg-surface p-5 text-sm shadow-raised">64 of 100 GB storage used this month.</TabsContent>
        <TabsContent value="billing" className="rounded-2xl bg-surface p-5 text-sm shadow-raised">Next invoice: $299.00 on Dec 1.</TabsContent>
      </Tabs>
    ),
    usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="usage">Usage</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="usage">...</TabsContent>
</Tabs>`,
    props: [
      { name: "defaultValue", type: "string", description: "Initially active tab." },
      { name: "value / onValueChange", type: "string", description: "Controlled mode." },
    ],
  },
  {
    name: "accordion", title: "Accordion", group: "Surfaces",
    description: "Raised plates that sink into the page when opened. The plus key rotates and lights up.",
    Demo: () => (
      <Accordion defaultValue={["a"]} className="w-full max-w-md">
        <AccordionItem value="a"><AccordionTrigger>Can I change the components?</AccordionTrigger><AccordionContent>Yes. They are copied into your project, so you own the code.</AccordionContent></AccordionItem>
        <AccordionItem value="b"><AccordionTrigger>Does it work with Next.js?</AccordionTrigger><AccordionContent>Yes. Interactive parts are marked "use client" and the theme is SSR safe.</AccordionContent></AccordionItem>
        <AccordionItem value="c"><AccordionTrigger>Is there a dark mode?</AccordionTrigger><AccordionContent>Every token has a dark value. The glow turns violet at night.</AccordionContent></AccordionItem>
      </Accordion>
    ),
    usage: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

<Accordion type="single" defaultValue={["a"]}>
  <AccordionItem value="a">
    <AccordionTrigger>Question</AccordionTrigger>
    <AccordionContent>Answer</AccordionContent>
  </AccordionItem>
</Accordion>`,
    props: [
      { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Whether several can be open." },
      { name: "defaultValue", type: "string[]", default: "[]", description: "Initially open items." },
    ],
  },
  {
    name: "scroll-area", title: "Scroll Area", group: "Surfaces",
    description: "Scroll container whose edges fade only where more content is hidden, with the tactile Halcyon scrollbar.",
    Demo: () => (
      <ScrollArea className="h-56 w-72 rounded-2xl bg-bg p-3 shadow-inset" scrollbar="inset">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-[13px] shadow-raised-sm">
              <span>Build 0.4.{20 - i}</span><span className="font-mono text-[11px] text-muted">{i + 2} h ago</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    ),
    usage: `import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-64" scrollbar="inset">...</ScrollArea>`,
    props: [
      { name: "orientation", type: '"vertical" | "horizontal" | "both"', default: '"vertical"', description: "Scroll axis." },
      { name: "fade", type: "boolean", default: "true", description: "Edge fades." },
      { name: "scrollbar", type: '"float" | "inset" | "none"', default: '"float"', description: "Scrollbar style." },
    ],
  },
  {
    name: "separator", title: "Separator", group: "Surfaces",
    description: "An engraved groove that catches the light, or a dotted rule.",
    Demo: () => (
      <div className="flex w-80 flex-col gap-5 text-sm">
        <span>Account</span><Separator /><span>Billing</span><Separator variant="dots" /><span>Danger zone</span>
      </div>
    ),
    usage: `import { Separator } from "@/components/ui/separator"

<Separator />
<Separator variant="dots" />`,
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction." },
      { name: "variant", type: '"groove" | "dots"', default: '"groove"', description: "Style." },
    ],
  },
  {
    name: "dialog", title: "Dialog", group: "Overlays",
    description: "The page dims and blurs and the panel rises out of it with a spring. Focus is trapped, Escape and the backdrop close it.",
    Demo: DialogDemo,
    usage: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose><Button>Close</Button></DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    props: [
      { name: "open / onOpenChange", type: "boolean", description: "Controlled mode on <Dialog>." },
      { name: "dismissible", type: "boolean", default: "true", description: "Backdrop click closes (DialogContent)." },
      { name: "showClose", type: "boolean", default: "true", description: "Corner close key (DialogContent)." },
    ],
  },
  {
    name: "sheet", title: "Sheet", group: "Overlays",
    description: "A floating panel that springs in from any edge. Good for filters, details and mobile navigation.",
    Demo: () => (
      <div className="flex flex-wrap justify-center gap-3">
        {(["right", "left", "bottom"] as const).map((s) => (
          <Sheet key={s} side={s} title="Filters" description="Narrow down the order list." trigger={<Button>Open {s}</Button>}>
            <div className="flex flex-col gap-4">
              <Checkbox label="Paid" defaultChecked />
              <Checkbox label="Pending" defaultChecked />
              <Checkbox label="Failed" />
              <Separator />
              <div className="flex items-center justify-between text-sm"><span>Only enterprise</span><Switch aria-label="Only enterprise" /></div>
            </div>
          </Sheet>
        ))}
      </div>
    ),
    usage: `import { Sheet } from "@/components/ui/sheet"

<Sheet side="right" title="Filters" trigger={<Button>Filters</Button>}>
  ...
</Sheet>`,
    props: [
      { name: "side", type: '"left" | "right" | "top" | "bottom"', default: '"right"', description: "Edge it slides from." },
      { name: "trigger", type: "ReactElement", description: "Element that opens it." },
      { name: "title / description", type: "ReactNode", description: "Header text." },
      { name: "open / onOpenChange", type: "boolean", description: "Controlled mode." },
    ],
  },
  {
    name: "popover", title: "Popover", group: "Overlays",
    description: "A floating raised panel anchored to its trigger. It flips when there is no room and scales out from the anchor.",
    Demo: () => (
      <Popover trigger={<Button>Share</Button>}>
        <div className="flex w-64 flex-col gap-3">
          <div className="text-sm font-semibold">Share dashboard</div>
          <Input defaultValue="halcyon.app/d/8f2k" trailing={<button type="button" aria-label="Copy link" className="text-muted hover:text-ink" onClick={() => toast("Link copied")}><IconCopy /></button>} />
          <Checkbox label="Anyone with the link can view" defaultChecked />
        </div>
      </Popover>
    ),
    usage: `import { Popover } from "@/components/ui/popover"

<Popover trigger={<Button>Share</Button>} side="bottom" align="center">
  ...
</Popover>`,
    props: [
      { name: "trigger", type: "ReactElement", description: "Toggles the popover." },
      { name: "side", type: '"top" | "bottom" | "left" | "right"', default: '"bottom"', description: "Preferred side." },
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment." },
    ],
  },
  {
    name: "tooltip", title: "Tooltip", group: "Overlays",
    description: "A small raised label that appears on hover and keyboard focus.",
    Demo: () => (
      <div className="flex gap-3">
        {(["top", "bottom", "left", "right"] as const).map((s) => (
          <Tooltip key={s} content={`Tooltip on ${s}`} side={s}><Button size="sm">{s}</Button></Tooltip>
        ))}
      </div>
    ),
    usage: `import { Tooltip } from "@/components/ui/tooltip"

<Tooltip content="Copy link"><Button size="icon"><CopyIcon /></Button></Tooltip>`,
    props: [
      { name: "content", type: "ReactNode", description: "Tooltip text." },
      { name: "side", type: '"top" | "bottom" | "left" | "right"', default: '"top"', description: "Preferred side." },
      { name: "delay", type: "number", default: "350", description: "Delay before showing, in ms." },
    ],
  },
  {
    name: "dropdown-menu", title: "Dropdown Menu", group: "Overlays",
    description: "Menu in a floating panel with labels, separators, shortcuts and checkbox items. Arrow keys move a recessed highlight.",
    Demo: function DropdownDemo() {
      const [compact, setCompact] = React.useState(false)
      return (
        <DropdownMenu
          trigger={<Button>Options</Button>}
          items={[
            { type: "label", label: "Order #40921" },
            { label: "View details", icon: <IconSearch />, shortcut: "V", onSelect: () => toast("Details") },
            { label: "Download invoice", icon: <IconDownload />, shortcut: "D", onSelect: () => toast("Invoice downloaded", { tone: "ok" }) },
            { type: "separator" },
            { type: "checkbox", label: "Compact rows", checked: compact, onCheckedChange: setCompact },
            { type: "separator" },
            { label: "Refund order", danger: true, onSelect: () => toast("Refund started", { tone: "bad" }) },
          ]}
        />
      )
    },
    usage: `import { DropdownMenu } from "@/components/ui/dropdown-menu"

<DropdownMenu
  trigger={<Button>Options</Button>}
  items={[
    { type: "label", label: "Order" },
    { label: "Download", shortcut: "D", onSelect: download },
    { type: "separator" },
    { label: "Refund", danger: true, onSelect: refund },
  ]}
/>`,
    props: [
      { name: "items", type: "DropdownItem[]", description: "item, label, separator or checkbox entries." },
      { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment to the trigger." },
    ],
  },
  {
    name: "command", title: "Command Palette", group: "Overlays",
    description: "A Ctrl or Cmd + K palette with fuzzy search, groups, shortcuts and full keyboard control.",
    Demo: CommandDemo,
    usage: `import { CommandPalette } from "@/components/ui/command"

<CommandPalette items={[
  { id: "deploy", label: "Deploy production", group: "Actions", onSelect: deploy },
  { id: "orders", label: "Orders", group: "Navigate", onSelect: () => router.push("/orders") },
]} />`,
    props: [
      { name: "items", type: "CommandItem[]", description: "id, label, group, icon, shortcut, keywords, onSelect." },
      { name: "hotkey", type: "string | false", default: '"k"', description: "Ctrl/Cmd + this key toggles it." },
      { name: "open / onOpenChange", type: "boolean", description: "Controlled mode." },
    ],
  },
  {
    name: "alert", title: "Alert", group: "Feedback",
    description: "A recessed message well. The LED on the left carries the tone.",
    Demo: () => (
      <div className="flex w-full max-w-lg flex-col gap-3">
        <Alert title="Build 0.4.13 is live">Deployed to eu-central in 48 seconds.</Alert>
        <Alert tone="warn" title="Job queue backlog">1,240 jobs are waiting. Workers scale up automatically.</Alert>
        <Alert tone="bad" title="Webhook endpoint failing" action={<Button size="sm">Retry</Button>}>3 deliveries to api.northwind.dev returned 502.</Alert>
      </div>
    ),
    usage: `import { Alert } from "@/components/ui/alert"

<Alert tone="warn" title="Job queue backlog">1,240 jobs waiting.</Alert>`,
    props: [
      { name: "tone", type: '"info" | "ok" | "warn" | "bad"', default: '"info"', description: "LED color." },
      { name: "title", type: "ReactNode", description: "Bold first line." },
      { name: "action", type: "ReactNode", description: "Element on the right." },
    ],
  },
  {
    name: "skeleton", title: "Skeleton", group: "Feedback",
    description: "A recessed placeholder with a dot-matrix texture and a soft glow sweeping across it.",
    Demo: SkeletonDemo,
    usage: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-48" />`,
    props: [],
  },
  {
    name: "spinner", title: "Spinner", group: "Feedback",
    description: "A ring of dots with a glowing comet running around it.",
    Demo: () => (
      <div className="flex items-center gap-8">
        <Spinner size={18} /><Spinner size={28} /><Spinner size={44} dots={14} />
        <Button variant="glow" disabled><Spinner size={14} dots={8} /> Deploying</Button>
      </div>
    ),
    usage: `import { Spinner } from "@/components/ui/spinner"

<Spinner size={24} />`,
    props: [
      { name: "size", type: "number", default: "24", description: "Size in px." },
      { name: "dots", type: "number", default: "10", description: "Dots in the ring." },
      { name: "label", type: "string", default: '"Loading"', description: "Screen reader text." },
    ],
  },
  {
    name: "breadcrumb", title: "Breadcrumb", group: "Navigation",
    description: "A monospace path with dot separators. The current page sits in a small raised chip.",
    Demo: () => <Breadcrumb items={[{ label: "workspace", href: "#" }, { label: "orders", href: "#" }, { label: "#40921" }]} />,
    usage: `import { Breadcrumb } from "@/components/ui/breadcrumb"

<Breadcrumb items={[{ label: "workspace", href: "/" }, { label: "orders" }]} />`,
    props: [{ name: "items", type: "{ label, href? }[]", description: "Path; the last one is the current page." }],
  },
  {
    name: "pagination", title: "Pagination", group: "Navigation",
    description: "Page keys in a recessed rail. The current page is a raised key with the glow ring.",
    Demo: PaginationDemo,
    usage: `import { Pagination } from "@/components/ui/pagination"

<Pagination page={page} pageCount={12} onPageChange={setPage} />`,
    props: [
      { name: "page", type: "number", description: "Current page (1-based)." },
      { name: "pageCount", type: "number", description: "Total pages." },
      { name: "onPageChange", type: "(p: number) => void", description: "Called with the new page." },
      { name: "siblings", type: "number", default: "1", description: "Pages shown around the current one." },
    ],
  },
  {
    name: "error-boundary", title: "Error Boundary", group: "Feedback",
    description: "A safety net for any part of your UI. If something inside throws while rendering, only that part turns into a recessed panel with a retry key. The rest of the page keeps working.",
    Demo: ErrorBoundaryDemo,
    usage: `import { ErrorBoundary } from "@/components/ui/error-boundary"

<ErrorBoundary resetKeys={[pathname]} onError={(e) => report(e)}>
  <RevenueWidget />
</ErrorBoundary>`,
    props: [
      { name: "fallback", type: "(error, reset) => ReactNode", description: "Custom fallback UI." },
      { name: "onError", type: "(error, info) => void", description: "Report the error." },
      { name: "resetKeys", type: "unknown[]", description: "Resets the boundary when any value changes." },
    ],
  },
]
