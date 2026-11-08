#!/usr/bin/env node
/**
 * Builds a shadcn-compatible registry from registry/registry.json so every
 * component installs with the official CLI:
 *
 *   npx shadcn@latest add https://mousewerk.github.io/halcyon-ui/r/knob.json
 *
 * Output: www/public/r/<name>.json (registry-item schema) and r/registry.json (index).
 * The design tokens ship as the "halcyon" item (cssVars + css), which every
 * component depends on, so the CLI merges them into the project's CSS.
 *
 * Halcyon's `muted` colour means "secondary text", while shadcn's `muted` is a
 * background. To avoid clobbering the host theme, files served here use
 * `hc-muted` instead (same colour, different name).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const REG = path.join(root, "registry")
const OUT = path.join(root, "www", "public", "r")
const BASE_URL = (process.env.REGISTRY_URL ?? "https://mousewerk.github.io/halcyon-ui/r").replace(/\/$/, "")
const registry = JSON.parse(fs.readFileSync(path.join(REG, "registry.json"), "utf8"))

/* ---------- tiny CSS parser: rules -> nested objects ---------- */
function parseCss(src) {
  src = src.replace(/\/\*[\s\S]*?\*\//g, "")
  let i = 0
  function block() {
    const out = []
    let buf = ""
    while (i < src.length) {
      const ch = src[i++]
      if (ch === "{") { out.push({ sel: buf.trim(), body: block() }); buf = "" }
      else if (ch === "}") { if (buf.trim()) out.push({ decl: buf.trim() }); return out }
      else if (ch === ";") { if (buf.trim()) out.push({ decl: buf.trim() }); buf = "" }
      else buf += ch
    }
    if (buf.trim()) out.push({ decl: buf.trim() })
    return out
  }
  return block()
}
const declPair = (d) => { const k = d.indexOf(":"); return [d.slice(0, k).trim(), d.slice(k + 1).trim()] }
function toObject(nodes) {
  const o = {}
  for (const n of nodes) {
    if (n.decl) { const [k, v] = declPair(n.decl); o[k] = v }
    else o[n.sel] = { ...(o[n.sel] ?? {}), ...toObject(n.body) }
  }
  return o
}
const vars = (nodes) => Object.fromEntries(nodes.filter((n) => n.decl?.startsWith("--")).map((n) => { const [k, v] = declPair(n.decl); return [k.slice(2), v] }))

const tree = parseCss(fs.readFileSync(path.join(REG, "styles", "halcyon.css"), "utf8"))
const light = tree.find((n) => n.sel?.startsWith(":root"))
const dark = tree.find((n) => n.sel?.startsWith(".dark"))
const theme = tree.find((n) => n.sel === "@theme inline")

const themeVars = vars(theme.body)
// rename muted, and leave chart slots to shadcn (Halcyon charts read --hc-chart-* directly)
themeVars["color-hc-muted"] = themeVars["color-muted"]
delete themeVars["color-muted"]
for (const k of Object.keys(themeVars)) if (k.startsWith("color-chart-")) delete themeVars[k]

const css = {}
for (const n of theme.body) if (n.sel?.startsWith("@keyframes")) css[n.sel] = toObject(n.body)
for (const n of tree) {
  if (n.sel?.startsWith("@keyframes") || n.sel?.startsWith("@utility")) css[n.sel] = toObject(n.body)
}

/* ---------- items ---------- */
const typeOf = (file) => (file.startsWith("ui/") ? "registry:ui" : file.startsWith("hooks/") ? "registry:hook" : "registry:lib")
const rename = (src) => src.replace(/(?<![\w-])((?:[\w-]+:)*)(text|bg|fill|stroke|border|ring|outline|decoration|caret)-muted(?![\w-])/g, "$1$2-hc-muted")
const fileEntry = (file) => ({
  path: `registry/${file}`,
  content: rename(fs.readFileSync(path.join(REG, file), "utf8")),
  type: typeOf(file),
})
const title = (name) => name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
const url = (name) => `${BASE_URL}/${name}.json`

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })
const write = (name, data) => fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry-item.json", ...data }, null, 2) + "\n")

const baseItem = {
  name: "halcyon",
  type: "registry:style",
  title: "Halcyon UI tokens",
  description: "Design tokens (surfaces, glow, shadows, spring easing, keyframes) and the theme hook. Installed automatically with any component.",
  dependencies: registry.base.dependencies,
  registryDependencies: ["utils"],
  files: [fileEntry("hooks/use-theme.ts")],
  cssVars: { theme: themeVars, light: vars(light.body), dark: vars(dark.body) },
  css,
  docs: "Halcyon tokens added. Dark mode follows the .dark class on <html>; Halcyon's secondary text colour is available as text-hc-muted.",
}
write("halcyon", baseItem)

const index = []
for (const [name, item] of Object.entries(registry.items)) {
  const data = {
    name,
    type: "registry:ui",
    title: title(name),
    description: item.description,
    dependencies: [...new Set([...(registry.base.dependencies ?? []), ...(item.dependencies ?? [])])],
    registryDependencies: [url("halcyon"), ...(item.registryDependencies ?? []).map(url)],
    files: item.files.map(fileEntry),
  }
  write(name, data)
  index.push({ name, type: data.type, title: data.title, description: data.description, registryDependencies: data.registryDependencies, files: data.files.map(({ path: p, type }) => ({ path: p, type })) })
}

fs.writeFileSync(path.join(OUT, "registry.json"), JSON.stringify({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "halcyon-ui",
  homepage: "https://mousewerk.github.io/halcyon-ui/",
  items: [{ name: baseItem.name, type: baseItem.type, title: baseItem.title, description: baseItem.description }, ...index],
}, null, 2) + "\n")

console.log(`shadcn registry: ${index.length + 1} items -> ${path.relative(root, OUT)}`)
