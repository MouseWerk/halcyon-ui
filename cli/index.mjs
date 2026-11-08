#!/usr/bin/env node
/**
 * halcyon - copy Halcyon UI components into your project (shadcn-style).
 *
 *   npx github:MouseWerk/halcyon-ui init
 *   npx github:MouseWerk/halcyon-ui add theme-switch stat dot-chart
 *   npx github:MouseWerk/halcyon-ui add --all
 *   npx github:MouseWerk/halcyon-ui list
 *
 * No runtime dependencies: Node 18+ only.
 */
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import readline from "node:readline/promises"

const here = path.dirname(fileURLToPath(import.meta.url))
const REG_DIR = path.resolve(here, "..", "registry")
const registry = JSON.parse(fs.readFileSync(path.join(REG_DIR, "registry.json"), "utf8"))
const cwd = process.cwd()
const CONFIG = path.join(cwd, "halcyon.json")
const NPX_CMD = "npx github:MouseWerk/halcyon-ui"

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  glow: (s) => `\x1b[38;5;214m${s}\x1b[0m`,
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  bad: (s) => `\x1b[31m${s}\x1b[0m`,
}

const DEFAULTS = {
  css: "src/styles/halcyon.css",
  ui: "src/components/ui",
  lib: "src/lib",
  hooks: "src/hooks",
}

const exists = (p) => fs.existsSync(path.join(cwd, p))
const firstExisting = (list) => list.find(exists)

function readPkg() {
  try { return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8")) } catch { return {} }
}

/** Work out the framework and sensible default paths for it. */
function detectFramework() {
  const pkg = readPkg()
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const has = (d) => Boolean(deps[d])

  if (has("next") || firstExisting(["next.config.js", "next.config.mjs", "next.config.ts"])) {
    const src = exists("src/app") || exists("src/pages") ? "src/" : ""
    const appRouter = exists(`${src}app`)
    return {
      name: "Next.js",
      defaults: {
        css: appRouter ? `${src}app/halcyon.css` : `${src}styles/halcyon.css`,
        ui: `${src}components/ui`, lib: `${src}lib`, hooks: `${src}hooks`,
      },
      cssEntry: firstExisting([`${src}app/globals.css`, `${src}styles/globals.css`]) ?? `${src}app/globals.css`,
      next: [
        `Add <ThemeScript /> to <head> in ${src}app/layout.tsx and suppressHydrationWarning to <html>.`,
        "Fonts: next/font/google with variable: \"--hc-font-sans\" (Geist), \"--hc-font-mono\" (Geist_Mono), \"--hc-font-dot\" (Doto).",
      ],
    }
  }
  if (has("@react-router/dev") || has("@remix-run/react")) {
    return {
      name: has("@react-router/dev") ? "React Router" : "Remix",
      defaults: { css: "app/halcyon.css", ui: "app/components/ui", lib: "app/lib", hooks: "app/hooks" },
      aliases: { ui: "~/components/ui", lib: "~/lib", hooks: "~/hooks" },
      cssEntry: firstExisting(["app/app.css", "app/tailwind.css", "app/root.css"]) ?? "app/app.css",
      next: ["Render <ThemeScript /> inside <head> in app/root.tsx and add suppressHydrationWarning to <html>."],
    }
  }
  if (has("astro")) {
    return {
      name: "Astro",
      defaults: { css: "src/styles/halcyon.css", ui: "src/components/ui", lib: "src/lib", hooks: "src/hooks" },
      cssEntry: firstExisting(["src/styles/global.css", "src/styles/globals.css"]) ?? "src/styles/global.css",
      next: ["Use client:load on interactive components, e.g. <ThemeSwitch client:load />.", "Paste the theme script from the docs into your layout <head> with is:inline."],
    }
  }
  if (has("vite") || firstExisting(["vite.config.ts", "vite.config.js", "vite.config.mjs"])) {
    return {
      name: "Vite",
      defaults: DEFAULTS,
      cssEntry: firstExisting(["src/index.css", "src/main.css", "src/App.css", "src/styles.css"]) ?? "src/index.css",
      next: ["Paste the theme script from the docs into index.html <head> to avoid a flash on load."],
    }
  }
  return { name: "React", defaults: DEFAULTS, cssEntry: "src/index.css", next: [] }
}

/** Does tsconfig/jsconfig map "@/*"? (comments stripped, rough but dependable) */
function hasAtAlias() {
  for (const f of ["tsconfig.json", "tsconfig.app.json", "jsconfig.json"]) {
    if (!exists(f)) continue
    const txt = fs.readFileSync(path.join(cwd, f), "utf8")
    if (/"@\/\*"\s*:/.test(txt)) return true
  }
  return false
}

/** Insert `@import "<halcyon.css>"` right after the Tailwind import in the CSS entry. */
function patchCssEntry(entry, cssPath) {
  const file = path.join(cwd, entry)
  let rel = path.relative(path.dirname(file), path.join(cwd, cssPath)).replaceAll("\\", "/")
  if (!rel.startsWith(".")) rel = `./${rel}`
  const line = `@import "${rel}";`
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, `@import "tailwindcss";\n${line}\n`)
    console.log(`  ${c.ok("write")} ${entry}`)
    return
  }
  const src = fs.readFileSync(file, "utf8")
  if (src.includes("halcyon.css")) return
  const tw = src.match(/^@import\s+["']tailwindcss["'].*;\s*$/m)
  const out = tw ? src.replace(tw[0], `${tw[0]}\n${line}`) : `@import "tailwindcss";\n${line}\n${src}`
  fs.writeFileSync(file, out)
  console.log(`  ${c.ok("patch")} ${entry} ${c.dim(`(+ ${line})`)}`)
}

function loadConfig() {
  if (!fs.existsSync(CONFIG)) return null
  return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CONFIG, "utf8")) }
}

