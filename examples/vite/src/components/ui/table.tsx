import * as React from "react"
import { cn } from "@/lib/utils"

/** Rows are separate recessed strips that slide right and lift on hover. */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div tabIndex={0} role="region" aria-label={props["aria-label"] ?? "Table"} className="-mx-1.5 overflow-x-auto rounded-xl outline-offset-2 max-sm:[mask-image:linear-gradient(to_right,black_82%,transparent)]">
      <table className={cn("w-full min-w-[560px] border-separate border-spacing-x-0 border-spacing-y-1.5", className)} {...props} />
    </div>
  )
}

export function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}

export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "group transition-transform duration-300 ease-spring [tbody_&]:hover:translate-x-1",
        props.onClick && "cursor-pointer",
        className,
      )}
      {...props}
    />
  )
}

export function TableHead({ className, align, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-3 py-1 text-left font-mono text-[10.5px] font-normal uppercase tracking-[.12em] text-muted",
        align === "right" && "text-right",
        className,
      )}
      {...props}
    />
  )
}

export function TableCell({ className, align, mono, ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { mono?: boolean }) {
  return (
    <td
      className={cn(
        "bg-bg px-3 py-[11px] tabular-nums transition-colors duration-300 group-hover:bg-raise",
        "first:rounded-l-xl last:rounded-r-xl",
        mono && "font-mono text-[12.5px]",
        align === "right" && "text-right font-mono",
        className,
      )}
      {...props}
    />
  )
}
