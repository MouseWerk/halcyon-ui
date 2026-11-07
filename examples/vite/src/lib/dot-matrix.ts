/**
 * Dot-matrix glyphs and a tiny particle morph engine.
 * Glyphs live on a GRID x GRID board; each lit cell becomes one particle.
 * Morphing scatters the particles and lets them settle on the next glyph.
 */

export const GRID = 13
const C = (GRID - 1) / 2

export type Glyph = ReadonlyArray<readonly [number, number]>

export function glyph(test: (x: number, y: number) => boolean): Glyph {
  const pts: [number, number][] = []
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (test(x - C, y - C)) pts.push([x, y])
  return pts
}

/** Parse a glyph from rows of "#" and "." (any size up to GRID, centred). */
export function bitmap(rows: string[]): Glyph {
  const ox = Math.floor((GRID - Math.max(...rows.map((r) => r.length))) / 2)
  const oy = Math.floor((GRID - rows.length) / 2)
  const pts: [number, number][] = []
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === "#" && pts.push([x + ox, y + oy])))
  return pts
}

export const glyphs = {
  sun: glyph((x, y) => {
    const d = Math.hypot(x, y)
    if (d <= 2.6) return true
    if (d >= 4.4 && d <= 5.9) {
      const a = Math.atan2(y, x) / (Math.PI / 4)
      return Math.abs(a - Math.round(a)) < 0.16
    }
    return false
  }),
  moon: glyph((x, y) => {
    const inA = Math.hypot(x + 0.6, y) <= 4.9
    const inB = Math.hypot(x - 1.9, y + 1.9) <= 4.0
    return (inA && !inB) || (x === 4 && y === -4) || (x === 5 && y === -1) || (x === 2 && y === -5)
  }),
  diamond: glyph((x, y) => (Math.abs(x) + Math.abs(y)) % 3 === 0 && Math.hypot(x, y) < 6.2),
  check: bitmap([
    "........#",
    ".......##",
    "#.....##.",
    "##...##..",
    ".##.##...",
    "..###....",
    "...#.....",
  ]),
  cross: glyph((x, y) => (Math.abs(x - y) < 1 || Math.abs(x + y) < 1) && Math.abs(x) <= 4),
  bell: bitmap([
    "....#....",
    "..#####..",
    ".#######.",
    ".#######.",
    ".#######.",
    "#########",
    "#########",
    ".........",
    "...###...",
  ]),
  heart: glyph((x, y) => {
    const X = x / 4.6, Y = -(y + 0.6) / 4.6
    return Math.pow(X * X + Y * Y - 1, 3) - X * X * Y * Y * Y <= 0
  }),
  bolt: bitmap([
    ".....##",
    "....##.",
    "...##..",
    "..#####",
    "....##.",
    "...##..",
    "..##...",
    ".##....",
  ]),
  ring: glyph((x, y) => Math.abs(Math.hypot(x, y) - 4.5) < 0.75),
  plus: glyph((x, y) => (Math.abs(x) < 1 || Math.abs(y) < 1) && Math.max(Math.abs(x), Math.abs(y)) <= 4),
} satisfies Record<string, Glyph>

export type GlyphName = keyof typeof glyphs

type Particle = { x: number; y: number; tx: number; ty: number; a: number; ta: number; vx: number; vy: number; d: number }

export interface MorphOptions {
  /** CSS color for the dot core. Defaults to the --hc-ink token. */
  ink?: string
  /** CSS color for the halo. Defaults to the --hc-glow token. */
  glow?: string
  /** Halo strength 0..1 */
  glowAlpha?: number
  reducedMotion?: boolean
}

export function createMorph(canvas: HTMLCanvasElement, initial: Glyph, opts: MorphOptions = {}) {
  const ctx = canvas.getContext("2d")!
  let size = 0, cell = 0, dpr = 1
  const max = Math.max(...Object.values(glyphs).map((g) => g.length)) + 8
  const P: Particle[] = Array.from({ length: max }, () => ({ x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, vx: 0, vy: 0, d: 0 }))
  let current: Glyph = initial
  let running = false
  let raf = 0

  const token = (name: string) => getComputedStyle(canvas).getPropertyValue(name).trim()

  function measure() {
    dpr = Math.max(1, window.devicePixelRatio || 1)
    size = canvas.clientWidth || 24
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    cell = size / GRID
  }

  function target(g: Glyph, burst: boolean) {
    current = g
    P.forEach((p, i) => {
      const t = g[i % g.length]
      p.tx = (t[0] + 0.5) * cell
      p.ty = (t[1] + 0.5) * cell
      p.ta = i < g.length ? 1 : 0
      if (burst) {
        p.d = Math.random() * 14
        const ang = Math.random() * Math.PI * 2
        const sp = (1.2 + Math.random() * 2.8) * (size / 30)
        p.vx = Math.cos(ang) * sp
        p.vy = Math.sin(ang) * sp
      } else {
        p.d = 0
        p.x = p.tx; p.y = p.ty; p.a = p.ta
      }
    })
    kick()
  }

  function frame() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    const ink = opts.ink ?? (token("--hc-ink") || "#222")
    const glow = opts.glow ?? (token("--hc-glow") || "#ffa726")
    const ga = opts.glowAlpha ?? 0.55
    let moving = false
    for (const p of P) {
      if (p.d > 0) {
        p.d--; p.x += p.vx; p.y += p.vy; p.vx *= 0.9; p.vy *= 0.9; moving = true
      } else {
        p.x += (p.tx - p.x) * 0.16
        p.y += (p.ty - p.y) * 0.16
        if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.05) moving = true
      }
      p.a += (p.ta - p.a) * 0.14
      if (Math.abs(p.ta - p.a) > 0.01) moving = true
      if (p.a < 0.02) continue
      ctx.globalAlpha = p.a
      ctx.fillStyle = ink
      ctx.beginPath(); ctx.arc(p.x, p.y, cell * 0.36, 0, Math.PI * 2); ctx.fill()
      if (ga > 0) {
        ctx.globalAlpha = p.a * ga
        ctx.fillStyle = glow
        ctx.beginPath(); ctx.arc(p.x, p.y, cell * 0.5, 0, Math.PI * 2); ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    if (moving) raf = requestAnimationFrame(frame)
    else running = false
  }

  function kick() {
    if (!running) { running = true; raf = requestAnimationFrame(frame) }
  }

  measure()
  target(initial, false)

  return {
    /** Morph to a new glyph (scatter + settle). */
    to(g: Glyph) { target(g, !opts.reducedMotion) },
    /** Repaint, e.g. after a theme change. */
    redraw() { kick() },
    resize() { measure(); target(current, false) },
    destroy() { cancelAnimationFrame(raf); running = false },
  }
}
