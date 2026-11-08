"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FileDropProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "title"> {
  /** Called with the accepted files. */
  onFiles: (files: File[]) => void
  /** Same as the input `accept` attribute, e.g. "image/*,.pdf". */
  accept?: string
  multiple?: boolean
  /** Max size per file in bytes. Larger files go to onReject. */
  maxSize?: number
  onReject?: (files: File[]) => void
  disabled?: boolean
  title?: React.ReactNode
  hint?: React.ReactNode
}

function matches(file: File, accept?: string) {
  if (!accept) return true
  return accept.split(",").map((s) => s.trim().toLowerCase()).some((rule) => {
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule)
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
    return file.type.toLowerCase() === rule
  })
}

/**
 * Drop zone: a recessed well with a dot-matrix border. Dragging a file over it
 * lifts the plate and lights the dots. Click or press Enter to browse.
 */
export function FileDrop({ onFiles, accept, multiple = true, maxSize, onReject, disabled, title = "Drop files here", hint, className, ...props }: FileDropProps) {
  const [over, setOver] = React.useState(false)
  const depth = React.useRef(0)
  const input = React.useRef<HTMLInputElement>(null)

  const take = (list: FileList | null) => {
    if (!list) return
    const all = Array.from(list).slice(0, multiple ? undefined : 1)
    const ok = all.filter((f) => matches(f, accept) && (!maxSize || f.size <= maxSize))
    const bad = all.filter((f) => !ok.includes(f))
    if (ok.length) onFiles(ok)
    if (bad.length) onReject?.(bad)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); input.current?.click() } }}
      onDragEnter={(e) => { e.preventDefault(); if (disabled) return; depth.current++; setOver(true) }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) e.dataTransfer.dropEffect = "copy" }}
      onDragLeave={() => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setOver(false) }}
      onDrop={(e) => { e.preventDefault(); depth.current = 0; setOver(false); if (!disabled) take(e.dataTransfer.files) }}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-hc px-6 py-9 text-center",
        "transition-[box-shadow,background-color,translate] duration-500 ease-spring",
        over ? "-translate-y-0.5 bg-surface shadow-raised" : "bg-bg shadow-inset",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {/* dotted border, lit while dragging */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 rounded-[calc(var(--hc-radius)-8px)] transition-opacity duration-300"
        style={{
          backgroundImage: `radial-gradient(circle, ${over ? "var(--hc-glow)" : "var(--hc-dot-off)"} 1.3px, transparent 1.6px)`,
          backgroundSize: "9px 9px",
          WebkitMask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          padding: 3,
        }}
      />
      <span className={cn("grid size-12 place-items-center rounded-2xl transition-[box-shadow,background-color,translate] duration-500 ease-spring", over ? "-translate-y-1 bg-surface shadow-glow" : "bg-surface shadow-raised-sm group-hover:-translate-y-0.5")}>
        <svg viewBox="0 0 24 24" className={cn("size-5 transition-colors", over ? "text-glow-ink" : "text-muted")} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
        </svg>
      </span>
      <div className="relative">
        <div className="text-sm font-medium">{over ? "Release to upload" : title}</div>
        <div className="mt-1 text-xs text-muted">{hint ?? <>or <span className="text-glow-ink underline-offset-2 group-hover:underline">browse</span> from your device</>}</div>
      </div>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => { take(e.target.files); e.target.value = "" }}
      />
    </div>
  )
}
