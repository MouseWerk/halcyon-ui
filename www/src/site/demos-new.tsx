import * as React from "react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup } from "@/components/ui/toggle-group"
import { Chip } from "@/components/ui/chip"
import { Knob } from "@/components/ui/knob"
import { CopyButton } from "@/components/ui/copy-button"
import { NumberInput } from "@/components/ui/number-input"
import { OtpInput } from "@/components/ui/otp-input"
import { PasswordInput } from "@/components/ui/password-input"
import { Combobox } from "@/components/ui/combobox"
import { Calendar, type DateRange } from "@/components/ui/calendar"
import { FileDrop } from "@/components/ui/file-drop"
import { Rating } from "@/components/ui/rating"
import { AvatarGroup } from "@/components/ui/avatar-group"
import { EmptyState } from "@/components/ui/empty-state"
import { Heatmap } from "@/components/ui/heatmap"
import { BarList } from "@/components/ui/bar-list"
import { Timeline } from "@/components/ui/timeline"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Progress } from "@/components/ui/progress"
import { Steps } from "@/components/ui/steps"
import { toast } from "@/components/ui/toast"
import type { DemoEntry } from "./demos"
import { IconBell, IconSearch } from "./icons"

const B = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" /></svg>
const I = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}><path d="M10 5h8M6 19h8M14 5l-4 14" /></svg>
const U = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}><path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" /></svg>
const AlignL = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}><path d="M4 6h16M4 12h10M4 18h13" /></svg>
const AlignC = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}><path d="M4 6h16M7 12h10M5.5 18h13" /></svg>
const AlignR = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" {...p}><path d="M4 6h16M10 12h10M7 18h13" /></svg>

function ToggleDemo() {
  const [on, setOn] = React.useState(true)
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Toggle aria-label="Bold" defaultPressed><B /></Toggle>
      <Toggle aria-label="Italic"><I /></Toggle>
      <Toggle pressed={on} onPressedChange={setOn}><IconBell /> Alerts {on ? "on" : "off"}</Toggle>
    </div>
  )
}

function ToggleGroupDemo() {
  const [fmt, setFmt] = React.useState<string[]>(["bold"])
  const [align, setAlign] = React.useState<string | null>("left")
  return (
    <div className="flex flex-col items-center gap-4">
      <ToggleGroup type="multiple" aria-label="Formatting" value={fmt} onValueChange={setFmt}
        items={[{ value: "bold", label: <B />, "aria-label": "Bold" }, { value: "italic", label: <I />, "aria-label": "Italic" }, { value: "underline", label: <U />, "aria-label": "Underline" }]} />
      <ToggleGroup aria-label="Alignment" value={align} onValueChange={setAlign}
        items={[{ value: "left", label: <AlignL />, "aria-label": "Left" }, { value: "center", label: <AlignC />, "aria-label": "Center" }, { value: "right", label: <AlignR />, "aria-label": "Right" }]} />
      <span className="font-mono text-xs text-muted">[{fmt.join(", ")}] · {align ?? "none"}</span>
    </div>
  )
}

function ChipDemo() {
  const all = ["Design", "Engineering", "Marketing", "Sales", "Support"]
  const [sel, setSel] = React.useState<string[]>(["Design"])
  const [tags, setTags] = React.useState(["react", "tailwind", "dot-matrix"])
  return (
    <div className="flex max-w-md flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2">
        {all.map((t) => <Chip key={t} selected={sel.includes(t)} onSelectedChange={(s) => setSel(s ? [...sel, t] : sel.filter((x) => x !== t))}>{t}</Chip>)}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {tags.map((t) => <Chip key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>#{t}</Chip>)}
        {tags.length === 0 && <Button size="sm" onClick={() => setTags(["react", "tailwind", "dot-matrix"])}>Reset tags</Button>}
      </div>
    </div>
  )
}

function KnobDemo() {
  const [a, setA] = React.useState(64)
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      <Knob label="Volume" value={a} onValueChange={setA} />
      <Knob label="Cutoff" defaultValue={8} min={0} max={20} step={0.5} size={72} dots={17} format={(v) => `${v.toFixed(1)}k`} />
      <Knob label="Mix" defaultValue={30} size={60} dots={13} format={(v) => `${v}%`} />
    </div>
  )
}

function CopyDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-2 rounded-xl bg-bg py-1.5 pl-3.5 pr-1.5 font-mono text-[12.5px] shadow-inset-sm">
        npx halcyon add knob
        <CopyButton value="npx github:MouseWerk/halcyon-ui add knob" onCopied={() => toast("Copied to clipboard")} />
      </div>
      <CopyButton label value="hc_live_8f2a91" />
    </div>
  )
}

