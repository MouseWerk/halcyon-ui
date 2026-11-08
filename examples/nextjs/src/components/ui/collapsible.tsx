"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useOpenState } from "@/lib/overlay"

type Ctx = { open: boolean; toggle: () => void; id: string }
const CollapsibleCtx = React.createContext<Ctx | null>(null)
const use = () => {
  const c = React.useContext(CollapsibleCtx)
  if (!c) throw new Error("Collapsible parts must be used inside <Collapsible>")
  return c
}

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/** A section that shows and hides its content. Height animates without measuring. */
export function Collapsible({ open, defaultOpen, onOpenChange, className, ...props }: CollapsibleProps) {
  const [o, setO] = useOpenState(open, defaultOpen, onOpenChange)
  const id = React.useId()
  return (
    <CollapsibleCtx.Provider value={{ open: o, toggle: () => setO(!o), id }}>
      <div data-state={o ? "open" : "closed"} className={className} {...props} />
    </CollapsibleCtx.Provider>
  )
}

/** Wraps a single element (usually a Button) and makes it toggle the section. */
export function CollapsibleTrigger({ children }: { children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }> }) {
  const { open, toggle, id } = use()
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => { children.props.onClick?.(e); toggle() },
    ...({ "aria-expanded": open, "aria-controls": id } as object),
  })
}

export function CollapsibleContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, id } = use()
  return (
    <div
      id={id}
      inert={!open || undefined}
      className={cn("grid transition-[grid-template-rows,opacity] duration-500 ease-out-soft", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={className}>{children}</div>
      </div>
    </div>
  )
}

/** A small key with a chevron that turns when open. Handy as a CollapsibleTrigger child. */
export const CollapsibleChevron = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  const { open } = use()
  return (
    <button
      ref={ref}
      type="button"
      aria-label={open ? "Collapse" : "Expand"}
      className={cn("grid size-8 cursor-pointer place-items-center rounded-[10px] bg-surface text-muted shadow-key transition-[scale,box-shadow,color] duration-200 ease-spring hover:text-ink active:scale-90 active:shadow-inset-sm", className)}
      {...props}
    >
      <svg viewBox="0 0 12 12" className={cn("size-3 transition-transform duration-300 ease-spring", open && "rotate-180 text-glow-ink")} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m3 4.5 3 3 3-3" /></svg>
    </button>
  )
})
CollapsibleChevron.displayName = "CollapsibleChevron"
