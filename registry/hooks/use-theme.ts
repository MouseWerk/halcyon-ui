"use client"

import * as React from "react"

export type Theme = "light" | "dark"
export const THEME_STORAGE_KEY = "hc-theme"

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return v === "light" || v === "dark" ? v : null
  } catch {
    return null
  }
}

/** Current theme as set on <html> (by ThemeScript, applyTheme or anyone else). */
function snapshot(): Theme {
  const root = document.documentElement
  const attr = root.dataset.theme
  if (attr === "light" || attr === "dark") return attr
  if (root.classList.contains("dark")) return "dark"
  return stored() ?? systemTheme()
}

/**
 * Turn CSS transitions off for one paint while the theme flips. Otherwise
 * every surface animates its colors and shadows at once, which stutters on
 * large screens. Elements inside [data-hc-keep-motion] (the theme switch)
 * keep animating.
 */
function suppressTransitions() {
  const style = document.createElement("style")
  const sel = ":not([data-hc-keep-motion]):not([data-hc-keep-motion] *)"
  style.textContent = `*${sel},*${sel}::before,*${sel}::after{transition:none!important}`
  document.head.appendChild(style)
  return () => {
    void getComputedStyle(document.body).opacity // flush styles with transitions off
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
  }
}

export function applyTheme(theme: Theme, persist = true) {
  const root = document.documentElement
  const restore = suppressTransitions()
  root.dataset.theme = theme
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch { /* storage blocked */ }
  }
  restore()
}

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] })
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const onSystem = () => { if (!stored()) applyTheme(systemTheme(), false) }
  mq.addEventListener("change", onSystem)
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) applyTheme(e.newValue, false)
  }
  window.addEventListener("storage", onStorage)
  return () => {
    obs.disconnect()
    mq.removeEventListener("change", onSystem)
    window.removeEventListener("storage", onStorage)
  }
}

/**
 * Theme state shared through the <html> element. SSR safe: the server renders
 * "light", the client switches to the real theme right after hydration
 * without a mismatch warning. Syncs across tabs and follows the OS setting
 * until the user picks a theme.
 */
export function useTheme() {
  const theme = React.useSyncExternalStore(subscribe, snapshot, () => "light" as Theme)
  const setTheme = React.useCallback((t: Theme) => applyTheme(t), [])
  const toggle = React.useCallback(() => applyTheme(snapshot() === "dark" ? "light" : "dark"), [])
  return { theme, setTheme, toggle }
}

/**
 * Inline script that sets the theme before first paint (no flash).
 * Render it in <head>, e.g. via <ThemeScript /> from theme-switch.
 */
export const themeScript = `(function(){try{var k="${THEME_STORAGE_KEY}",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=document.documentElement;r.dataset.theme=t;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t}catch(e){}})()`
