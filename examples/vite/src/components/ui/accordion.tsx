"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Ctx = { open: string[]; toggle: (v: string) => void }
const AccCtx = React.createContext<Ctx | null>(null)
const ItemCtx = React.createContext<{ value: string; open: boolean; id: string } | null>(null)

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** "single" closes the others when one opens. */
  type?: "single" | "multiple"
  defaultValue?: string[]
}

export function Accordion({ type = "single", defaultValue = [], className, ...props }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(defaultValue)
  const toggle = React.useCallback((v: string) => {
    setOpen((o) => (o.includes(v) ? o.filter((x) => x !== v) : type === "single" ? [v] : [...o, v]))
  }, [type])
  return (
    <AccCtx.Provider value={{ open, toggle }}>
      <div className={cn("flex flex-col gap-2.5", className)} {...props} />
    </AccCtx.Provider>
  )
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

/** Each item is a raised plate; when open it sinks into the page. */
export function AccordionItem({ value, className, ...props }: AccordionItemProps) {
  const ctx = React.useContext(AccCtx)!
  const open = ctx.open.includes(value)
  const id = React.useId()
  return (
    <ItemCtx.Provider value={{ value, open, id }}>
      <div
        data-state={open ? "open" : "closed"}
        className={cn(
          "rounded-2xl transition-[background-color,box-shadow] duration-500 ease-out-soft",
          open ? "bg-bg shadow-inset" : "bg-surface shadow-raised-sm",
          className,
        )}
        {...props}
      />
    </ItemCtx.Provider>
  )
}

export function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AccCtx)!
  const item = React.useContext(ItemCtx)!
  return (
    <button
      type="button"
      aria-expanded={item.open}
      aria-controls={`${item.id}-c`}
      onClick={() => ctx.toggle(item.value)}
      className={cn("flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left text-sm font-medium", className)}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <span className={cn("grid size-6 place-items-center rounded-lg transition-[rotate,box-shadow,background-color] duration-500 ease-spring", item.open ? "rotate-45 bg-surface shadow-glow" : "bg-bg shadow-inset-sm")}>
        <svg viewBox="0 0 12 12" className={cn("size-2.5", item.open ? "text-glow-ink" : "text-muted")} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 1.5v9M1.5 6h9" /></svg>
      </span>
    </button>
  )
}

/** Height animates with the grid-rows trick, no measuring needed. */
export function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const item = React.useContext(ItemCtx)!
  return (
    <div
      id={`${item.id}-c`}
      role="region"
      className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft", item.open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("px-4 pb-4 text-[13.5px] leading-relaxed text-muted", className)}>{children}</div>
      </div>
    </div>
  )
}