function NumberDemo() {
  const [n, setN] = React.useState(3)
  return (
    <div className="flex flex-col items-center gap-4">
      <NumberInput aria-label="Seats" value={n} onValueChange={setN} min={1} max={50} />
      <NumberInput aria-label="Price" defaultValue={9.5} step={0.5} decimals={2} min={0} />
      <span className="font-mono text-xs text-muted">{n} seat{n === 1 ? "" : "s"}</span>
    </div>
  )
}

function OtpDemo() {
  const [state, setState] = React.useState<"idle" | "ok" | "bad">("idle")
  const [v, setV] = React.useState("")
  return (
    <div className="flex flex-col items-center gap-4">
      <OtpInput value={v} groupSize={3} invalid={state === "bad"}
        onValueChange={(x) => { setV(x); setState("idle") }}
        onComplete={(x) => setState(x === "123456" ? "ok" : "bad")} />
      <span className="font-mono text-xs text-muted">{state === "ok" ? "Verified" : state === "bad" ? "Wrong code, try 123456" : "Enter 123456"}</span>
    </div>
  )
}

function ComboDemo() {
  const [v, setV] = React.useState<string | null>("fra")
  const opts = [
    ["ams", "Amsterdam", "eu-west"], ["fra", "Frankfurt", "eu-central"], ["lon", "London", "eu-west"], ["iad", "Virginia", "us-east"],
    ["sfo", "San Francisco", "us-west"], ["sin", "Singapore", "ap-southeast"], ["syd", "Sydney", "ap-southeast"], ["gru", "Sao Paulo", "sa-east"], ["nrt", "Tokyo", "ap-northeast"],
  ].map(([value, label, description]) => ({ value, label, description }))
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <Combobox aria-label="Region" options={opts} value={v} onValueChange={setV} placeholder="Pick a region" className="w-full" />
      <span className="font-mono text-xs text-muted">value: {v ?? "null"}</span>
    </div>
  )
}

function CalendarDemo() {
  const [d, setD] = React.useState<Date | null>(null)
  const [r, setR] = React.useState<DateRange>({ from: null, to: null })
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <div className="flex w-full max-w-[296px] min-w-0 flex-col items-center gap-3">
        <Calendar className="w-full" value={d} onValueChange={setD} isDisabled={(x) => x.getDay() === 0} />
        <span className="font-mono text-xs text-muted">{d ? d.toDateString() : "Pick a day (Sundays are off)"}</span>
      </div>
      <div data-range-calendar className="flex w-full max-w-[296px] min-w-0 flex-col items-center gap-3">
        <Calendar className="w-full" mode="range" range={r} onRangeChange={setR} />
        <span className="font-mono text-xs text-muted">{r.from ? `${r.from.toDateString()} → ${r.to ? r.to.toDateString() : "…"}` : "Pick a range"}</span>
      </div>
    </div>
  )
}