function detectPM() {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn"
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) return "bun"
  return "npm"
}

function installDeps(deps) {
  const pkgPath = path.join(cwd, "package.json")
  if (!deps.length || !fs.existsSync(pkgPath)) return
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  const have = { ...pkg.dependencies, ...pkg.devDependencies }
  const missing = deps.filter((d) => !have[d])
  if (!missing.length) return
  const pm = detectPM()
  const args = pm === "npm" ? ["install", ...missing] : ["add", ...missing]
  console.log(c.dim(`  ${pm} ${args.join(" ")}`))
  // One command string: avoids the DEP0190 warning and resolves npm.cmd on Windows.
  const r = spawnSync(`${pm} ${args.join(" ")}`, { cwd, stdio: "inherit", shell: true })
  if (r.status !== 0) console.log(c.bad(`  Could not install ${missing.join(", ")}. Install them yourself.`))
}

function targetFor(file, cfg) {
  if (file.startsWith("ui/")) return path.join(cfg.ui, path.basename(file))
  if (file.startsWith("lib/")) return path.join(cfg.lib, path.basename(file))
  if (file.startsWith("hooks/")) return path.join(cfg.hooks, path.basename(file))
  if (file.startsWith("styles/")) return cfg.css
  throw new Error(`Unknown registry path ${file}`)
}

/** Rewrite the registry's "@/..." imports to the user's configured aliases. */
function rewrite(src, cfg) {
  if (!cfg.aliases) return src
  const a = cfg.aliases
  return src
    .replaceAll('"@/components/ui/', `"${a.ui ?? "@/components/ui"}/`)
    .replaceAll('"@/lib/', `"${a.lib ?? "@/lib"}/`)
    .replaceAll('"@/hooks/', `"${a.hooks ?? "@/hooks"}/`)
}

