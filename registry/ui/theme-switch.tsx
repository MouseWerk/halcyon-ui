"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { glyphs } from "@/lib/dot-matrix"
import { applyTheme, useTheme, themeScript } from "@/hooks/use-theme"
import { DotIcon } from "@/components/ui/dot-icon"

export interface ThemeSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Use a circular reveal from the switch when the browser supports it. */
  reveal?: boolean
  size?: keyof typeof SIZES
}

const SIZES = {
  sm: { w: 68, h: 38, k: 30, pad: 4, r: 12, icon: 18 },
  md: { w: 116, h: 62, k: 52, pad: 5, r: 20, icon: 30 },
  lg: { w: 180, h: 96, k: 82, pad: 7, r: 30, icon: 48 },
} as const

/**
 * The signature control: a recessed track with a glowing key. The dot-matrix
 * sun bursts into particles and re-forms as a moon, the glow shifts from amber
 * to violet, and the new theme spreads out from the switch.
 */
export function ThemeSwitch({ reveal = true, size = "md", className, style, ...props }: ThemeSwitchProps) {
  const s = SIZES[size]
  const travel = s.w - s.k - s.pad * 2
  const { theme } = useTheme()
  const dark = theme === "dark"
  const ref = React.useRef<HTMLButtonElement>(null)

  function onClick() {
    const next = dark ? "light" : "dark"
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void> | void) => { ready: Promise<void>; finished?: Promise<void> } }
    // WebKit can stall on startViewTransition here (the click lands but the update never runs,
    // seen in CI on desktop and iPad WebKit), so Safari gets the instant swap instead of the reveal.
    const webkit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS/.test(navigator.userAgent)
    // No reveal when it can't be seen (background tab, headless) or isn't wanted.
    if (!reveal || reduced || webkit || !doc.startViewTransition || !ref.current || document.visibilityState !== "visible") {
      applyTheme(next)
      return
    }
    const r = ref.current.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    // Make sure the click always lands, even if the engine skips or drops the update callback.
    const ensure = () => { if (document.documentElement.dataset.theme !== next) applyTheme(next) }
    let vt: { ready: Promise<void>; finished?: Promise<void> }
    try {
      // let React commit the new knob position before the "new" snapshot is taken
      vt = doc.startViewTransition(() => { applyTheme(next); return new Promise<void>((res) => setTimeout(res, 0)) })
    } catch {
      applyTheme(next) // a transition was already running, or the engine refused it
      return
    }
    setTimeout(ensure, 300)
    vt.finished?.then(ensure, ensure)
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 750, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" },
        )
      })
      .catch(() => {})
  }

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={onClick}
      className={cn(
        "group relative shrink-0 cursor-pointer bg-bg shadow-inset ring-1 ring-inset ring-line",
        "transition-[background-color,box-shadow] duration-500",
        className,
      )}
      style={{
        width: s.w, height: s.h, borderRadius: s.r,
        ["--k" as string]: `${s.k}px`,
        // Right = on (dark), left = off (light), like every switch.
        ["--tx" as string]: `${dark ? travel : 0}px`,
        ["--tx-press" as string]: `${dark ? travel - 8 : 0}px`,
        ...style,
      }}
      {...props}
    >
      <span
        className="pointer-events-none absolute rounded-[inherit] bg-[radial-gradient(closest-side,var(--hc-glow-soft),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-55"
        style={{ inset: -s.pad * 3.5 }}
      />
      <span
        className={cn(
          "absolute grid place-items-center",
          "bg-linear-to-br from-raise to-surface shadow-glow",
          "h-(--k) w-(--k) translate-x-(--tx) group-active:w-[calc(var(--k)+8px)] group-active:translate-x-(--tx-press)",
          "transition-[translate,width,box-shadow] duration-[620ms,220ms,500ms] ease-spring",
          "after:pointer-events-none after:absolute after:-inset-px after:rounded-[inherit]",
          "after:bg-[radial-gradient(120%_70%_at_50%_120%,var(--hc-glow-soft),transparent_60%)]",
        )}
        style={{ left: s.pad, top: s.pad, borderRadius: s.r - s.pad + 1 }}
      >
        <DotIcon icon={dark ? glyphs.moon : glyphs.sun} size={s.icon} className="relative z-10" />
      </span>
    </button>
  )
}

/**
 * Sets the theme before first paint so there is no light flash in dark mode.
 * Put it in <head> (Next.js: app/layout.tsx, and add suppressHydrationWarning to <html>).
 */
export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
}