function FileDropDemo() {
  const [files, setFiles] = React.useState<File[]>([])
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FileDrop onFiles={(f) => setFiles((x) => [...x, ...f].slice(-4))} hint="PNG, JPG or PDF up to 5 MB" accept="image/*,.pdf" maxSize={5e6}
        onReject={(f) => toast(`${f.length} file(s) rejected`, { tone: "bad" })} />
      {files.map((f, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2 font-mono text-xs shadow-inset-sm">
          <span className="truncate">{f.name}</span><span className="text-muted">{(f.size / 1024).toFixed(0)} KB</span>
        </div>
      ))}
    </div>
  )
}

function RatingDemo() {
  const [r, setR] = React.useState(4)
  return (
    <div className="flex flex-col items-center gap-4">
      <Rating value={r} onValueChange={setR} size={26} />
      <Rating value={3} readOnly size={16} aria-label="Average rating" />
      <span className="font-mono text-xs text-muted">{r} / 5</span>
    </div>
  )
}

const people = [{ initials: "MK", name: "Maurice" }, { initials: "AV", name: "Ava" }, { initials: "JS", name: "Jonas" }, { initials: "LP", name: "Lena" }, { initials: "RT", name: "Rui" }, { initials: "OB", name: "Ola" }, { initials: "TN", name: "Tim" }]

function heat() {
  let s = 7
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280
  return Array.from({ length: 7 * 30 }, (_, i) => { const r = rnd(); const weekend = i % 7 >= 5; return r < (weekend ? 0.55 : 0.18) ? 0 : Math.round(r * (weekend ? 4 : 12)) })
}
const heatValues = heat()

function ProgressDemo() {
  const [v, setV] = React.useState(42)
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress value={v} />
      <Progress value={86} tone="warn" size="sm" />
      <Progress />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setV(Math.max(0, v - 20))}>Less</Button>
        <Button size="sm" onClick={() => setV(Math.min(100, v + 20))}>More</Button>
      </div>
    </div>
  )
}

function RingDemo() {
  const [v, setV] = React.useState(68)
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <ProgressRing value={v} />
        <ProgressRing value={92} tone="ok" size={72} dots={24} />
        <ProgressRing value={3} max={4} tone="warn" size={72} dots={24}><span className="font-mono text-xs">3/4</span></ProgressRing>
      </div>
      <Button size="sm" onClick={() => setV(Math.round(Math.random() * 100))}>Randomise</Button>
    </div>
  )
}

function StepsDemo() {
  const [c, setC] = React.useState(1)
  const steps = [{ title: "Account", description: "Name and email" }, { title: "Workspace", description: "Pick a region" }, { title: "Billing", description: "Choose a plan" }, { title: "Done" }]
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <Steps steps={steps} current={c} onStepClick={setC} />
      <div className="flex gap-2">
        <Button size="sm" disabled={c === 0} onClick={() => setC(c - 1)}>Back</Button>
        <Button size="sm" variant="glow" disabled={c === steps.length} onClick={() => setC(c + 1)}>Next</Button>
      </div>
    </div>
  )
}

