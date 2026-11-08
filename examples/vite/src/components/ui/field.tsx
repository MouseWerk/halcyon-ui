"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Ctx = { id: string; descId: string; errId: string; invalid: boolean; required?: boolean; hasDesc: boolean; setHasDesc: (v: boolean) => void }
const FieldCtx = React.createContext<Ctx | null>(null)
export const useField = () => React.useContext(FieldCtx)

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Error message; marks the control invalid and announces the message. */
  error?: React.ReactNode
  required?: boolean
  orientation?: "vertical" | "horizontal"
}

/**
 * Form field wiring with zero boilerplate: FieldLabel, FieldControl,
 * FieldDescription and the error message get matching ids, aria-describedby
 * and aria-invalid automatically. Works with any form library.
 */
export function Field({ error, required, orientation = "vertical", className, children, ...props }: FieldProps) {
  const base = React.useId()
  const [hasDesc, setHasDesc] = React.useState(false)
  const invalid = !!error
  const ctx = { id: `${base}-c`, descId: `${base}-d`, errId: `${base}-e`, invalid, required, hasDesc, setHasDesc }
  return (
    <FieldCtx.Provider value={ctx}>
      <div
        data-invalid={invalid || undefined}
        className={cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap items-center justify-between gap-x-4", className)}
        {...props}
      >
        {children}
        {error && (
          <p id={ctx.errId} role="alert" className="m-0 flex basis-full items-center gap-1.5 text-[12.5px] text-bad">
            <span className="size-1.5 shrink-0 rounded-full bg-bad shadow-[0_0_6px_var(--hc-bad)]" />
            {error}
          </p>
        )}
      </div>
    </FieldCtx.Provider>
  )
}

export function FieldLabel({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const f = useField()
  return (
    <label htmlFor={f?.id} className={cn("text-[13px] font-medium text-ink", className)} {...props}>
      {children}
      {f?.required && <span aria-hidden="true" className="ml-1 text-glow-ink">*</span>}
    </label>
  )
}

export function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const f = useField()
  const set = f?.setHasDesc
  React.useEffect(() => { set?.(true); return () => set?.(false) }, [set])
  return <p id={f?.descId} className={cn("m-0 basis-full text-xs leading-relaxed text-muted", className)} {...props} />
}

/** Wraps one control (Input, Select, Switch, your own...) and wires it to the field. */
export function FieldControl({ children }: { children: React.ReactElement<Record<string, unknown>> }) {
  const f = useField()
  if (!f) return children
  const describedBy = [f.hasDesc && f.descId, f.invalid && f.errId, children.props["aria-describedby"]].filter(Boolean).join(" ") || undefined
  return React.cloneElement(children, {
    id: children.props.id ?? f.id,
    "aria-describedby": describedBy,
    "aria-invalid": f.invalid || undefined,
    "aria-required": f.required || undefined,
  })
}

/** Groups related fields under a legend, e.g. "Notifications". */
export function Fieldset({ legend, description, className, children, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement> & { legend?: React.ReactNode; description?: React.ReactNode }) {
  return (
    <fieldset className={cn("m-0 flex min-w-0 flex-col gap-5 border-0 p-0", className)} {...props}>
      {legend && (
        <div className="flex flex-col gap-1">
          <legend className="p-0 text-[15px] font-semibold tracking-tight">{legend}</legend>
          {description && <p className="m-0 text-[13px] text-muted">{description}</p>}
        </div>
      )}
      {children}
    </fieldset>
  )
}