function copy(file, cfg, { overwrite }) {
  const from = path.join(REG_DIR, file)
  const to = path.join(cwd, targetFor(file, cfg))
  const rel = path.relative(cwd, to)
  if (fs.existsSync(to) && !overwrite) {
    console.log(`  ${c.dim("skip")}  ${rel} ${c.dim("(exists, use --overwrite)")}`)
    return
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  const src = fs.readFileSync(from, "utf8")
  fs.writeFileSync(to, file.endsWith(".css") ? src : rewrite(src, cfg))
  console.log(`  ${c.ok("write")} ${rel}`)
}

function resolve(names) {
  const out = new Set()
  const visit = (n) => {
    const item = registry.items[n]
    if (!item) throw new Error(`Unknown component "${n}". Run "halcyon list".`)
    if (out.has(n)) return
    ;(item.registryDependencies ?? []).forEach(visit)
    out.add(n)
  }
  names.forEach(visit)
  return [...out]
}

async function init(flags) {
  const fw = detectFramework()
  console.log(`  ${c.dim("framework")} ${c.bold(fw.name)}`)
  let cfg = loadConfig()
  if (!cfg) {
    cfg = { ...fw.defaults, ...(fw.aliases ? { aliases: fw.aliases } : {}) }
    if (!flags.yes && process.stdin.isTTY) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
      for (const key of ["css", "ui", "lib", "hooks"]) {
        const ans = (await rl.question(`  ${key} path ${c.dim(`(${cfg[key]})`)}: `)).trim()
        if (ans) cfg[key] = ans
      }
      rl.close()
    }
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + "\n")
    console.log(`  ${c.ok("write")} halcyon.json`)
  }
  registry.base.files.forEach((f) => copy(f.path, cfg, flags))
  patchCssEntry(cfg.cssEntry ?? fw.cssEntry, cfg.css)
  installDeps(registry.base.dependencies)

  const tips = [...fw.next]
  if (!cfg.aliases && !hasAtAlias()) {
    tips.unshift(`No "@/*" path alias found. Add to tsconfig.json compilerOptions:  "paths": { "@/*": ["./${cfg.ui.startsWith("src/") ? "src/" : ""}*"] }  (Vite: also add the alias in vite.config).`)
  }
  if (fw.name !== "Next.js") tips.push(`Fonts: Geist, Geist Mono and Doto from Google Fonts (see docs, Installation).`)
  console.log(`
${c.glow("Halcyon UI is set up")} for ${fw.name}.
${tips.map((t, i) => `
  ${i + 1}. ${t}`).join("")}

  Next: ${c.bold(`${NPX_CMD} add theme-switch`)}
`)
}

function add(names, flags) {
  const cfg = loadConfig()
  if (!cfg) {
    console.log(c.bad("  No halcyon.json found. Run init first."))
    process.exit(1)
  }
  if (flags.all) names = Object.keys(registry.items)
  if (!names.length) {
    console.log(c.bad("  Name at least one component, or pass --all."))
    process.exit(1)
  }
  const list = resolve(names)
  const deps = new Set()
  for (const n of list) {
    const item = registry.items[n]
    console.log(c.bold(`  ${n}`))
    item.files.forEach((f) => copy(f, cfg, flags))
    ;(item.dependencies ?? []).forEach((d) => deps.add(d))
  }
  installDeps([...deps])
  console.log(c.glow(`\n  Added ${list.length} component${list.length === 1 ? "" : "s"}.`))
}

function list() {
  const w = Math.max(...Object.keys(registry.items).map((k) => k.length))
  console.log(c.glow("\n  Halcyon UI components\n"))
  for (const [k, v] of Object.entries(registry.items)) console.log(`  ${c.bold(k.padEnd(w))}  ${c.dim(v.description)}`)
  console.log()
}

function help() {
  console.log(`
  ${c.glow("halcyon")} - tactile UI components you own

  ${c.bold("init")}                   write halcyon.json, tokens, utils and theme hook
  ${c.bold("add")} <name...>          copy components (and what they need) into your project
  ${c.bold("add --all")}              copy every component
  ${c.bold("list")}                   show available components

  flags: --overwrite  replace existing files
         --yes        accept default paths
`)
}

const argv = process.argv.slice(2)
const flags = {
  overwrite: argv.includes("--overwrite"),
  yes: argv.includes("--yes") || argv.includes("-y"),
  all: argv.includes("--all"),
}
const [cmd, ...rest] = argv.filter((a) => !a.startsWith("-"))

try {
  if (cmd === "init") await init(flags)
  else if (cmd === "add") add(rest, flags)
  else if (cmd === "list") list()
  else help()
} catch (e) {
  console.error(c.bad(`  ${e.message}`))
  process.exit(1)
}
