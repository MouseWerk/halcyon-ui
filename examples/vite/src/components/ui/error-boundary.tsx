"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ErrorBoundaryProps {
  children: React.ReactNode
  /** Custom fallback. Receives the error and a reset function. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  /** Called once per caught error, e.g. to report it. */
  onError?: (error: Error, info: React.ErrorInfo) => void
  /** When any of these change, the boundary resets itself (e.g. the route). */
  resetKeys?: unknown[]
  className?: string
}

type State = { error: Error | null }

/**
 * Safety net for a part of the UI. If something inside throws while
 * rendering, only this part is replaced by a recessed panel with a retry key;
 * the rest of the page keeps working.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
    console.error("[halcyon] ErrorBoundary caught:", error)
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (!this.state.error) return
    const a = prev.resetKeys ?? [], b = this.props.resetKeys ?? []
    if (a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))) this.reset()
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)
    return (
      <div role="alert" className={cn("flex items-center gap-4 rounded-2xl bg-bg p-4 shadow-inset", this.props.className)}>
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface shadow-raised-sm">
          <span className="size-2 rounded-full bg-bad shadow-[0_0_8px_var(--hc-bad)]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">This part could not be shown</div>
          <div className="truncate font-mono text-xs text-muted">{error.message}</div>
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="h-9 shrink-0 cursor-pointer rounded-xl bg-surface px-3.5 text-[13px] font-medium shadow-key transition-[scale,box-shadow] duration-200 ease-spring active:scale-95 active:shadow-inset-sm"
        >
          Try again
        </button>
      </div>
    )
  }
}