export const newDemos: DemoEntry[] = [
  {
    name: "toggle", title: "Toggle", group: "Controls",
    description: "A key that stays down. Off it is raised; on it sinks into the surface, picks up the glow and lights a small LED.",
    Demo: ToggleDemo,
    usage: `import { Toggle } from "@/components/ui/toggle"

<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
  <BoldIcon />
</Toggle>`,
    props: [
      { name: "pressed / defaultPressed", type: "boolean", description: "Controlled or initial state." },
      { name: "onPressedChange", type: "(pressed: boolean) => void", description: "Called with the next state." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Key size." },
    ],
  },
  {
    name: "toggle-group", title: "Toggle Group", group: "Controls",
    description: "Keys in a recessed rail. Single mode works like a clearable radio set, multiple mode like a row of toggles. Arrow keys move between keys.",
    Demo: ToggleGroupDemo,
    usage: `import { ToggleGroup } from "@/components/ui/toggle-group"

<ToggleGroup type="multiple" value={fmt} onValueChange={setFmt}
  items={[{ value: "bold", label: <B />, "aria-label": "Bold" }, ...]} />`,
    props: [
      { name: "type", type: '"single" | "multiple"', default: '"single"', description: "Selection mode." },
      { name: "items", type: "{ value, label, aria-label?, disabled? }[]", description: "The keys." },
      { name: "value / defaultValue", type: "string | null  |  string[]", description: "Depends on type." },
      { name: "onValueChange", type: "(value) => void", description: "Called with the new selection." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Key size." },
    ],
  },
  {
    name: "chip", title: "Chip", group: "Controls",
    description: "Compact pill for filters and tags. Selected chips sink and their dot lights up; removable chips get a small recessed x key (Backspace works too).",
    Demo: ChipDemo,
    usage: `import { Chip } from "@/components/ui/chip"

<Chip selected={on} onSelectedChange={setOn}>Design</Chip>
<Chip onRemove={() => remove(tag)}>#react</Chip>`,
    props: [
      { name: "selected", type: "boolean", description: "Makes it a selectable filter chip." },
      { name: "onSelectedChange", type: "(selected: boolean) => void", description: "Called when toggled." },
      { name: "onRemove", type: "() => void", description: "Shows the remove key." },
      { name: "icon", type: "ReactNode", description: "Leading icon, replaces the dot." },
    ],
  },
  {
    name: "knob", title: "Knob", group: "Controls",
    description: "A rotary dial like on a hardware synth. Drag up or down, scroll while focused, or use the arrow keys. A ring of dots lights up with the value.",
    Demo: KnobDemo,
    usage: `import { Knob } from "@/components/ui/knob"

<Knob label="Volume" value={vol} onValueChange={setVol} />`,
    props: [
      { name: "value / defaultValue", type: "number", default: "50", description: "Controlled or initial value." },
      { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "Range." },
      { name: "size", type: "number", default: "88", description: "Diameter in px." },
      { name: "dots", type: "number", default: "21", description: "Dots in the ring." },
      { name: "label", type: "ReactNode", description: "Caption under the value." },
      { name: "format", type: "(v: number) => string", description: "Value formatter." },
    ],
  },
  {
    name: "copy-button", title: "Copy Button", group: "Controls",
    description: "A raised key that copies text. The icon swaps to a check that draws itself in. Falls back to execCommand where the Clipboard API is blocked.",
    Demo: CopyDemo,
    usage: `import { CopyButton } from "@/components/ui/copy-button"

<CopyButton value={apiKey} onCopied={() => toast("Copied")} />`,
    props: [
      { name: "value", type: "string | () => string", description: "Text to copy." },
      { name: "label", type: "boolean", description: "Show a Copy / Copied label." },
      { name: "timeout", type: "number", default: "1600", description: "Copied state length in ms." },
      { name: "onCopied", type: "(text: string) => void", description: "Called after a successful copy." },
    ],
  },
  {
    name: "number-input", title: "Number Input", group: "Forms",
    description: "A stepper: a dot-matrix number between two raised keys. Hold a key to repeat (it speeds up), type a value, or use the arrow and Page keys.",
    Demo: NumberDemo,
    usage: `import { NumberInput } from "@/components/ui/number-input"

<NumberInput aria-label="Seats" value={seats} onValueChange={setSeats} min={1} max={50} />`,
    props: [
      { name: "value / defaultValue", type: "number", default: "0", description: "Controlled or initial value." },
      { name: "min / max / step", type: "number", description: "Range and increment." },
      { name: "decimals", type: "number", default: "0", description: "Fraction digits." },
      { name: "onValueChange", type: "(v: number) => void", description: "Called with the new value." },
    ],
  },
  {
    name: "otp-input", title: "OTP Input", group: "Forms",
    description: "One-time code wells. Typing moves forward, Backspace moves back, pasting fills every slot, and SMS autofill works because it is one real input.",
    Demo: OtpDemo,
    usage: `import { OtpInput } from "@/components/ui/otp-input"

<OtpInput length={6} groupSize={3} onComplete={verify} />`,
    props: [
      { name: "length", type: "number", default: "6", description: "Number of slots." },
      { name: "value / defaultValue", type: "string", description: "Controlled or initial code." },
      { name: "onComplete", type: "(code: string) => void", description: "Fires when every slot is filled." },
      { name: "pattern", type: "RegExp", default: "/^[0-9]$/", description: "Allowed characters." },
      { name: "groupSize", type: "number", description: "Dot separator after every n slots." },
      { name: "invalid", type: "boolean", description: "Red ring on every well." },
    ],
  },
  {
    name: "password-input", title: "Password Input", group: "Forms",
    description: "A recessed password field with a reveal key and an optional four-dot strength meter. Bring your own scoring if you use zxcvbn.",
    Demo: () => <div className="w-full max-w-xs"><PasswordInput strength placeholder="Create a password" aria-label="Password" /></div>,
    usage: `import { PasswordInput } from "@/components/ui/password-input"

<PasswordInput strength placeholder="Create a password" />`,
    props: [
      { name: "strength", type: "boolean", default: "false", description: "Show the strength meter." },
      { name: "score", type: "(value: string) => 0..4", description: "Custom scoring function." },
      { name: "...props", type: "InputHTMLAttributes", description: "Passed to the input." },
    ],
  },
  {
    name: "combobox", title: "Combobox", group: "Forms",
    description: "A searchable select. Type to filter, matches are highlighted, arrows move, Enter picks and Escape restores the last value.",
    Demo: ComboDemo,
    usage: `import { Combobox } from "@/components/ui/combobox"

<Combobox options={regions} value={region} onValueChange={setRegion} placeholder="Pick a region" />`,
    props: [
      { name: "options", type: "{ value, label, description?, disabled? }[]", description: "Choices; label is searched." },
      { name: "value / defaultValue", type: "string | null", description: "Controlled or initial value." },
      { name: "onValueChange", type: "(v: string | null) => void", description: "Called on pick." },
      { name: "emptyText", type: "ReactNode", default: '"No matches"', description: "Shown when nothing matches." },
    ],
  },
  {
    name: "calendar", title: "Calendar", group: "Forms",
    description: "A month grid. Today has a glowing dot and the selected day is a raised glowing key. Arrow keys, Page Up/Down and Home/End move like a native picker.",
    Demo: CalendarDemo,
    usage: `import { Calendar } from "@/components/ui/calendar"

<Calendar value={date} onValueChange={setDate} min={new Date()} />`,
    props: [
      { name: "mode", type: '"single" | "range"', default: '"single"', description: "Pick one day or a start and end." },
      { name: "range / defaultRange / onRangeChange", type: "{ from, to }", description: "Range mode value." },
      { name: "value / defaultValue", type: "Date | null", description: "Selected day." },
      { name: "onValueChange", type: "(date: Date) => void", description: "Called on pick." },
      { name: "min / max", type: "Date", description: "Selectable range." },
      { name: "isDisabled", type: "(date: Date) => boolean", description: "Disable specific days." },
      { name: "weekStartsOn", type: "0 | 1", default: "1", description: "Sunday or Monday." },
      { name: "locale", type: "string", description: "Month and weekday names." },
    ],
  },
  {
    name: "file-drop", title: "File Drop", group: "Forms",
    description: "A drop zone. Drag a file over it and the plate lifts while its dotted border lights up. Click or press Enter to browse; accept and size are checked for you.",
    Demo: FileDropDemo,
    usage: `import { FileDrop } from "@/components/ui/file-drop"

<FileDrop accept="image/*,.pdf" maxSize={5e6} onFiles={upload} onReject={warn} />`,
    props: [
      { name: "onFiles", type: "(files: File[]) => void", description: "Accepted files." },
      { name: "accept", type: "string", description: 'Like the input attribute, e.g. "image/*,.pdf".' },
      { name: "maxSize", type: "number", description: "Max bytes per file." },
      { name: "onReject", type: "(files: File[]) => void", description: "Files that failed the checks." },
      { name: "multiple", type: "boolean", default: "true", description: "Allow several files." },
    ],
  },
  {
    name: "rating", title: "Rating", group: "Forms",
    description: "Stars drawn from dots. Hover previews, click sets (click the same star again to clear), arrow keys adjust. Read-only for display.",
    Demo: RatingDemo,
    usage: `import { Rating } from "@/components/ui/rating"

<Rating value={stars} onValueChange={setStars} />`,
    props: [
      { name: "value / defaultValue", type: "number", default: "0", description: "Current rating." },
      { name: "max", type: "number", default: "5", description: "Number of stars." },
      { name: "readOnly", type: "boolean", description: "Display only." },
      { name: "size", type: "number", default: "22", description: "Star size in px." },
    ],
  },
  {
    name: "avatar-group", title: "Avatar Group", group: "Surfaces",
    description: "Overlapping avatars. Each one lifts on hover; extras collapse into a recessed +N chip.",
    Demo: () => <div className="flex flex-col items-center gap-4"><AvatarGroup people={people} /><AvatarGroup people={people.slice(0, 3)} size={28} /></div>,
    usage: `import { AvatarGroup } from "@/components/ui/avatar-group"

<AvatarGroup people={[{ initials: "MK", name: "Maurice" }, ...]} max={4} />`,
    props: [
      { name: "people", type: "{ initials?, src?, name? }[]", description: "Who to show." },
      { name: "max", type: "number", default: "4", description: "Visible avatars before +N." },
      { name: "size", type: "number", default: "34", description: "Avatar size." },
    ],
  },
  {
    name: "empty-state", title: "Empty State", group: "Surfaces",
    description: "For an empty list or a search with no results: a dot-matrix glyph in a well, one line of text and an action.",
    Demo: () => <EmptyState className="w-full max-w-md" icon="bell" title="No notifications" description="You are all caught up. New alerts will show up here." action={<><Button size="sm">Settings</Button><Button size="sm" variant="glow">Refresh</Button></>} />,
    usage: `import { EmptyState } from "@/components/ui/empty-state"

<EmptyState icon="bell" title="No notifications" description="You are all caught up." action={<Button>Refresh</Button>} />`,
    props: [
      { name: "icon", type: "GlyphName | Glyph", default: '"diamond"', description: "Dot glyph." },
      { name: "title", type: "ReactNode", description: "Headline." },
      { name: "description", type: "ReactNode", description: "Supporting text." },
      { name: "action", type: "ReactNode", description: "Buttons or links." },
    ],
  },
  {
    name: "heatmap", title: "Heatmap", group: "Data",
    description: "A dot-matrix heatmap, e.g. a year of activity. Dot size and glow grow with the value; columns fade in one after another.",
    Demo: () => <div className="w-full overflow-hidden"><Heatmap values={heatValues} rowLabels={["Mon", "", "Wed", "", "Fri", "", "Sun"]} label={(v, i) => `${v} deploys, day ${i + 1}`} /></div>,
    usage: `import { Heatmap } from "@/components/ui/heatmap"

<Heatmap values={dailyDeploys} rows={7} rowLabels={["Mon", "", "Wed", "", "Fri", "", ""]} />`,
    props: [
      { name: "values", type: "number[]", description: "Cell values, column by column." },
      { name: "rows", type: "number", default: "7", description: "Cells per column." },
      { name: "levels", type: "number", default: "4", description: "Intensity steps." },
      { name: "label", type: "(v, i) => string", description: "Tooltip text." },
      { name: "cell / gap", type: "number", default: "12 / 4", description: "Sizing in px." },
    ],
  },
  {
    name: "bar-list", title: "Bar List", group: "Data",
    description: "A ranked list with dot bars, for top pages, referrers or regions. Bars grow in with a stagger and the leader glows.",
    Demo: () => <BarList className="w-full max-w-md" items={[{ label: "/docs/installation", value: 4210 }, { label: "/", value: 9820 }, { label: "/docs/components/knob", value: 2380 }, { label: "/examples/dashboard", value: 3120 }, { label: "/docs/theming", value: 1240 }]} />,
    usage: `import { BarList } from "@/components/ui/bar-list"

<BarList items={[{ label: "/", value: 9820 }, { label: "/docs", value: 4210 }]} />`,
    props: [
      { name: "items", type: "{ label, value, icon?, href? }[]", description: "Rows." },
      { name: "format", type: "(v: number) => string", description: "Value formatter." },
      { name: "sort", type: "boolean", default: "true", description: "Largest first." },
    ],
  },
  {
    name: "timeline", title: "Timeline", group: "Data",
    description: "An activity feed. Entries hang off a dotted rail with a status LED in a recessed socket.",
    Demo: () => (
      <Timeline className="w-full max-w-md" items={[
        { title: "Deploy 0.4.13 finished", description: "All 41 checks passed.", time: "2 min ago", tone: "ok" },
        { title: "Webhook retries climbing", description: "3 endpoints responding slowly.", time: "18 min ago", tone: "warn" },
        { title: "Ava joined the workspace", time: "1 h ago", tone: "glow" },
        { title: "Search index rebuilt", time: "Yesterday", icon: <IconSearch /> },
      ]} />
    ),
    usage: `import { Timeline } from "@/components/ui/timeline"

<Timeline items={[{ title: "Deploy finished", time: "2 min ago", tone: "ok" }]} />`,
    props: [
      { name: "items", type: "{ title, description?, time?, tone?, icon? }[]", description: "Entries, newest first." },
      { name: "animate", type: "boolean", default: "true", description: "Staggered entrance." },
    ],
  },
  {
    name: "progress-ring", title: "Progress Ring", group: "Data",
    description: "Circular progress: a ring of dots around a recessed dial. Dots light up one by one; the leading dot glows.",
    Demo: RingDemo,
    usage: `import { ProgressRing } from "@/components/ui/progress-ring"

<ProgressRing value={68} />`,
    props: [
      { name: "value / max", type: "number", default: "— / 100", description: "Progress." },
      { name: "size", type: "number", default: "96", description: "Diameter in px." },
      { name: "dots", type: "number", default: "32", description: "Dots in the ring." },
      { name: "tone", type: '"glow" | "ok" | "warn" | "bad"', default: '"glow"', description: "Color." },
      { name: "children", type: "ReactNode", description: "Center content (defaults to %)." },
    ],
  },
  {
    name: "progress", title: "Progress", group: "Feedback",
    description: "Linear progress in a recessed track. The fill is a run of lit dots that glides to its value; without a value it becomes a comet sweeping across.",
    Demo: ProgressDemo,
    usage: `import { Progress } from "@/components/ui/progress"

<Progress value={42} />
<Progress /> {/* indeterminate */}`,
    props: [
      { name: "value", type: "number", description: "0..max. Omit for indeterminate." },
      { name: "max", type: "number", default: "100", description: "Upper bound." },
      { name: "tone", type: '"glow" | "ok" | "warn" | "bad"', default: '"glow"', description: "Color." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track height." },
    ],
  },
  {
    name: "steps", title: "Steps", group: "Navigation",
    description: "Progress through a multi-step flow. Finished steps are lit (and clickable if you want), the current one glows, upcoming ones stay recessed.",
    Demo: StepsDemo,
    usage: `import { Steps } from "@/components/ui/steps"

<Steps current={1} onStepClick={setStep} steps={[{ title: "Account" }, { title: "Workspace" }, { title: "Billing" }]} />`,
    props: [
      { name: "steps", type: "{ title, description? }[]", description: "The steps." },
      { name: "current", type: "number", description: "Index of the current step." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Layout." },
      { name: "onStepClick", type: "(i: number) => void", description: "Makes finished steps clickable." },
    ],
  },
]
