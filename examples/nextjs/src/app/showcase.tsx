"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Sheet } from "@/components/ui/sheet"
import { Popover } from "@/components/ui/popover"
import { Tooltip } from "@/components/ui/tooltip"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { CommandPalette } from "@/components/ui/command"
import { Segmented } from "@/components/ui/segmented"
import { DotChart } from "@/components/ui/dot-chart"
import { DotIcon } from "@/components/ui/dot-icon"
import { Counter } from "@/components/ui/counter"
import { Pagination } from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Nav, NavItem } from "@/components/ui/nav"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { toast } from "@/components/ui/toast"

export function Showcase() {
  const [page, setPage] = React.useState(2)
  const [range, setRange] = React.useState<"7d" | "12m">("12m")
  return (
    <ErrorBoundary>
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <Tabs defaultValue="form">
            <TabsList><TabsTrigger value="form">Form</TabsTrigger><TabsTrigger value="faq">FAQ</TabsTrigger></TabsList>
            <TabsContent value="form" className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label htmlFor="n">Name</Label><Input id="n" placeholder="Workspace" /></div>
              <Select aria-label="Region" defaultValue="eu" options={[{ value: "eu", label: "Frankfurt" }, { value: "us", label: "Virginia" }]} />
              <Textarea placeholder="Notes" maxLength={120} />
              <Slider defaultValue={40} aria-label="Volume" />
              <RadioGroup defaultValue="pro" orientation="horizontal"><RadioItem value="starter" label="Starter" /><RadioItem value="pro" label="Pro" /></RadioGroup>
              <div className="flex items-center gap-4"><Checkbox label="Updates" defaultChecked /><Switch defaultChecked aria-label="Sync" /></div>
            </TabsContent>
            <TabsContent value="faq">
              <Accordion defaultValue={["a"]}>
                <AccordionItem value="a"><AccordionTrigger>Works with RSC?</AccordionTrigger><AccordionContent>Yes.</AccordionContent></AccordionItem>
                <AccordionItem value="b"><AccordionTrigger>Hydration safe?</AccordionTrigger><AccordionContent>Yes.</AccordionContent></AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            <Dialog>
              <DialogTrigger><Button variant="glow">Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Hello from Next.js</DialogTitle><DialogDescription>Portal, focus trap and scroll lock.</DialogDescription></DialogHeader>
                <DialogFooter><DialogClose><Button>Close</Button></DialogClose></DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet title="Sheet" trigger={<Button>Sheet</Button>}>Content</Sheet>
            <Popover trigger={<Button>Popover</Button>}>Anchored panel</Popover>
            <Tooltip content="Tooltip"><Button>Hover</Button></Tooltip>
            <DropdownMenu trigger={<Button>Menu</Button>} items={[{ label: "Toast", onSelect: () => toast("Hi") }, { type: "separator" }, { label: "Delete", danger: true }]} />
          </div>
          <Segmented value={range} onValueChange={setRange} options={[{ value: "7d", label: "7D" }, { value: "12m", label: "12M" }]} />
          <div className="overflow-x-auto"><DotChart labels={["A", "B", "C", "D", "E", "F"]} values={range === "12m" ? [12, 18, 15, 24, 30, 36] : [3, 5, 4, 6, 8, 7]} unit={range === "12m" ? 3 : 1} /></div>
          <div className="flex items-center gap-4"><DotIcon icon="heart" size={32} /><Counter value={1280} className="text-3xl" /></div>
          <Pagination page={page} pageCount={8} onPageChange={setPage} />
          <div className="flex gap-4">
            <Nav className="w-48"><NavItem active>Overview</NavItem><NavItem count={3}>Orders</NavItem></Nav>
            <ScrollArea className="h-28 flex-1 rounded-xl bg-bg p-2 shadow-inset">{Array.from({ length: 12 }, (_, i) => <div key={i} className="py-1 text-sm">Row {i + 1}</div>)}</ScrollArea>
          </div>
        </Card>
      </div>
      <CommandPalette items={[{ id: "t", label: "Show a toast", onSelect: () => toast("From the palette") }]} />
    </ErrorBoundary>
  )
}
